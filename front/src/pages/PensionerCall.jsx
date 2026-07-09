import React, { useEffect, useRef, useState, useCallback } from "react";
import Peer from "simple-peer";
import io from "socket.io-client";


const API = process.env.REACT_APP_BACKEND_URL;

const socket = io(API, {
  transports: ["websocket", "polling"],
  reconnection: true,
});

const PensionerCall = () => {
  const myVideo = useRef(null);
  const remoteVideo = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const [callStatus, setCallStatus] = useState("idle");
  const [statusMessage, setStatusMessage] = useState("ለመጀመር ዝግጁ");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [callTime, setCallTime] = useState(0);

  const initializeMedia = useCallback(async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = media;
      if (myVideo.current) myVideo.current.srcObject = media;
    } catch (error) {
      alert("ካሜራ ወይም ማይክሮፎን መክፈት አልተቻለም። ፍቃድ ይስጡ።");
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
    if (!streamRef.current) return alert("ካሜራ አልተገኘም");
    
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
    <div className="video-call-page">
      <div className="video-call-container">
        <h1 className="page-title">POESSA Video Verification</h1>
        <div className="status-box">{statusMessage}</div>

        <div className="video-layout">
          <div className="remote-video-wrapper">
            <h3>ሰራተኛ</h3>
            <video ref={remoteVideo} autoPlay playsInline className="remote-video" />
          </div>
          <div className="local-video-wrapper">
            <h3>እርስዎ</h3>
            <video ref={myVideo} autoPlay muted playsInline className="local-video" />
          </div>
        </div>

        <div className="button-group">
          {callStatus === "idle" ? (
            <button className="call-btn" onClick={startCall}>📞 ደውል</button>
          ) : (
            <button className="end-btn" onClick={endCall}>❌ ጥሪ ዝጋ</button>
          )}
          <button className="control-btn" onClick={toggleCamera}>
            {cameraOn ? "📷 ካሜራ አጥፋ" : "📷 ካሜራ አብራ"}
          </button>
          <button className="control-btn" onClick={toggleMic}>
            {micOn ? "🎤 ድምፅ አጥፋ" : "🎤 ድምፅ አብራ"}
          </button>
        </div>

        <div className="call-time">⏱️ የጥሪ ጊዜ: {Math.floor(callTime / 60)}:{String(callTime % 60).padStart(2, "0")}</div>
      </div>
    </div>
  );
};

export default PensionerCall;
