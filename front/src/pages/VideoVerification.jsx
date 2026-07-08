import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import io from "socket.io-client";
import { searchPensioner } from "../services/api";

const socket = io(process.env.REACT_APP_API_URL);

const VideoVerification = () => {
  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerConnection = useRef(null);
  const localStream = useRef(null);

  const [loading, setLoading] = useState(false);
  const [faydaNumber, setFaydaNumber] = useState("");
  const [pensioner, setPensioner] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [callStarted, setCallStarted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [callTime, setCallTime] = useState(0);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  
  const officer = JSON.parse(localStorage.getItem("user") || "{}");

  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  useEffect(() => {
    socket.emit("register", { userId: officer._id, role: "OFFICER" });
    startCamera();
    return () => {
      if (localStream.current) localStream.current.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    let timer;
    if (callStarted) timer = setInterval(() => setCallTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [callStarted]);

  // Socket Listeners
  useEffect(() => {
    socket.on("offer", async ({ offer }) => {
      peerConnection.current = new RTCPeerConnection(configuration);
      localStream.current.getTracks().forEach(track => peerConnection.current.addTrack(track, localStream.current));
      
      peerConnection.current.ontrack = (event) => { remoteVideo.current.srcObject = event.streams[0]; };
      peerConnection.current.onicecandidate = (e) => { if (e.candidate) socket.emit("iceCandidate", { roomId, candidate: e.candidate }); };

      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit("answer", { roomId, answer });
    });

    socket.on("answer", async ({ answer }) => {
      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on("iceCandidate", async ({ candidate }) => {
      if (peerConnection.current) await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on("chatMessage", (data) => setMessages((prev) => [...prev, data]));

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("iceCandidate");
      socket.off("chatMessage");
    };
  }, [roomId]);

  // --- Functions ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStream.current = stream;
      if (localVideo.current) localVideo.current.srcObject = stream;
    } catch (err) { alert("Camera/Mic access denied."); }
  };

  const search = async () => {
    if (!faydaNumber) return alert("Enter Fayda Number");
    try {
      setLoading(true);
      const res = await searchPensioner(faydaNumber);
      setPensioner(res.data.data);
    } catch (err) { alert(err.response?.data?.message || "Pensioner not found."); }
    finally { setLoading(false); }
  };

  const createRoom = async () => {
    if (!pensioner) return alert("Search pensioner first.");
    const room = `ROOM-${Date.now()}`;
    setRoomId(room);
    socket.emit("createRoom", { roomId: room, officerId: officer._id });
    setCallStarted(true);
  };

  const toggleCamera = () => {
    const enabled = !cameraOn;
    localStream.current.getVideoTracks().forEach(t => t.enabled = enabled);
    setCameraOn(enabled);
    socket.emit(enabled ? "cameraOn" : "cameraOff", { roomId });
  };

  const toggleMic = () => {
    const enabled = !micOn;
    localStream.current.getAudioTracks().forEach(t => t.enabled = enabled);
    setMicOn(enabled);
    socket.emit(enabled ? "micOn" : "micOff", { roomId });
  };

  const captureEvidence = () => {
    if (!localVideo.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = localVideo.current.videoWidth;
    canvas.height = localVideo.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(localVideo.current, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL("image/jpeg");
    socket.emit("captureEvidence", { roomId, image });
    alert("Evidence captured successfully.");
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("chatMessage", { roomId, sender: officer.fullName, message });
    setMessage("");
  };

  const endCall = () => {
    if (peerConnection.current) peerConnection.current.close();
    socket.emit("endCall", { roomId, officerId: officer._id });
    setCallStarted(false);
    alert("Verification session ended.");
  };

  return (
    <>
      <Navbar />
      {loading && <Loader fullScreen text="Loading..." />}
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-3xl font-bold text-blue-700 mb-6">Live Video Verification</h2>
          
          <div className="flex gap-3 mb-6">
            <input type="text" placeholder="Enter Fayda Number" value={faydaNumber} onChange={(e)=>setFaydaNumber(e.target.value)} className="flex-1 border rounded-lg p-3"/>
            <button onClick={search} className="bg-blue-700 text-white px-6 rounded-lg">Search</button>
          </div>

          {pensioner && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-bold text-xl">{pensioner.nameEng}</h3>
              <p>Fayda : {pensioner.faydaNumber}</p>
              <button onClick={createRoom} className="mt-4 bg-green-600 text-white px-5 py-2 rounded-lg">Start Video Verification</button>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <div><h3 className="font-bold mb-2">Officer</h3><video ref={localVideo} autoPlay muted playsInline className="rounded-xl border w-full h-80 bg-black"/></div>
            <div><h3 className="font-bold mb-2">Pensioner</h3><video ref={remoteVideo} autoPlay playsInline className="rounded-xl border w-full h-80 bg-black"/></div>
          </div>

          {callStarted && (
            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={toggleCamera} className="bg-indigo-600 text-white px-5 py-2 rounded-lg">{cameraOn ? "Turn Camera Off" : "Turn Camera On"}</button>
              <button onClick={toggleMic} className="bg-yellow-600 text-white px-5 py-2 rounded-lg">{micOn ? "Mute Mic" : "Unmute Mic"}</button>
              <button onClick={captureEvidence} className="bg-purple-700 text-white px-5 py-2 rounded-lg">Capture Evidence</button>
              <button onClick={endCall} className="bg-red-700 text-white px-5 py-2 rounded-lg">End Call</button>
            </div>
          )}

          <div className="mt-8">
            <h3 className="font-bold text-xl mb-3">Live Chat</h3>
            <div className="border rounded-lg h-56 overflow-y-auto p-3">
              {messages.map((msg, index) => (<div key={index} className="mb-2"><strong>{msg.sender}</strong><p>{msg.message}</p></div>))}
            </div>
            <div className="flex mt-3">
              <input value={message} onChange={(e)=>setMessage(e.target.value)} className="flex-1 border rounded-l-lg p-3" placeholder="Type message..."/>
              <button onClick={sendMessage} className="bg-blue-700 text-white px-6 rounded-r-lg">Send</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VideoVerification;