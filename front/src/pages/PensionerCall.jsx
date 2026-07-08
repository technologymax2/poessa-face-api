import React, { useState, useEffect, useRef, useCallback } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";
import axios from "axios";

const API = process.env.REACT_APP_API_URL || "https://poessa-digital-services-1.onrender.com";
const socket = io(API, { transports: ["websocket", "polling"] });

const PensionerCall = () => {
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  const [fayda, setFayda] = useState("");
  const [calling, setCalling] = useState(false);
  const [callStatus, setCallStatus] = useState("idle");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const initMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (myVideo.current) myVideo.current.srcObject = stream;
    } catch (err) { alert("ካሜራ ወይም ማይክሮፎን መጠቀም አልተቻለም"); }
  }, []);

  useEffect(() => {
    initMedia();

    socket.on("callAccepted", () => {
  setCallStatus("connected");

  const peer = new Peer({
    initiator: true,
    trickle: false,
    stream: streamRef.current,
    config: {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    },
  });

  peer.on("signal", (signal) => {
    socket.emit("offer", { roomId, offer: signal });
  });

  peer.on("stream", (stream) => {
    if (remoteVideo.current) remoteVideo.current.srcObject = stream;
  });

  peerRef.current = peer;
});

    socket.on("offer", ({ offer }) => {
      peerRef.current?.signal(offer);
    });

    socket.on("answer", ({ answer }) => {
      peerRef.current?.signal(answer);
    });

    socket.on("iceCandidate", ({ candidate }) => {
      peerRef.current?.signal(candidate);
    });

    socket.on("callEnded", () => window.location.reload());
    socket.on("chatMessage", (msg) => setMessages((prev) => [...prev, msg]));

    return () => socket.off();
  }, [initMedia]);

  const startCall = async () => {
    if (!fayda) return alert("እባክዎ ፋይዳ ቁጥር ያስገቡ");
    const room = `ROOM-${Date.now()}`;
    setRoomId(room);
    setCalling(true);
    setCallStatus("searching");
    socket.emit("registerPensioner", {
    pensionerId: fayda,
});

socket.emit("joinRoom", {
    roomId: room
});
    await axios.post(`${API}/api/video/request-call`, {
    roomId: room,
    pensionerId: fayda
});

    socket.emit("requestCall", { roomId: room, pensionerId: fayda });

  };

  const endCall = () => {
    socket.emit("endCall", { roomId });
    peerRef.current?.destroy();
    window.location.reload();
  };

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
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">POESSA Video Verification</h1>
      
      {callStatus === "idle" && (
        <div className="bg-gray-800 p-6 rounded-xl">
          <input value={fayda} onChange={(e) => setFayda(e.target.value)} placeholder="የፋይዳ ቁጥር" className="w-full p-4 mb-4 text-black rounded" />
          <button onClick={startCall} className="w-full bg-blue-600 p-4 rounded font-bold text-lg">Call Verification Officer</button>
        </div>
      )}

      {(callStatus === "searching" || callStatus === "connected") && (
        <div className="flex-1 flex flex-col gap-4">
          <div className="relative flex-1 bg-black rounded-xl overflow-hidden">
            <video ref={remoteVideo} autoPlay playsInline className="w-full h-full object-cover" />
            <video ref={myVideo} autoPlay muted playsInline className="absolute bottom-4 right-4 w-24 h-32 bg-gray-600 rounded-lg border-2 border-white" />
          </div>
          
          {callStatus === "searching" && <div className="text-center text-yellow-500 font-bold p-2">ባለሙያ በመፈለግ ላይ...</div>}

          <div className="flex justify-between bg-gray-800 p-4 rounded-xl">
            <button onClick={toggleCamera} className="bg-blue-600 px-5 py-3 rounded-full font-bold">Cam {cameraOn ? "ON" : "OFF"}</button>
            <button onClick={toggleMic} className="bg-blue-600 px-5 py-3 rounded-full font-bold">Mic {micOn ? "ON" : "OFF"}</button>
            <button onClick={endCall} className="bg-red-600 px-5 py-3 rounded-full font-bold">End Call</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PensionerCall;
