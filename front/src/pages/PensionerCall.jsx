import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

import Peer from "simple-peer";
import { io } from "socket.io-client";
import axios from "axios";

const API =
  process.env.REACT_APP_API_URL ||
  "https://poessa-digital-services-1.onrender.com";

const socket = io(API, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

const PensionerCall = () => {
  /* ============================================================
      REFERENCES
  ============================================================ */

  const myVideo = useRef(null);
  const officerVideo = useRef(null);

  const peerRef = useRef(null);
  const streamRef = useRef(null);

  /* ============================================================
      STATES
  ============================================================ */

  const [loading, setLoading] = useState(false);

  const [stream, setStream] = useState(null);

  const [faydaNumber, setFaydaNumber] = useState("");

  const [pensioner, setPensioner] = useState(null);

  const [roomId, setRoomId] = useState("");

  const [waiting, setWaiting] = useState(false);

  const [connected, setConnected] = useState(false);

  const [callStarted, setCallStarted] = useState(false);

  const [cameraOn, setCameraOn] = useState(true);

  const [micOn, setMicOn] = useState(true);

  const [callTime, setCallTime] = useState(0);

  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  const [status, setStatus] = useState(
    "Enter your Fayda Number"
  );

  /* ============================================================
      INITIALIZE CAMERA
  ============================================================ */

  const initializeCamera = useCallback(async () => {
    try {
      const media =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

      streamRef.current = media;

      setStream(media);

      if (myVideo.current) {
        myVideo.current.srcObject = media;
      }
    } catch (err) {
      console.error(err);
      alert("Camera permission denied.");
    }
  }, []);

  /* ============================================================
      LOAD CAMERA
  ============================================================ */

  useEffect(() => {
    initializeCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }

      if (peerRef.current) {
        peerRef.current.destroy();
      }

      socket.disconnect();
    };
  }, [initializeCamera]);

  /* ============================================================
      SEARCH PENSIONER
  ============================================================ */

  const searchPensioner = async () => {
    if (!faydaNumber.trim()) {
      return alert("Enter Fayda Number");
    }

    try {
      setLoading(true);

      const res = await axios.get(
        `${API}/api/video/pensioner/${faydaNumber}`
      );

      setPensioner(res.data.data);

      setStatus("Pensioner found.");

    } catch (err) {
      console.error(err);

      alert("Pensioner not found.");

      setPensioner(null);

    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
      JOIN WAITING QUEUE
  ============================================================ */

  const joinQueue = () => {

    if (!pensioner) {
      return alert("Search pensioner first.");
    }

    const room = `ROOM-${Date.now()}`;

    setRoomId(room);

    socket.emit("joinQueue", {
      roomId: room,
      pensionerId: pensioner._id,
      pensionerName: pensioner.nameEng,
      faydaNumber: pensioner.faydaNumber,
    });

    setWaiting(true);

    setStatus("Waiting for available officer...");
  };

  /* ============================================================
      TOGGLE CAMERA
  ============================================================ */

  const toggleCamera = () => {

    const track =
      streamRef.current?.getVideoTracks()[0];

    if (!track) return;

    track.enabled = !track.enabled;

    setCameraOn(track.enabled);

    socket.emit(track.enabled ? "cameraOn" : "cameraOff", {
      roomId,
    });

  };

  /* ============================================================
      TOGGLE MICROPHONE
  ============================================================ */

  const toggleMic = () => {

    const track =
      streamRef.current?.getAudioTracks()[0];

    if (!track) return;

    track.enabled = !track.enabled;

    setMicOn(track.enabled);

    socket.emit(track.enabled ? "micOn" : "micOff", {
      roomId,
    });

  };

  /* ============================================================
      SEND CHAT MESSAGE
  ============================================================ */

  const sendMessage = () => {

    if (!message.trim()) return;

    const data = {
      roomId,
      sender: pensioner?.nameEng,
      message,
      time: new Date().toLocaleTimeString(),
    };

    socket.emit("chatMessage", data);

    setMessages((prev) => [...prev, data]);

    setMessage("");

  };

  /* ============================================================
      TIMER
  ============================================================ */

  useEffect(() => {

    let timer;

    if (callStarted) {

      timer = setInterval(() => {
        setCallTime((prev) => prev + 1);
      }, 1000);

    }

    return () => clearInterval(timer);

  }, [callStarted]);

  /* ============================================================
      PART 2
      Socket Events + WebRTC Signaling
  ============================================================ */

/* ==========================================================
   Socket Events
========================================================== */

useEffect(() => {
  socket.on("callAccepted", ({ signal }) => {
    peerRef.current.signal(signal);
  });

  socket.on("callRejected", () => {
    alert("No officer accepted your call.");
    setCalling(false);
    setCallConnected(false);
  });

  socket.on("callEnded", () => {
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    if (remoteVideo.current) {
      remoteVideo.current.srcObject = null;
    }

    setCalling(false);
    setCallConnected(false);
  });

  socket.on("chatMessage", (msg) => {
    setMessages((prev) => [...prev, msg]);
  });

  socket.on("cameraOff", () => {
    setOfficerCamera(false);
  });

  socket.on("cameraOn", () => {
    setOfficerCamera(true);
  });

  socket.on("micOff", () => {
    setOfficerMic(false);
  });

  socket.on("micOn", () => {
    setOfficerMic(true);
  });

  return () => {
    socket.off("callAccepted");
    socket.off("callRejected");
    socket.off("callEnded");
    socket.off("chatMessage");
    socket.off("cameraOff");
    socket.off("cameraOn");
    socket.off("micOff");
    socket.off("micOn");
  };
}, []);

/* ==========================================================
   Timer
========================================================== */

useEffect(() => {
  let timer;

  if (callConnected) {
    timer = setInterval(() => {
      setCallTime((prev) => prev + 1);
    }, 1000);
  }

  return () => clearInterval(timer);
}, [callConnected]);

/* ==========================================================
   Toggle Camera
========================================================== */

const toggleCamera = () => {
  const track = streamRef.current?.getVideoTracks()[0];

  if (!track) return;

  track.enabled = !track.enabled;

  setCameraOn(track.enabled);

  socket.emit(track.enabled ? "cameraOn" : "cameraOff", {
    roomId,
  });
};

/* ==========================================================
   Toggle Mic
========================================================== */

const toggleMic = () => {
  const track = streamRef.current?.getAudioTracks()[0];

  if (!track) return;

  track.enabled = !track.enabled;

  setMicOn(track.enabled);

  socket.emit(track.enabled ? "micOn" : "micOff", {
    roomId,
  });
};

/* ==========================================================
   Send Chat
========================================================== */

const sendMessage = () => {
  if (!message.trim()) return;

  const data = {
    roomId,
    sender: pensioner?.nameEng,
    message,
    time: new Date().toLocaleTimeString(),
  };

  socket.emit("chatMessage", data);

  setMessages((prev) => [...prev, data]);

  setMessage("");
};

/* ==========================================================
   End Call
========================================================== */

const endCall = () => {
  socket.emit("endCall", { roomId });

  if (peerRef.current) {
    peerRef.current.destroy();
    peerRef.current = null;
  }

  if (remoteVideo.current) {
    remoteVideo.current.srcObject = null;
  }

  setCalling(false);
  setCallConnected(false);
};

/* ==========================================================
   JSX
========================================================== */

return (
<div className="min-h-screen bg-gray-100">

<div className="bg-blue-900 text-white p-5 shadow">

<h1 className="text-3xl font-bold">

POESSA Video Verification

</h1>

</div>

<div className="max-w-7xl mx-auto p-6">

{!calling && (

<div className="bg-white rounded-xl shadow p-8">

<h2 className="text-2xl font-bold mb-5">

Start Video Call

</h2>

<input

value={fayda}

onChange={(e)=>setFayda(e.target.value)}

placeholder="Enter Fayda Number"

className="border rounded-lg p-3 w-full mb-5"

/>

<button

onClick={startCall}

className="bg-blue-700 text-white px-6 py-3 rounded-lg"

>

Call Officer

</button>

</div>

)}

{calling && (

<>

<div className="grid md:grid-cols-2 gap-6">

<div className="relative">

<video

ref={remoteVideo}

autoPlay

playsInline

className="rounded-xl bg-black w-full h-[500px] object-cover"

/>

<video

ref={myVideo}

autoPlay

muted

playsInline

className="absolute bottom-4 right-4 w-44 rounded-xl border-4 border-white shadow-lg"

/>

</div>

<div>

<div className="bg-white rounded-xl shadow p-5 mb-4">

<h2 className="font-bold text-xl mb-3">

Call Status

</h2>

<p>

{callConnected

? "Connected"

: "Waiting for Officer..."}

</p>

<p>

⏱

{Math.floor(callTime/60)}

:

{String(callTime%60).padStart(2,"0")}

</p>

</div>

<div className="grid grid-cols-2 gap-3 mb-4">

<button

onClick={toggleCamera}

className="bg-indigo-700 text-white rounded-lg py-3"

>

{cameraOn ? "Camera Off" : "Camera On"}

</button>

<button

onClick={toggleMic}

className="bg-yellow-600 text-white rounded-lg py-3"

>

{micOn ? "Mute" : "Unmute"}

</button>

<button

onClick={endCall}

className="col-span-2 bg-red-700 text-white rounded-lg py-3"

>

End Call

</button>

</div>

<div className="bg-white rounded-xl shadow p-4">

<h2 className="font-bold mb-3">

Live Chat

</h2>

<div className="border rounded h-64 overflow-y-auto p-3">

{messages.map((msg,index)=>(

<div key={index} className="mb-2">

<b>{msg.sender}</b>

<p>{msg.message}</p>

</div>

))}

</div>

<div className="flex mt-3">

<input

className="flex-1 border rounded-l-lg p-2"

value={message}

onChange={(e)=>setMessage(e.target.value)}

placeholder="Message..."

/>

<button

onClick={sendMessage}

className="bg-blue-700 text-white px-5 rounded-r-lg"

>

Send

</button>

</div>

</div>

</div>

</div>

</>

)}

</div>

</div>

);

};

export default PensionerCall;
