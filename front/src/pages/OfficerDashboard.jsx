import React, { useState, useEffect, useRef, useCallback } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";

const API = process.env.REACT_APP_API_URL.replace("/api", "");
const socket = io(API, { transports: ["websocket"], withCredentials: true });

// CRITICAL: Must match the configuration on the Pensioner side exactly.
const ICE_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
};

const OfficerCallCenter = () => {
  const [user] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState("idle");

  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (myVideo.current) myVideo.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access failed:", err);
    }
  }, []);

  useEffect(() => {
    initCamera();

    socket.on("incomingCall", (data) => {
      setIncomingCall(data);
      setCallStatus("incoming");
      socket.emit("joinRoom", { roomId: data.roomId });
    });

    socket.on("offer", ({ offer, roomId }) => {
      const peer = new Peer({
        initiator: false, // Officer is the receiver
        trickle: false,   // Must match the pensioner
        stream: streamRef.current,
        config: ICE_CONFIG
      });

      peer.on("signal", (signal) => {
        // Send the answer back to the pensioner
        socket.emit("answer", { roomId, answer: signal });
      });

      peer.on("stream", (remoteStream) => {
        if (remoteVideo.current) remoteVideo.current.srcObject = remoteStream;
        setCallStatus("connected");
      });

      peer.on("error", (err) => console.error("Peer Error:", err));

      // Accept the offer from the pensioner
      peer.signal(offer);
      peerRef.current = peer;
    });

    socket.on("callEnded", () => {
      cleanupPeer();
    });

    return () => {
      socket.off("incomingCall");
      socket.off("offer");
      socket.off("callEnded");
    };
  }, [initCamera]);

  const cleanupPeer = () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setCallStatus("idle");
    setIncomingCall(null);
  };

  const acceptCall = () => {
    if (!incomingCall) return;
    setCallStatus("connected");
    // The actual WebRTC connection is triggered by the 'offer' event handler above
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">የፖሊስ ጥሪ ማዕከል</h2>

      <div className="relative w-full h-[400px] bg-black rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
        <video ref={remoteVideo} autoPlay playsInline className="w-full h-full object-cover" />
        <video ref={myVideo} autoPlay muted playsInline className="absolute bottom-4 left-4 w-32 h-40 bg-gray-700 rounded-lg border-2 border-white object-cover" />
      </div>

      <div className="mt-6 flex gap-4">
        {callStatus === "incoming" && (
          <button onClick={acceptCall} className="bg-green-600 px-8 py-3 rounded-full font-bold animate-bounce">
            ጥሪ ተቀበል
          </button>
        )}
        {(callStatus === "connected" || callStatus === "incoming") && (
          <button onClick={cleanupPeer} className="bg-red-600 px-8 py-3 rounded-full font-bold">
            ጥሪ ዝጋ
          </button>
        )}
      </div>

      <div className="mt-4 text-gray-400">
        Status: <span className="text-blue-400">{callStatus}</span>
      </div>
    </div>
  );
};

export default OfficerCallCenter;
