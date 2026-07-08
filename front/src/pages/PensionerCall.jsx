import React, { useState, useEffect, useRef, useCallback } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";

const API = process.env.REACT_APP_API_URL || "https://poessa-digital-services-1.onrender.com";
const socket = io(API, { transports: ["websocket", "polling"] });

const PensionerCall = () => {
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  const [fayda, setFayda] = useState("");
  const [calling, setCalling] = useState(false);
  const [statusMessage, setStatusMessage] = useState(""); // አዲስ ስቴት
  const [callConnected, setCallConnected] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [callTime, setCallTime] = useState(0);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [roomId, setRoomId] = useState("");

  const initializeCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (myVideo.current) myVideo.current.srcObject = stream;
    } catch (err) { alert("ካሜራ እና ማይክሮፎን መዳረሻ ተከልክሏል"); }
  }, []);

  useEffect(() => {
    initializeCamera();
    
    // ሶኬት ኢቨንቶች
    socket.on("callAccepted", ({ signal }) => {
      peerRef.current?.signal(signal);
      setCallConnected(true);
      setStatusMessage("ጥሪው ተገናኝቷል");
    });

    // ባለሙያ ካልተገኘ የሚመጣ መልዕክት
    socket.on("noAvailableOfficer", () => {
      setStatusMessage("ሁሉም ባለሙያዎች ጥሪ በማስተናገድ ላይ ናቸው፣ እባክዎ ትንሽ ይጠብቁ...");
    });

    socket.on("callEnded", () => window.location.reload());
    socket.on("chatMessage", (msg) => setMessages((prev) => [...prev, msg]));

    return () => socket.off();
  }, [initializeCamera]);

  const startCall = () => {
    if (!fayda) return alert("እባክዎ የፋይዳ ቁጥር ያስገቡ");
    const room = `ROOM-${Date.now()}`;
    setRoomId(room);
    setCalling(true);
    setStatusMessage("ባለሙያ በመፈለግ ላይ...");
    
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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-3xl font-bold mb-4">POESSA Video Verification</h1>
      
      {!calling ? (
        <div className="bg-gray-800 p-6 rounded-lg">
          <input value={fayda} onChange={(e) => setFayda(e.target.value)} placeholder="የፋይዳ ቁጥር" className="w-full p-3 mb-4 text-black rounded" />
          <button onClick={startCall} className="w-full bg-blue-600 p-4 rounded font-bold">Call Verification Officer</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {/* ጥሪ እየጠበቀ ከሆነ የሚያሳይ መልዕክት */}
          {!callConnected && <div className="p-4 bg-yellow-600 rounded text-center animate-pulse">{statusMessage}</div>}
          
          <div className="relative h-96 bg-black rounded">
            <video ref={remoteVideo} autoPlay className="w-full h-full object-cover" />
            <video ref={myVideo} autoPlay muted className="absolute bottom-2 right-2 w-24 h-32 bg-gray-700 rounded" />
          </div>
          
          <div className="flex justify-between items-center bg-gray-800 p-4 rounded">
            <button onClick={() => {streamRef.current.getVideoTracks()[0].enabled = !cameraOn; setCameraOn(!cameraOn);}} className="bg-blue-600 p-2 rounded">Cam {cameraOn ? "ON" : "OFF"}</button>
            <button onClick={() => {streamRef.current.getAudioTracks()[0].enabled = !micOn; setMicOn(!micOn);}} className="bg-blue-600 p-2 rounded">Mic {micOn ? "ON" : "OFF"}</button>
            <button onClick={endCall} className="bg-red-600 p-2 rounded">End Call</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PensionerCall;
