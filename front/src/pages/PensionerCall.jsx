import React, { useState, useEffect, useRef, useCallback } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";
import axios from "axios";

// ከ .env የሚመጣውን አድራሻ ይጠቀሙ
const API = process.env.REACT_APP_API_URL || "https://poessa-digital-services-1.onrender.com";
const socket = io(API, { transports: ["websocket", "polling"] });

const PensionerCall = () => {
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  const [fayda, setFayda] = useState("");
  const [callStatus, setCallStatus] = useState("idle");
  const [roomId, setRoomId] = useState("");

  const initMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (myVideo.current) myVideo.current.srcObject = stream;
    } catch (err) {
      alert("ካሜራ ወይም ማይክሮፎን መጠቀም አልተቻለም።");
    }
  }, []);

  useEffect(() => {
    initMedia();

    // 1. ጥሪው በተቀባይ (Officer) ሲፀድቅ
    socket.on("callAccepted", () => {
      setCallStatus("connected");
      // Officer ጋር ያለው Peer እንዲገናኝ እዚህም Peer መፍጠር ያስፈልጋል
    });

    // 2. የሲግናሊንግ ክንውኖች
    socket.on("answer", ({ answer }) => {
      peerRef.current?.signal(answer);
    });

    socket.on("iceCandidate", ({ candidate }) => {
      peerRef.current?.signal(candidate);
    });

    return () => {
      socket.off("callAccepted");
      socket.off("answer");
    };
  }, [initMedia]);

  const startCall = async () => {
    if (!fayda) return alert("እባክዎ የፋይዳ ቁጥር ያስገቡ");
    
    const room = `ROOM-${Date.now()}`;
    setRoomId(room);
    setCallStatus("searching");

    // የፔር ግንኙነት መጀመር
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: streamRef.current,
      config: { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] },
    });

    peer.on("signal", (signal) => {
      socket.emit("offer", { roomId: room, offer: signal });
    });

    peer.on("stream", (stream) => {
      if (remoteVideo.current) remoteVideo.current.srcObject = stream;
    });

    peerRef.current = peer;

    // ለሰርቨር ማሳወቅ
    socket.emit("joinRoom", { roomId: room });
    socket.emit("requestCall", { roomId: room, pensionerId: fayda });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
      {callStatus === "idle" ? (
        <div className="flex flex-col gap-4">
          <input value={fayda} onChange={(e) => setFayda(e.target.value)} placeholder="የፋይዳ ቁጥር" className="p-4 text-black rounded" />
          <button onClick={startCall} className="bg-blue-600 p-4 rounded font-bold">Call Verification Officer</button>
        </div>
      ) : (
        <div className="flex-1 relative">
           <video ref={remoteVideo} autoPlay className="w-full h-full object-cover" />
           <video ref={myVideo} autoPlay muted className="absolute bottom-4 right-4 w-32 h-40 bg-gray-600 rounded" />
        </div>
      )}
    </div>
  );
};

export default PensionerCall;
