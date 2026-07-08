import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Peer from "simple-peer";
import io from "socket.io-client";

const API = process.env.REACT_APP_API_URL || "https://poessa-digital-services-1.onrender.com";
const socket = io(API, { transports: ["websocket", "polling"] });

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
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  // 1. ካሜራ ማዘጋጀት
  const initCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (myVideo.current) myVideo.current.srcObject = stream;
    } catch (err) { console.error("Camera error:", err); }
  }, []);

  // 2. የSocket ግንኙነት
  useEffect(() => {
    initCamera();
    socket.emit("registerOfficer", { officerId: user._id, fullName: user.fullName });

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
    peer.on("close", () => endCall());
    
    peer.signal(incomingCall.signal);
    peerRef.current = peer;
    setCallStatus("connected");
  };

  // 4. ጥሪ ማቋረጥ
  const endCall = () => {
    if (peerRef.current) peerRef.current.destroy();
    socket.emit("endCall", { to: incomingCall?.from });
    setCallStatus("idle");
    setIncomingCall(null);
    window.location.reload(); // ለንጽህና ዳግም መጫን
  };

  // 5. መቆጣጠሪያዎች (Cam/Mic)
  const toggleCamera = () => {
    const track = streamRef.current.getVideoTracks()[0];
    track.enabled = !track.enabled;
    setCameraOn(track.enabled);
  };

  const toggleMic = () => {
    const track = streamRef.current.getAudioTracks()[0];
    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  };

  // 6. Renewal ማጽደቅ
  const handleApproveRenewal = async (callId) => {
    try {
      await axios.post(`${API}/api/approve-renewal`, { callId, officerId: user._id, notes });
      alert("እድሳቱ በተሳካ ሁኔታ ተፈጽሟል");
      endCall();
    } catch (err) { alert("ስህተት ተፈጠረ"); }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-2xl font-bold mb-4">የፖሊስ ጥሪ ማዕከል</h2>
      
      {/* የጥሪ ዝርዝር */}
      <div className="bg-gray-800 p-4 rounded mb-6">
        <h3 className="font-bold mb-2">ተጠባባቂዎች (Queue)</h3>
        {queue.map((q) => <div key={q._id} className="p-2 border-b">ፔንሽነር: {q.pensioner?.fullName}</div>)}
      </div>

      {/* የቪዲዮ መስኮቶች */}
      <div className="grid grid-cols-2 gap-4 h-96">
        <div className="relative bg-black rounded overflow-hidden">
            <video ref={remoteVideo} autoPlay playsInline className="w-full h-full object-cover" />
            <span className="absolute top-2 left-2">Pensioner</span>
        </div>
        <div className="relative bg-black rounded overflow-hidden">
            <video ref={myVideo} autoPlay muted playsInline className="w-full h-full object-cover" />
            <span className="absolute top-2 left-2">You</span>
        </div>
      </div>

      {/* መቆጣጠሪያዎች */}
      <div className="mt-6 flex gap-4">
        {callStatus === "incoming" && <button onClick={acceptCall} className="bg-green-600 px-6 py-3 rounded">ጥሪ ተቀበል</button>}
        
        {callStatus === "connected" && (
          <div className="flex flex-col gap-4 w-full">
            <button onClick={toggleCamera} className="bg-blue-600 p-2">Cam {cameraOn ? "ON" : "OFF"}</button>
            <button onClick={toggleMic} className="bg-blue-600 p-2">Mic {micOn ? "ON" : "OFF"}</button>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="text-black p-2" placeholder="ማስታወሻ..." />
            <button onClick={() => handleApproveRenewal(incomingCall.callId)} className="bg-green-700 p-3">እድሳት አጽድቅ</button>
            <button onClick={endCall} className="bg-red-700 p-3">ጥሪ አቋርጥ</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OfficerCallCenter;
