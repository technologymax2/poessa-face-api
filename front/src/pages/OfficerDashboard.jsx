import React, { useState, useEffect, useRef, useCallback } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";

const API = process.env.REACT_APP_API_URL.replace("/api", "");
const socket = io(API, { transports: ["websocket"], withCredentials: true });

const OfficerCallCenter = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
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
    } catch (err) { console.error("Camera error:", err); }
  }, []);

  useEffect(() => {
    initCamera();

    // 1. መረጃውን ያረጋግጡ
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!storedUser._id) {
      console.error("❌ User ID missing! ኦፊሰሩ አልተመዘገበም");
      return;
    }

    // 2. ኦፊሰሩን ይመዝግቡ
    socket.emit("registerOfficer", {
      officerId: storedUser._id,
      name: storedUser.fullName
    });

    // 3. የኢቨንት ሃንድለሮች
    socket.on("incomingCall", (data) => {
      setIncomingCall(data);
      setCallStatus("incoming");
    });

    socket.on("offer", ({ offer }) => {
      const peer = new Peer({ initiator: false, trickle: false, stream: streamRef.current });
      peer.on("signal", (signal) => socket.emit("answer", { roomId: incomingCall.roomId, answer: signal }));
      peer.on("stream", (stream) => { if (remoteVideo.current) remoteVideo.current.srcObject = stream; });
      peer.signal(offer);
      peerRef.current = peer;
    });

    return () => {
      socket.off("incomingCall");
      socket.off("offer");
    };
  }, [initCamera, incomingCall?.roomId]);

  const acceptCall = () => {
    if (!incomingCall) return;
    socket.emit("acceptCall", { roomId: incomingCall.roomId, officerId: user._id });
    setCallStatus("connected");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">የፖሊስ ጥሪ ማዕከል</h2>
      <div className="relative w-full h-[400px] bg-black rounded-xl overflow-hidden border border-gray-700">
        <video ref={remoteVideo} autoPlay playsInline className="w-full h-full object-cover" />
        <video ref={myVideo} autoPlay muted playsInline className="absolute bottom-4 left-4 w-32 h-40 bg-gray-700 rounded-lg border-2 border-white object-cover" />
      </div>
      <div className="mt-6">
        {callStatus === "incoming" && (
          <button onClick={acceptCall} className="bg-green-600 px-8 py-3 rounded-full font-bold">ጥሪ ተቀበል</button>
        )}
      </div>
      <div className="mt-4 text-blue-400">Status: {callStatus}
