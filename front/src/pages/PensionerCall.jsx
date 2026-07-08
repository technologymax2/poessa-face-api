import React, { useState, useEffect, useRef, useCallback } from "react";
import Peer from "simple-peer";
import { io } from "socket.io-client";

const API = process.env.REACT_APP_API_URL || "https://poessa-digital-services-1.onrender.com";
const socket = io(API, { transports: ["websocket", "polling"] });

const PensionerCall = () => {
  // References
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  // States
  const [fayda, setFayda] = useState("");
  const [calling, setCalling] = useState(false);
  const [callConnected, setCallConnected] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [callTime, setCallTime] = useState(0);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState("");

  const initializeCamera = useCallback(async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = media;
      if (myVideo.current) myVideo.current.srcObject = media;
    } catch (err) { alert("Camera permission denied."); }
  }, []);

  useEffect(() => {
    initializeCamera();
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      socket.disconnect();
    };
  }, [initializeCamera]);

  useEffect(() => {
    socket.on("callAccepted", () => setCallConnected(true));
    socket.on("callEnded", () => {
      peerRef.current?.destroy();
      setCalling(false);
      setCallConnected(false);
      window.location.reload();
    });
    socket.on("chatMessage", (msg) => setMessages((prev) => [...prev, msg]));

    return () => {
      socket.off("callAccepted");
      socket.off("callEnded");
      socket.off("chatMessage");
    };
  }, []);

  useEffect(() => {
    let timer;
    if (callConnected) timer = setInterval(() => setCallTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [callConnected]);

  const startCall = () => {
    const room = `ROOM-${Date.now()}`;
    setRoomId(room);
    setCalling(true);
    socket.emit("requestCall", { roomId: room, pensionerId: fayda });
    
    const peer = new Peer({ initiator: true, trickle: false, stream: streamRef.current });
    peer.on("signal", (signal) => socket.emit("offer", { roomId: room, offer: signal }));
    peer.on("stream", (stream) => { if (remoteVideo.current) remoteVideo.current.srcObject = stream; });
    peerRef.current = peer;
  };

  const endCall = () => {
    socket.emit("endCall", { roomId, officerId: null });
    peerRef.current?.destroy();
    setCalling(false);
    setCallConnected(false);
  };

  const toggleCamera = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCameraOn(track.enabled); }
    socket.emit(track.enabled ? "cameraOn" : "cameraOff", { roomId });
  };

  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
    socket.emit(track.enabled ? "micOn" : "micOff", { roomId });
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("chatMessage", { roomId, message, sender: "Pensioner" });
    setMessages((prev) => [...prev, { sender: "You", message }]);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">POESSA Video Verification</h1>
      {!calling ? (
        <div className="bg-gray-800 p-8 rounded-xl shadow-lg">
          <input value={fayda} onChange={(e) => setFayda(e.target.value)} placeholder="Enter Fayda Number" className="text-black rounded-lg p-3 w-full mb-5" />
          <button onClick={startCall} className="bg-blue-600 w-full py-3 rounded-lg font-bold">Call Officer</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative">
            <video ref={remoteVideo} autoPlay playsInline className="rounded-xl bg-black w-full h-[500px]" />
            <video ref={myVideo} autoPlay muted playsInline className="absolute bottom-4 right-4 w-44 rounded-xl border-4 border-white" />
          </div>
          <div className="bg-gray-800 p-4 rounded-xl">
            <div className="flex justify-between mb-4">
              <button onClick={toggleCamera} className={`p-3 rounded ${cameraOn ? 'bg-blue-600' : 'bg-red-600'}`}>Camera</button>
              <button onClick={toggleMic} className={`p-3 rounded ${micOn ? 'bg-blue-600' : 'bg-red-600'}`}>Mic</button>
              <button onClick={endCall} className="bg-red-700 px-6 py-2 rounded">End Call</button>
            </div>
            <div className="h-64 overflow-y-auto bg-gray-700 p-2 rounded mb-4">
              {messages.map((m, i) => <p key={i}><strong>{m.sender}:</strong> {m.message}</p>)}
            </div>
            <input value={message} onChange={(e) => setMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} className="text-black w-full p-2 rounded" placeholder="Type a message..." />
          </div>
        </div>
      )}
    </div>
  );
};

export default PensionerCall;
