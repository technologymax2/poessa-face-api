import React, { useState, useEffect, useRef, useCallback } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";

const API = process.env.REACT_APP_API_URL.replace("/api", "");
const socket = io(API, { transports: ["websocket"], withCredentials: true });

const OfficerCallCenter = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState("idle");

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => { streamRef.current = stream; if (myVideo.current) myVideo.current.srcObject = stream; });

    socket.emit("registerOfficer", { officerId: user._id, name: user.fullName });
    socket.on("incomingCall", (data) => { setIncomingCall(data); setCallStatus("incoming"); });
    socket.on("offer", ({ offer }) => {
      const peer = new Peer({ initiator: false, trickle: false, stream: streamRef.current });
      peer.on("signal", (data) => socket.emit("answer", { roomId: incomingCall.roomId, answer: data }));
      peer.on("stream", (stream) => { if (remoteVideo.current) remoteVideo.current.srcObject = stream; });
      peer.signal(offer);
      peerRef.current = peer;
    });
  }, [incomingCall]);

  const acceptCall = () => {
    socket.emit("acceptCall", { roomId: incomingCall.roomId, officerId: user._id });
    setCallStatus("connected");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">የፖሊስ ጥሪ ማዕከል</h2>
      <div className="relative w-full h-[400px] bg-black rounded-xl overflow-hidden">
        <video ref={remoteVideo} autoPlay playsInline className="w-full h-full object-cover" />
        <video ref={myVideo} autoPlay muted playsInline className="absolute bottom-4 left-4 w-32 h-40 bg-gray-700 rounded-lg border-2 border-white object-cover" />
      </div>
      {callStatus === "incoming" && (
        <button onClick={acceptCall} className="mt-4 bg-green-600 px-8 py-3 rounded-full font-bold">ጥሪ ተቀበል</button>
      )}
    </div>
  );
};
export default OfficerCallCenter;
