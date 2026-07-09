import React, { useState, useEffect, useRef, useCallback } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";

const API = process.env.REACT_APP_API_URL.replace("/api", "");
const socket = io(API, { transports: ["websocket"], withCredentials: true });

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
      console.error("Camera error:", err);
    }
  }, []);

  useEffect(() => {
    initCamera();

    if (!user._id) {
      console.error("❌ Officer not registered (User ID missing)!");
      return;
    }

    socket.emit("registerOfficer", {
      officerId: user._id,
      name: user.fullName,
    });

    socket.on("incomingCall", (data) => {
      console.log("📞 New call incoming:", data);
      setIncomingCall(data);
      setCallStatus("incoming");
      // Join the room immediately, BEFORE accepting, so we don't miss the offer
      // that the pensioner sends as soon as they place the call.
      socket.emit("joinRoom", { roomId: data.roomId });
    });

    socket.on("offer", ({ offer, roomId }) => {
      console.log("🤝 Offer received, setting up peer for room:", roomId);

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: streamRef.current,
      });

      peer.on("signal", (signal) => {
        // Use the roomId that came with the event, not stale React state
        socket.emit("answer", { roomId, answer: signal });
      });

      peer.on("stream", (remoteStream) => {
        if (remoteVideo.current) remoteVideo.current.srcObject = remoteStream;
      });

      peer.on("error", (err) => {
        console.error("Peer connection error:", err);
      });

      peer.on("close", () => {
        peerRef.current = null;
      });

      peer.signal(offer);
      peerRef.current = peer;
    });

    socket.on("callEnded", () => {
      peerRef.current?.destroy();
      peerRef.current = null;
      setCallStatus("idle");
      setIncomingCall(null);
    });

    return () => {
      socket.off("incomingCall");
      socket.off("offer");
      socket.off("callEnded");
    };
    // Only re-run if the officer identity changes — not on every incomingCall update
  }, [initCamera, user._id, user.fullName]);

  // Stop the camera stream when the component unmounts
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const acceptCall = () => {
    if (!incomingCall) return;
    socket.emit("acceptCall", { roomId: incomingCall.roomId, officerId: user._id });
    setCallStatus("connected");
  };

  const endCall = () => {
    socket.emit("endCall", { roomId: incomingCall?.roomId, officerId: user._id });
    peerRef.current?.destroy();
    peerRef.current = null;
    setCallStatus("idle");
    setIncomingCall(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-4">የፖሊስ ጥሪ ማዕከል</h2>

      {/* Video overlay */}
      <div className="relative w-full h-[400px] bg-black rounded-xl overflow-hidden border border-gray-700 shadow-2xl">
        <video ref={remoteVideo} autoPlay playsInline className="w-full h-full object-cover" />
        <video ref={myVideo} autoPlay muted playsInline className="absolute bottom-4 left-4 w-32 h-40 bg-gray-700 rounded-lg border-2 border-white object-cover" />
      </div>

      {/* Controls */}
      <div className="mt-6 flex gap-4">
        {callStatus === "incoming" && (
          <button onClick={acceptCall} className="bg-green-600 px-8 py-3 rounded-full font-bold animate-bounce">
            ጥሪ ተቀበል
          </button>
        )}

        {callStatus === "connected" && (
          <button onClick={endCall} className="bg-red-600 px-8 py-3 rounded-full font-bold">
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
