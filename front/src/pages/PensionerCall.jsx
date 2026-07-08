import React, { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

// Backend URL-ህን በትክክል አስገባ
const API = process.env.REACT_APP_API_URL || "https://poessa-digital-services-1.onrender.com";
const socket = io(API, { transports: ["websocket", "polling"] });

const PensionerCall = () => {
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
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
    
    // Socket Events
    socket.on("callAccepted", () => setCallConnected(true));
    socket.on("callEnded", () => { window.location.reload(); });
    socket.on("chatMessage", (msg) => setMessages((prev) => [...prev, msg]));

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      socket.disconnect();
    };
  }, [initializeCamera]);

  const startCall = () => {
    const room = `ROOM-${Date.now()}`;
    setRoomId(room);
    setCalling(true);
    socket.emit("requestCall", { roomId: room, pensionerId: fayda });
  };

  const endCall = () => {
    socket.emit("endCall", { roomId, officerId: null });
    window.location.reload();
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">POESSA Video Verification</h1>
      {!calling ? (
        <div className="bg-gray-800 p-8 rounded-xl">
          <input value={fayda} onChange={(e) => setFayda(e.target.value)} placeholder="Enter Fayda Number" className="text-black p-3 w-full mb-5" />
          <button onClick={startCall} className="bg-blue-600 w-full py-3 rounded-lg font-bold">Call Officer</button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative">
            <video ref={remoteVideo} autoPlay playsInline className="rounded-xl bg-black w-full h-[500px]" />
            <video ref={myVideo} autoPlay muted playsInline className="absolute bottom-4 right-4 w-44 rounded-xl border-4" />
          </div>
          <div className="bg-gray-800 p-4 rounded-xl">
            <div className="flex justify-between mb-4">
              <button onClick={toggleCamera} className="bg-blue-600 p-3 rounded">Camera {cameraOn ? "ON" : "OFF"}</button>
              <button onClick={toggleMic} className="bg-blue-600 p-3 rounded">Mic {micOn ? "ON" : "OFF"}</button>
              <button onClick={endCall} className="bg-red-700 px-6 py-2 rounded">End Call</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PensionerCall;
