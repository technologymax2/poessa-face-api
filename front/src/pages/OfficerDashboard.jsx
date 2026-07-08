import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Peer from "simple-peer";
import io from "socket.io-client";

const API = process.env.REACT_APP_API_URL || "http://localhost:10000";
const socket = io(API, { transports: ["websocket"] });

const OfficerCallCenter = () => {
  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Refs
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);

  // States
  const [queue, setQueue] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const [callStatus, setCallStatus] = useState("idle"); // idle, incoming, connected
  const [notes, setNotes] = useState("");

  // 1. ካሜራ ማዘጋጀት
  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (myVideo.current) myVideo.current.srcObject = stream;
    } catch (err) { console.error("Camera error:", err); }
  }, []);

  // 2. የSocket ግንኙነት እና Queue ማዘመን
  useEffect(() => {
    initCamera();
    socket.emit("registerOfficer", { officerId: user._id, fullName: user.fullName });

    // ከBackend የሚመጣውን Queue ማዳመጥ
    socket.on("queueUpdated", (data) => setQueue(data));
    socket.on("incoming-call", ({ signal, from, callId }) => {
      setIncomingCall({ signal, from, callId });
      setCallStatus("incoming");
    });

    return () => {
      socket.off("queueUpdated");
      socket.off("incoming-call");
    };
  }, [initCamera, user._id, user.fullName]);

  // 3. ጥሪ መቀበል
  const acceptCall = () => {
    const peer = new Peer({ initiator: false, trickle: false, stream: streamRef.current });
    peer.on("signal", (signal) => socket.emit("answer-call", { signal, to: incomingCall.from }));
    peer.on("stream", (stream) => { if (remoteVideo.current) remoteVideo.current.srcObject = stream; });
    
    peer.signal(incomingCall.signal);
    peerRef.current = peer;
    setCallStatus("connected");
  };

  // 4. Renewal ማጽደቅ (የ Backend API ጥሪ)
  const handleApproveRenewal = async (callId) => {
    try {
      await axios.post(`${API}/api/approve-renewal`, {
        callId,
        officerId: user._id,
        notes
      });
      alert("እድሳቱ በተሳካ ሁኔታ ተፈጽሟል");
      setCallStatus("idle");
    } catch (err) { alert("ስህተት ተፈጠረ"); }
  };

  return (
    <div className="officer-call-center">
      <h2>የፖሊስ ጥሪ ማዕከል</h2>
      
      {/* የጥሪ ዝርዝር */}
      <div className="queue-list">
        {queue.map((q) => (
          <div key={q._id}>የፔንሽነር ስም: {q.pensioner?.fullName}</div>
        ))}
      </div>

      {/* የቪዲዮ መስኮቶች */}
      <div className="video-container">
        <video ref={myVideo} autoPlay muted playsInline />
        <video ref={remoteVideo} autoPlay playsInline />
      </div>

      {/* መቆጣጠሪያዎች */}
      {callStatus === "incoming" && <button onClick={acceptCall}>ጥሪ ተቀበል</button>}
      
      {callStatus === "connected" && (
        <div className="call-controls">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="ማስታወሻ..." />
          <button onClick={() => handleApproveRenewal(incomingCall.callId)}>እድሳት አጽድቅ</button>
        </div>
      )}
    </div>
  );
};

export default OfficerCallCenter;
