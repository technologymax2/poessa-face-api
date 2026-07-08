import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Peer from "simple-peer";
import io from "socket.io-client";

const API = process.env.REACT_APP_API_URL || "https://poessa-digital-services-1.onrender.com";
const socket = io(API, { transports: ["websocket"] });

const OfficerCallCenter = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  const [queue, setQueue] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState("idle");
  const [notes, setNotes] = useState("");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (myVideo.current) myVideo.current.srcObject = stream;
    } catch (err) { console.error("Camera error:", err); }
  }, []);

  useEffect(() => {
    initCamera();
    socket.emit("registerOfficer", { officerId: user._id, fullName: user.fullName });
    
    socket.on("queueUpdated", (data) => setQueue(data));
    socket.on("incoming-call", (data) => {
      console.log("ጥሪ ደረሰ:", data);
      setIncomingCall(data);
      setCallStatus("incoming");
    });
    
    return () => { socket.off("queueUpdated"); socket.off("incoming-call"); };
  }, [initCamera, user._id, user.fullName]);

  const acceptCall = () => {
    const peer = new Peer({ initiator: false, trickle: false, stream: streamRef.current });
    peer.on("signal", (signal) => socket.emit("answer-call", { signal, to: incomingCall.from }));
    peer.on("stream", (stream) => { if (remoteVideo.current) remoteVideo.current.srcObject = stream; });
    peer.signal(incomingCall.signal);
    peerRef.current = peer;
    setCallStatus("connected");
  };

  const toggleCamera = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if(track) { track.enabled = !track.enabled; setCameraOn(track.enabled); }
  };

  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if(track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <h2 className="text-2xl font-bold mb-4">የፖሊስ ጥሪ ማዕከል</h2>

      {/* ቪዲዮ መደራረብ */}
      <div className="relative w-full h-[400px] bg-black rounded-xl overflow-hidden">
        <video ref={remoteVideo} autoPlay playsInline className="w-full h-full object-cover" />
        <video ref={myVideo} autoPlay muted playsInline className="absolute bottom-4 left-4 w-32 h-40 bg-gray-700 rounded-lg border-2 border-white object-cover" />
      </div>

      {/* ቁልፎች - ሁሌም እንዲታዩ ተደረጉ */}
      <div className="mt-4 bg-gray-800 p-4 rounded-xl flex flex-wrap gap-2 justify-center">
        {callStatus === "incoming" && <button onClick={acceptCall} className="bg-green-600 px-8 py-3 rounded-full font-bold">ጥሪ ተቀበል</button>}
        
        <button onClick={toggleCamera} className="bg-blue-600 px-4 py-2 rounded-full">Cam {cameraOn ? "ON" : "OFF"}</button>
        <button onClick={toggleMic} className="bg-blue-600 px-4 py-2 rounded-full">Mic {micOn ? "ON" : "OFF"}</button>
        
        {callStatus === "connected" && (
           <button onClick={() => window.location.reload()} className="bg-red-600 px-4 py-2 rounded-full font-bold">End Call</button>
        )}
      </div>

      {/* ማስታወሻ */}
      {callStatus === "connected" && (
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full text-black p-2 mt-2" placeholder="ማስታወሻ ይጻፉ..." />
      )}

      {/* የጥሪ ዝርዝር */}
      <div className="mt-4">
        <h3 className="font-bold">በመጠባበቅ ላይ ያሉት:</h3>
        {queue.map((q) => <div key={q._id} className="p-2 border-b border-gray-700">{q.pensioner?.fullName}</div>)}
      </div>
    </div>
  );
};

export default OfficerCallCenter;
