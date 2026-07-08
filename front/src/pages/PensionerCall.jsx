import React, { useState, useEffect, useRef, useCallback } from "react";
import Peer from "simple-peer";
import { io } from "socket.io-client";

const API = process.env.REACT_APP_API_URL || "https://poessa-digital-services-1.onrender.com";
const socket = io(API, { transports: ["websocket", "polling"] });

const PensionerCall = () => {
  // --- References ---
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  // --- States (ጠይቀሃቸው የነበሩት በሙሉ) ---
  const [fayda, setFayda] = useState("");
  const [calling, setCalling] = useState(false);
  const [callConnected, setCallConnected] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [callTime, setCallTime] = useState(0);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState("");

  // --- Camera Initialization ---
  const initializeCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (myVideo.current) myVideo.current.srcObject = stream;
    } catch (err) { alert("ካሜራ እና ማይክሮፎን መዳረሻ ተከልክሏል"); }
  }, []);

  useEffect(() => {
    initializeCamera();
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      socket.disconnect();
    };
  }, [initializeCamera]);

  // --- Socket Logic ---
  useEffect(() => {
    socket.on("callAccepted", ({ signal }) => {
      peerRef.current?.signal(signal);
      setCallConnected(true);
    });

    socket.on("callEnded", () => window.location.reload());
    socket.on("chatMessage", (msg) => setMessages((prev) => [...prev, msg]));

    return () => {
      socket.off("callAccepted");
      socket.off("callEnded");
      socket.off("chatMessage");
    };
  }, []);

  // --- Call Timer ---
  useEffect(() => {
    let timer;
    if (callConnected) timer = setInterval(() => setCallTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [callConnected]);

  // --- Functions ---
  const startCall = () => {
    const room = `ROOM-${Date.now()}`;
    setRoomId(room);
    setCalling(true);
    
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
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">POESSA Video Verification</h1>
      
      {!calling ? (
        <div className="bg-gray-800 p-6 rounded-lg">
          <input value={fayda} onChange={(e) => setFayda(e.target.value)} placeholder="የፋይዳ ቁጥር ያስገቡ" className="w-full p-3 mb-4 text-black rounded" />
          <button onClick={startCall} className="w-full bg-blue-600 p-4 rounded font-bold">Call Verification Officer</button>
        </div>
      ) : (
        <div className="grid gap-4">
          <div className="relative h-96 bg-black rounded">
            <video ref={remoteVideo} autoPlay className="w-full h-full object-cover" />
            <video ref={myVideo} autoPlay muted className="absolute bottom-2 right-2 w-24 h-32 bg-gray-700 rounded" />
          </div>
          
          <div className="flex justify-between items-center bg-gray-800 p-4 rounded">
            <button onClick={toggleCamera} className="bg-blue-600 p-2 rounded">Cam {cameraOn ? "ON" : "OFF"}</button>
            <button onClick={toggleMic} className="bg-blue-600 p-2 rounded">Mic {micOn ? "ON" : "OFF"}</button>
            <button onClick={endCall} className="bg-red-600 p-2 rounded">End Call</button>
          </div>
          
          <div className="bg-gray-800 p-4 rounded">
            <p className="text-sm">Call Duration: {Math.floor(callTime / 60)}:{callTime % 60}</p>
            <div className="h-24 overflow-y-auto my-2 border-b border-gray-600">
              {messages.map((m, i) => <div key={i}><b>{m.sender}:</b> {m.message}</div>)}
            </div>
            <input value={message} onChange={(e) => setMessage(e.target.value)} className="w-full p-2 text-black rounded" placeholder="Message..." />
            <button onClick={sendMessage} className="mt-2 bg-green-600 w-full p-2 rounded">Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PensionerCall;
