import React, { useEffect, useRef, useState, useCallback } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";

const API = process.env.REACT_APP_API_URL.replace("/api", "");
const socket = io(API, { transports: ["websocket"], withCredentials: true });

const PensionerCall = () => {
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  
  const [callStatus, setCallStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("ለመጀመር ዝግጁ");

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        streamRef.current = stream;
        if (myVideo.current) myVideo.current.srcObject = stream;
      }).catch(err => console.error(err));

    socket.on("callAccepted", () => {
      setCallStatus("connected");
      setStatusMessage("ጥሪው ተገናኝቷል");
    });

    socket.on("answer", ({ answer }) => peerRef.current?.signal(answer));
    socket.on("iceCandidate", ({ candidate }) => peerRef.current?.signal(candidate));

    return () => { socket.off("callAccepted"); socket.off("answer"); };
  }, []);

  const startCall = () => {
    setCallStatus("waiting");
    setStatusMessage("ለሰራተኛ በመደወል ላይ...");
    const roomId = `room_${socket.id}`;
    socket.emit("requestCall", { roomId, pensionerId: socket.id });

    const peer = new Peer({ initiator: true, trickle: false, stream: streamRef.current });
    peer.on("signal", (data) => socket.emit("offer", { roomId, offer: data }));
    peer.on("stream", (stream) => { if (remoteVideo.current) remoteVideo.current.srcObject = stream; });
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
      <button onClick={startCall} className="mt-4 bg-blue-600 px-8 py-3 rounded-full font-bold">📞 ጥሪ ጀምር</button>
    </div>
  );
};
export default PensionerCall;
