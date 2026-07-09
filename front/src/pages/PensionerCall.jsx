import React, { useEffect, useRef, useState, useCallback } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";

// .env ውስጥ ያለው አድራሻ /api ስላለው፣ ለሶኬት ግንኙነት /api ን እናስወግዳለን
const BASE_URL = process.env.REACT_APP_API_URL.replace("/api", "");
const socket = io(BASE_URL, { 
  transports: ["websocket", "polling"],
  reconnection: true 
});

const PensionerCall = () => {
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const [callStatus, setCallStatus] = useState("idle"); // idle, waiting, connected
  const [statusMessage, setStatusMessage] = useState("ለመጀመር ዝግጁ");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [callTime, setCallTime] = useState(0);

  // ካሜራን ማስጀመር
  const initializeMedia = useCallback(async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = media;
      if (myVideo.current) myVideo.current.srcObject = media;
    } catch (error) {
      console.error("Camera Error:", error);
      alert("ካሜራ ወይም ማይክሮፎን መክፈት አልተቻለም።");
    }
  }, []);

  useEffect(() => {
    initializeMedia();

    socket.on("agent-accepted", (data) => {
      setCallStatus("connected");
      setStatusMessage("ጥሪው ተገናኝቷል");
      if (peerRef.current) peerRef.current.signal(data.signal);
    });

    socket.on("call-rejected", () => {
      destroyPeer();
      setStatusMessage("ጥሪው ውድቅ ተደርጓል");
    });

    socket.on("call-ended", () => {
      destroyPeer();
      setStatusMessage("ጥሪው ተቋርጧል");
    });

    socket.on("queue-updated", (data) => {
      if (callStatus !== "connected") {
        setStatusMessage(`በመጠባበቂያ ውስጥ ነዎት። ${data.waitingCalls || 0} ሰው ቀድሞዎት አለ`);
      }
    });

    return () => {
      socket.off("agent-accepted");
      socket.off("call-rejected");
      socket.off("call-ended");
      socket.off("queue-updated");
    };
  }, [initializeMedia, callStatus]);

  // የጥሪ ጊዜ መቁጠሪያ
  useEffect(() => {
    if (callStatus === "connected") {
      timerRef.current = setInterval(() => setCallTime((prev) => prev + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [callStatus]);

  const destroyPeer = () => {
    if (peerRef.current) { peerRef.current.destroy(); peerRef.current = null; }
    if (remoteVideo.current) remoteVideo.current.srcObject = null;
    setCallStatus("idle");
    setCallTime(0);
  };

  const startCall = () => {
    if (!streamRef.current) return alert("ካሜራ ዝግጁ አይደለም");
    
    setCallStatus("waiting");
    setStatusMessage("ለሰራተኛ በመደወል ላይ...");
    
    socket.emit("register-user", { userId: socket.id, role: "pensioner" });

    const peer = new Peer({ initiator: true, trickle: false, stream: streamRef.current });

    peer.on("signal", (signalData) => {
      socket.emit("request-agent-call", { pensionerId: socket.id, signalData });
    });

    peer.on("stream", (remoteStream) => {
      if (remoteVideo.current) remoteVideo.current.srcObject = remoteStream;
    });

    peerRef.current = peer;
  };

  const endCall = () => {
    socket.emit("end-call", { pensionerId: socket.id });
    destroyPeer();
    streamRef.current?.getTracks().forEach(track => track.stop());
    setStatusMessage("ጥሪው ተዘግቷል");
  };

  const toggleCamera = () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setCameraOn(track.enabled); }
  };

  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setMicOn(track.enabled); }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-6 text-blue-400">POESSA Video Verification</h1>
      
      <div className="bg-gray-800 px-6 py-2 rounded-full mb-6 text-sm font-medium animate-pulse text-center">
        {statusMessage}
      </div>

   <div className="relative w-full max-w-sm h-[65vh] bg-black rounded-3xl overflow-hidden shadow-2xl mx-auto">
  
  {/* 1. የሰራተኛው ቪዲዮ (Remote) - ሙሉውን ስክሪን ይሞላል */}
  <video 
    ref={remoteVideo} 
    autoPlay 
    playsInline 
    className="w-full h-full object-cover" 
  />
  
  {/* 2. የጡረተኛው ቪዲዮ (Local) - በግራ በኩል፣ ከታች በኩል፣ ጽሁፍ እንዳይሸፍን ከፍ ያለ */}
  <div className="absolute bottom-20 left-4 w-24 h-32 rounded-xl border-2 border-white shadow-lg overflow-hidden z-10">
    <video 
      ref={myVideo} 
      autoPlay 
      muted 
      playsInline 
      className="w-full h-full object-cover" 
    />
  </div>

  {/* 3. መቆጣጠሪያዎች (Buttons) - ከስር በኩል፣ የጡረተኛው ቪዲዮ በላያቸው ላይ እንዳይደራረብ ከቪዲዮው ውጭ ይሁኑ */}
</div>

{/* ጽሁፎቹ እና መቆጣጠሪያዎቹ እዚህ ከቪዲዮው ስክሪን በታች ይሁኑ */}
<div className="mt-4 flex flex-col items-center">
  <div className="text-blue-400 font-medium mb-2">{statusMessage}</div>
  <div className="flex gap-4">
      {/* መቆጣጠሪያ ቁልፎች */}
      <button onClick={toggleCamera} className="...">ካሜራ</button>
      <button onClick={endCall} className="...">ጥሪ ዝጋ</button>
  </div>
</div>

      {/* የጥሪ ሁኔታ እና የጥሪ ጊዜ ጽሁፎች */}
      <div className="mt-4 text-center">
        <div className="text-blue-400 font-medium mb-2">{statusMessage}</div>
        <div className="text-xl font-mono">
          ⏱️ {Math.floor(callTime / 60)}:{String(callTime % 60).padStart(2, "0")}
        </div>
      </div>

      <div className="mt-8 flex gap-4">
        {callStatus === "idle" ? (
          <button onClick={startCall} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg">
            📞 ጥሪ ጀምር
          </button>
        ) : (
          <button onClick={endCall} className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg">
            ❌ ጥሪ ዝጋ
          </button>
        )}
        
        <button onClick={toggleCamera} className="bg-gray-700 hover:bg-gray-600 p-4 rounded-full transition-all">
          {cameraOn ? "📷" : "🚫"}
        </button>
        <button onClick={toggleMic} className="bg-gray-700 hover:bg-gray-600 p-4 rounded-full transition-all">
          {micOn ? "🎤" : "🔇"}
        </button>
      </div>

      {callStatus === "connected" && (
        <div className="mt-4 text-xl font-mono">
          ⏱️ {Math.floor(callTime / 60)}:{String(callTime % 60).padStart(2, "0")}
        </div>
      )}
    </div>
  );
};

export default PensionerCall;
