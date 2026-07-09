import React, { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";

const API = process.env.REACT_APP_API_URL.replace("/api", "");
const socket = io(API, { transports: ["websocket"], withCredentials: true });

// CRITICAL: For international calls, replace STUN with a paid TURN service
// if your connection remains stuck in 'checking' or 'failed'.
const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
};

const PensionerCall = () => {
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const roomIdRef = useRef(null);

  const [callStatus, setCallStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("ለመጀመር ዝግጁ");

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        streamRef.current = stream;
        if (myVideo.current) myVideo.current.srcObject = stream;
      })
      .catch((err) => console.error("Camera access failed:", err));

    socket.on("answer", ({ answer }) => {
      // Receive the officer's answer and complete the handshake
      if (peerRef.current) peerRef.current.signal(answer);
    });

    socket.on("callEnded", () => {
      cleanupPeer();
      setStatusMessage("ጥሪው ተቋርጧል");
    });

    return () => {
      socket.off("answer");
      socket.off("callEnded");
    };
  }, []);

  const cleanupPeer = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setCallStatus("idle");
  };

  const startCall = () => {
    setCallStatus("waiting");
    setStatusMessage("ለሰራተኛ በመደወል ላይ...");

    const roomId = `room_${socket.id}`;
    roomIdRef.current = roomId;
    socket.emit("joinRoom", { roomId });
    socket.emit("requestCall", { roomId, pensionerId: socket.id });

    // Initialize Peer
    const peer = new Peer({
      initiator: true,
      trickle: false, // Wait for all ICE candidates to gather
      stream: streamRef.current,
      config: ICE_CONFIG
    });

    peer.on("signal", (data) => {
      // With trickle: false, this event fires once the offer is ready
      socket.emit("offer", { roomId, offer: data });
    });

    peer.on("stream", (remoteStream) => {
      if (remoteVideo.current) remoteVideo.current.srcObject = remoteStream;
      setCallStatus("connected");
      setStatusMessage("ጥሪው ተገናኝቷል");
    });

    peer.on("error", (err) => console.error("Peer Error:", err));

    peerRef.current = peer;
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-4 flex flex-col items-center">
      <h1 className="text-xl font-bold mb-4">POESSA Verification</h1>
      
      <div className="relative w-full h-[400px] bg-black rounded-xl overflow-hidden border border-gray-700">
        <video ref={remoteVideo} autoPlay playsInline className="w-full h-full object-cover" />
        <video ref={myVideo} autoPlay muted playsInline className="absolute bottom-4 left-4 w-32 h-40 bg-gray-700 rounded-lg border-2 border-white object-cover" />
      </div>

      <div className="mt-6 text-blue-400">{statusMessage}</div>

      {callStatus === "idle" && (
        <button onClick={startCall} className="mt-4 bg-blue-600 px-8 py-3 rounded-full font-bold">
          📞 ጥሪ ጀምር
        </button>
      )}

      {(callStatus === "waiting" || callStatus === "connected") && (
        <button onClick={cleanupPeer} className="mt-4 bg-red-600 px-8 py-3 rounded-full font-bold">
          ጥሪ ዝጋ
        </button>
      )}
    </div>
  );
};

export default PensionerCall;
