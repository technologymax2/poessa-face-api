import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Loader from "../components/Loader";

// ሰርቨርን ማገናኘት
const socket = io(process.env.REACT_APP_API_URL.replace("/api", ""));

const PatientVideoCall = () => {
  const { roomId } = useParams();

  const localVideo = useRef(null);
  const remoteVideo = useRef(null);
  const localStream = useRef(null);
  const peerConnection = useRef(null);

  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [callTime, setCallTime] = useState(0);

  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // 1. ካሜራ እና WebRTC ማዋቀር
  useEffect(() => {
    const initialize = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStream.current = stream;
        if (localVideo.current) localVideo.current.srcObject = stream;

        peerConnection.current = new RTCPeerConnection(configuration);

        stream.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, stream);
        });

        peerConnection.current.ontrack = (event) => {
          if (remoteVideo.current) remoteVideo.current.srcObject = event.streams[0];
        };

        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", { roomId, candidate: event.candidate });
          }
        };

        socket.emit("join-room", roomId);
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("ካሜራውን ወይም ማይክሮፎኑን ማግኘት አልተቻለም።");
      }
    };

    initialize();

    // ሲግናሊንግ ክስተቶች
    socket.on("offer", async (offer) => {
      if (!peerConnection.current) return;
      await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit("answer", { roomId, answer });
    });

    socket.on("answer", async (answer) => {
      await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(answer));
      setConnected(true);
    });

    socket.on("ice-candidate", async (candidate) => {
      try {
        if (peerConnection.current) await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (err) { console.error("Error adding ice candidate:", err); }
    });

    socket.on("chat-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("chat-message");
      if (peerConnection.current) peerConnection.current.close();
    };
  }, [roomId]);

  // 2. ተግባራት
  const startCall = async () => {
    if (!peerConnection.current) return;
    const offer = await peerConnection.current.createOffer();
    await peerConnection.current.setLocalDescription(offer);
    socket.emit("offer", { roomId, offer });
  };

  const toggleCamera = () => {
    const track = localStream.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCameraOn(track.enabled); }
  };

  const toggleMic = () => {
    const track = localStream.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    const data = { roomId, sender: "Patient", message, time: new Date().toLocaleTimeString() };
    socket.emit("chat-message", data);
    setMessages((prev) => [...prev, data]);
    setMessage("");
  };

  const leaveCall = () => {
    localStream.current?.getTracks().forEach(track => track.stop());
    peerConnection.current?.close();
    socket.disconnect();
    window.close();
  };

  useEffect(() => {
    const timer = setInterval(() => setCallTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-5">
      {loading && <Loader fullScreen text="ካሜራ እየተከፈተ ነው..." />}
      
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold">የታካሚ የቪዲዮ ጥሪ</h1>
        <div className="text-green-400 font-bold">{connected ? "🟢 የተገናኘ" : "🟡 በመጠባበቅ ላይ..."}</div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h2 className="mb-2 font-bold">እርስዎ</h2>
          <video ref={localVideo} autoPlay muted playsInline className="rounded-xl w-full bg-black" />
        </div>
        <div>
          <h2 className="mb-2 font-bold">ሀኪም</h2>
          <video ref={remoteVideo} autoPlay playsInline className="rounded-xl w-full bg-black" />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-6">
        <button onClick={startCall} className="bg-green-600 px-6 py-3 rounded-lg">ጥሪ ጀምር</button>
        <button onClick={toggleCamera} className="bg-blue-600 px-6 py-3 rounded-lg">{cameraOn ? "ካሜራ አጥፋ" : "ካሜራ አብራ"}</button>
        <button onClick={toggleMic} className="bg-yellow-600 px-6 py-3 rounded-lg">{micOn ? "ድምፅ አጥፋ" : "ድምፅ አብራ"}</button>
        <button onClick={leaveCall} className="bg-red-600 px-6 py-3 rounded-lg">ውጣ</button>
      </div>

      <div className="mt-5 text-lg">የቆይታ ጊዜ : {Math.floor(callTime / 60)} ደቂቃ {callTime % 60} ሰከንድ</div>

      <div className="mt-8 bg-white text-black rounded-xl p-4">
        <h2 className="font-bold mb-3">ቻት</h2>
        <div className="h-56 overflow-y-auto border rounded p-3">
          {messages.map((msg, index) => (
            <div key={index} className="mb-2"><strong>{msg.sender} :</strong> {msg.message}</div>
          ))}
        </div>
        <div className="flex mt-3">
          <input className="border flex-1 p-2 rounded-l" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="መልእክት ፃፍ..." />
          <button onClick={sendMessage} className="bg-blue-700 text-white px-5 rounded-r">ላክ</button>
        </div>
      </div>
    </div>
  );
};

export default PatientVideoCall;
