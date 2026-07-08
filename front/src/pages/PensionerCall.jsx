import React, { useState, useEffect, useRef, useCallback } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";

const API = process.env.REACT_APP_API_URL || "https://poessa-digital-services-1.onrender.com";
const socket = io(API, { transports: ["websocket", "polling"] });

const PensionerCall = () => {
  // --- Refs ---
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  // --- States (ጠየቅከው የነበረው ሙሉ ዝርዝር) ---
  const [fayda, setFayda] = useState("");
  const [calling, setCalling] = useState(false);
  const [callConnected, setCallConnected] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [callTime, setCallTime] = useState(0);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState("");
  const [callStatus, setCallStatus] = useState("idle"); // idle, searching, connected

  // --- Functions ---
  const initMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (myVideo.current) myVideo.current.srcObject = stream;
    } catch (err) { alert("ካሜራ ወይም ማይክሮፎን መጠቀም አልተቻለም"); }
  }, []);

  useEffect(() => {
    initMedia();
    socket.on("callAccepted", ({ signal }) => {
      peerRef.current?.signal(signal);
      setCallConnected(true);
      setCallStatus("connected");
    });
    socket.on("noAvailableOfficer", () => {
      alert("ሁሉም ሰራተኞች ስራ ላይ ናቸው፣ እባክዎ ይጠብቁ");
      setCallStatus("idle");
      setCalling(false);
    });
    socket.on("chatMessage", (msg) => setMessages((prev) => [...prev, msg]));
    return () => socket.off();
  }, [initMedia]);

  // Call Timer
  useEffect(() => {
    let timer;
    if (callConnected) timer = setInterval(() => setCallTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [callConnected]);

  const startCall = () => {
    if (!fayda) return alert("እባክዎ ፋይዳ ቁጥር ያስገቡ");
    const room = `ROOM-${Date.now()}`;
    setRoomId(room);
    setCalling(true);
    setCallStatus("searching");

    const peer = new Peer({ initiator: true, trickle: false, stream: streamRef.current });
    peer.on("signal", (signal) => socket.emit("requestCall", { roomId: room, pensionerId: fayda, signal }));
    peer.on("stream", (stream) => { if (remoteVideo.current) remoteVideo.current.srcObject = stream; });
    peerRef.current = peer;
  };

  const endCall = () => {
    socket.emit("endCall", { roomId });
    peerRef.current?.destroy();
    window.location.reload();
  };

  const toggleCamera = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCameraOn(track.enabled); }
  };

  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("chatMessage", { roomId, message, sender: "Pensioner" });
    setMessages((prev) => [...prev, { sender: "You", message }]);
    setMessage("");
  };

  // --- UI Render ---
  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">POESSA Video Verification</h1>
      
      {callStatus === "idle" && (
        <div className="bg-gray-800 p-6 rounded-xl">
          <input value={fayda} onChange={(e) => setFayda(e.target.value)} placeholder="የፋይዳ ቁጥር" className="w-full p-4 mb-4 text-black rounded" />
          <button onClick={startCall} className="w-full bg-blue-600 p-4 rounded font-bold text-lg">Call Verification Officer</button>
        </div>
      )}

      {(callStatus === "searching" || callStatus === "connected") && (
        <div className="flex-1 flex flex-col gap-4">
          <div className="relative flex-1 bg-black rounded-xl overflow-hidden">
            <video ref={remoteVideo} autoPlay playsInline className="w-full h-full object-cover" />
            <video ref={myVideo} autoPlay muted playsInline className="absolute bottom-4 right-4 w-24 h-32 bg-gray-600 rounded-lg border-2 border-white" />
          </div>
          
          {callStatus === "searching" && <div className="text-center text-yellow-500 font-bold p-2">ሁሉም ሰራተኞች ጥሪ በማስተናገድ ላይ ናቸው...</div>}
          
          <div className="flex justify-between bg-gray-800 p-4 rounded-xl">
            <button onClick={toggleCamera} className="bg-blue-600 px-5 py-3 rounded-full font-bold">Cam {cameraOn ? "ON" : "OFF"}</button>
            <button onClick={toggleMic} className="bg-blue-600 px-5 py-3 rounded-full font-bold">Mic {micOn ? "ON" : "OFF"}</button>
            <button onClick={endCall} className="bg-red-600 px-5 py-3 rounded-full font-bold">End Call</button>
          </div>

          <div className="bg-gray-800 p-4 rounded-xl">
            <div className="h-20 overflow-y-auto mb-2 text-sm">
              {messages.map((m, i) => <div key={i}><b>{m.sender}:</b> {m.message}</div>)}
            </div>
            <input value={message} onChange={(e) => setMessage(e.target.value)} className="w-full p-2 text-black rounded" placeholder="Message..." />
            <button onClick={sendMessage} className="mt-2 w-full bg-green-600 p-2 rounded">Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PensionerCall;
