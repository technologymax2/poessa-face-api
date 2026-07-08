import React, { useState, useEffect, useRef, useCallback } from "react";
import Peer from "simple-peer";
import { io } from "socket.io-client";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "https://poessa-digital-services-1.onrender.com";
const socket = io(API, { transports: ["websocket", "polling"] });

const PensionerCall = () => {
  // References
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  // Unified States
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

  // Socket Events
  useEffect(() => {
    socket.on("callAccepted", ({ signal }) => {
      peerRef.current?.signal(signal);
      setCallConnected(true);
    });

    socket.on("callEnded", () => {
      peerRef.current?.destroy();
      setCalling(false);
      setCallConnected(false);
    });

    socket.on("chatMessage", (msg) => setMessages((prev) => [...prev, msg]));

    return () => {
      socket.off("callAccepted");
      socket.off("callEnded");
      socket.off("chatMessage");
    };
  }, []);

  // Timer logic
  useEffect(() => {
    let timer;
    if (callConnected) timer = setInterval(() => setCallTime((prev) => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [callConnected]);

  const startCall = () => {
    const room = `ROOM-${Date.now()}`;
    setRoomId(room);
    setCalling(true);
    
    const peer = new Peer({ initiator: true, trickle: false, stream: streamRef.current });
    peer.on("signal", (signal) => socket.emit("startCall", { roomId: room, signal }));
    peer.on("stream", (stream) => { if (remoteVideo.current) remoteVideo.current.srcObject = stream; });
    peerRef.current = peer;
  };

  const endCall = () => {
    socket.emit("endCall", { roomId });
    peerRef.current?.destroy();
    setCalling(false);
    setCallConnected(false);
  };

  // Toggle & Message logic
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-blue-900 text-white p-5 shadow"><h1 className="text-3xl font-bold">POESSA Video Verification</h1></div>
      <div className="max-w-7xl mx-auto p-6">
        {!calling ? (
          <div className="bg-white rounded-xl shadow p-8">
            <input value={fayda} onChange={(e) => setFayda(e.target.value)} placeholder="Enter Fayda Number" className="border rounded-lg p-3 w-full mb-5" />
            <button onClick={startCall} className="bg-blue-700 text-white px-6 py-3 rounded-lg">Call Officer</button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="relative">
              <video ref={remoteVideo} autoPlay playsInline className="rounded-xl bg-black w-full h-[500px]" />
              <video ref={myVideo} autoPlay muted playsInline className="absolute bottom-4 right-4 w-44 rounded-xl border-4" />
            </div>
            {/* Controls and Chat UI remain here */}
          </div>
        )}
      </div>
    </div>
  );
};

export default PensionerCall;
