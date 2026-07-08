import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import Navbar from "../components/Navbar";
import Loader from "../components/Loader";

import io from "socket.io-client";

import {
  searchPensioner,
} from "../services/api";

const socket = io(process.env.REACT_APP_API_URL);

const VideoVerification = () => {

  const localVideo = useRef(null);
  const remoteVideo = useRef(null);

  const peerConnection = useRef(null);

  const localStream = useRef(null);

  const [loading, setLoading] = useState(false);

  const [faydaNumber, setFaydaNumber] = useState("");

  const [pensioner, setPensioner] = useState(null);

  const [roomId, setRoomId] = useState("");

  const [callStarted, setCallStarted] = useState(false);

  const [cameraOn, setCameraOn] = useState(true);

  const [micOn, setMicOn] = useState(true);

  const [callTime, setCallTime] = useState(0);

  const [messages, setMessages] = useState([]);

  const [message, setMessage] = useState("");

  const [officer] = useState(() => {

    const user = JSON.parse(
      localStorage.getItem("user")
    );

    return user;

  });

  useEffect(() => {

    socket.emit("register", {
      userId: officer._id,
      role: "OFFICER",
    });

  }, []);

  useEffect(() => {

    let timer;

    if (callStarted) {

      timer = setInterval(() => {

        setCallTime((prev) => prev + 1);

      }, 1000);

    }

    return () => clearInterval(timer);

  }, [callStarted]);

  const search = async () => {

    if (!faydaNumber) {

      return alert("Enter Fayda Number");

    }

    try {

      setLoading(true);

      const res =
        await searchPensioner(faydaNumber);

      setPensioner(res.data.data);

    } catch (err) {

      alert(
        err.response?.data?.message ||
        "Pensioner not found."
      );

    } finally {

      setLoading(false);

    }

  };

  const startCamera = async () => {

    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({

          video: true,

          audio: true,

        });

      localStream.current = stream;

      if (localVideo.current) {

        localVideo.current.srcObject = stream;

      }

    } catch (err) {

      console.log(err);

      alert("Camera permission denied.");

    }

  };

  useEffect(() => {

    startCamera();

  }, []);
    // ==========================================
  // WebRTC Configuration
  // ==========================================

  const configuration = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  };

  // ==========================================
  // Create Room
  // ==========================================

  const createRoom = async () => {

    if (!pensioner) {
      return alert("Search pensioner first.");
    }

    const room =
      "ROOM-" +
      Date.now() +
      "-" +
      Math.floor(Math.random() * 1000);

    setRoomId(room);

    socket.emit("createRoom", {
      roomId: room,
      officerId: officer._id,
    });

    createPeer(room);
  };

  // ==========================================
  // Create Peer Connection
  // ==========================================

  const createPeer = async (room) => {

    peerConnection.current =
      new RTCPeerConnection(configuration);

    // Local Tracks
    localStream.current
      .getTracks()
      .forEach((track) => {

        peerConnection.current.addTrack(
          track,
          localStream.current
        );

      });

    // ICE Candidate
    peerConnection.current.onicecandidate = (event) => {

      if (event.candidate) {

        socket.emit("iceCandidate", {
          roomId: room,
          candidate: event.candidate,
        });

      }

    };

    // Remote Stream
    peerConnection.current.ontrack = (event) => {

      if (remoteVideo.current) {

        remoteVideo.current.srcObject =
          event.streams[0];

      }

    };

    // Create Offer
    const offer =
      await peerConnection.current.createOffer();

    await peerConnection.current.setLocalDescription(
      offer
    );

    socket.emit("offer", {
      roomId: room,
      offer,
    });

    setCallStarted(true);

  };

  // ==========================================
  // Socket Listeners
  // ==========================================

  useEffect(() => {

    // Receive Offer
    socket.on("offer", async ({ offer }) => {

      peerConnection.current =
        new RTCPeerConnection(configuration);

      localStream.current
        .getTracks()
        .forEach((track) => {

          peerConnection.current.addTrack(
            track,
            localStream.current
          );

        });

      peerConnection.current.ontrack = (event) => {

        if (remoteVideo.current) {

          remoteVideo.current.srcObject =
            event.streams[0];

        }

      };

      peerConnection.current.onicecandidate =
        (event) => {

          if (event.candidate) {

            socket.emit("iceCandidate", {
              roomId,
              candidate: event.candidate,
            });

          }

        };

      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer =
        await peerConnection.current.createAnswer();

      await peerConnection.current.setLocalDescription(
        answer
      );

      socket.emit("answer", {
        roomId,
        answer,
      });

    });

    // Receive Answer
    socket.on("answer", async ({ answer }) => {

      if (!peerConnection.current) return;

      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );

    });

    // ICE Candidate
    socket.on(
      "iceCandidate",
      async ({ candidate }) => {

        if (
          peerConnection.current &&
          candidate
        ) {

          await peerConnection.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );

        }

      }
    );

    return () => {

      socket.off("offer");
      socket.off("answer");
      socket.off("iceCandidate");

    };

  }, [roomId]);

  // ==========================================
  // Camera Toggle
  // ==========================================

  const toggleCamera = () => {

    const enabled = !cameraOn;

    localStream.current
      .getVideoTracks()
      .forEach((track) => {

        track.enabled = enabled;

      });

    setCameraOn(enabled);

    socket.emit(
      enabled ? "cameraOn" : "cameraOff",
      { roomId }
    );

  };

  // ==========================================
  // Microphone Toggle
  // ==========================================

  const toggleMic = () => {

    const enabled = !micOn;

    localStream.current
      .getAudioTracks()
      .forEach((track) => {

        track.enabled = enabled;

      });

    setMicOn(enabled);

    socket.emit(
      enabled ? "micOn" : "micOff",
      { roomId }
    );

  };
    // ==========================================
  // Capture Evidence
  // ==========================================

  const captureEvidence = () => {

    const canvas = document.createElement("canvas");

    canvas.width = localVideo.current.videoWidth;
    canvas.height = localVideo.current.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      localVideo.current,
      0,
      0,
      canvas.width,
      canvas.height
    );

    const image = canvas.toDataURL("image/jpeg");

    socket.emit("captureEvidence", {
      roomId,
      image,
    });

    alert("Evidence captured successfully.");

  };

  // ==========================================
  // Send Chat Message
  // ==========================================

  const sendMessage = () => {

    if (!message.trim()) return;

    socket.emit("chatMessage", {
      roomId,
      sender: officer.fullName,
      message,
    });

    setMessage("");

  };

  useEffect(() => {

    socket.on("chatMessage", (data) => {

      setMessages((prev) => [...prev, data]);

    });

    return () => {

      socket.off("chatMessage");

    };

  }, []);

  // ==========================================
  // End Call
  // ==========================================

  const endCall = () => {

    if (peerConnection.current) {

      peerConnection.current.close();

    }

    if (localStream.current) {

      localStream.current.getTracks().forEach(track => track.stop());

    }

    socket.emit("leaveRoom", {
      roomId,
    });

    setCallStarted(false);

    alert("Video verification completed.");

  };

  // ==========================================
  // JSX
  // ==========================================

  return (
    <>
      <Navbar />

      {loading && (
        <Loader
          fullScreen
          text="Loading..."
        />
      )}

      <div className="max-w-7xl mx-auto p-6">

        <div className="bg-white rounded-xl shadow-lg p-6">

          <h2 className="text-3xl font-bold text-blue-700 mb-6">
            Live Video Verification
          </h2>

          {/* Search */}

          <div className="flex gap-3 mb-6">

            <input
              type="text"
              placeholder="Enter Fayda Number"
              value={faydaNumber}
              onChange={(e)=>setFaydaNumber(e.target.value)}
              className="flex-1 border rounded-lg p-3"
            />

            <button
              onClick={search}
              className="bg-blue-700 text-white px-6 rounded-lg"
            >
              Search
            </button>

          </div>

          {/* Pensioner */}

          {pensioner && (

            <div className="bg-blue-50 rounded-lg p-4 mb-6">

              <h3 className="font-bold text-xl">
                {pensioner.nameEng}
              </h3>

              <p>Fayda : {pensioner.faydaNumber}</p>

              <p>ID : {pensioner.pensionerId}</p>

              <p>Branch : {pensioner.poessaBranch}</p>

              <button
                onClick={createRoom}
                className="mt-4 bg-green-600 text-white px-5 py-2 rounded-lg"
              >
                Start Video Verification
              </button>

            </div>

          )}

          {/* Videos */}

          <div className="grid md:grid-cols-2 gap-6">

            <div>

              <h3 className="font-bold mb-2">
                Officer
              </h3>

              <video
                ref={localVideo}
                autoPlay
                muted
                playsInline
                className="rounded-xl border w-full h-80 bg-black"
              />

            </div>

            <div>

              <h3 className="font-bold mb-2">
                Pensioner
              </h3>

              <video
                ref={remoteVideo}
                autoPlay
                playsInline
                className="rounded-xl border w-full h-80 bg-black"
              />

            </div>

          </div>

          {/* Controls */}

          {callStarted && (

            <div className="flex flex-wrap gap-3 mt-6">

              <button
                onClick={toggleCamera}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg"
              >
                {cameraOn ? "Turn Camera Off" : "Turn Camera On"}
              </button>

              <button
                onClick={toggleMic}
                className="bg-yellow-600 text-white px-5 py-2 rounded-lg"
              >
                {micOn ? "Mute Mic" : "Unmute Mic"}
              </button>

              <button
                onClick={captureEvidence}
                className="bg-purple-700 text-white px-5 py-2 rounded-lg"
              >
                Capture Evidence
              </button>

              <button
                onClick={endCall}
                className="bg-red-700 text-white px-5 py-2 rounded-lg"
              >
                End Call
              </button>

            </div>

          )}

          {/* Chat */}

          <div className="mt-8">

            <h3 className="font-bold text-xl mb-3">
              Live Chat
            </h3>

            <div className="border rounded-lg h-56 overflow-y-auto p-3">

              {messages.map((msg,index)=>(

                <div key={index} className="mb-2">

                  <strong>{msg.sender}</strong>

                  <p>{msg.message}</p>

                </div>

              ))}

            </div>

            <div className="flex mt-3">

              <input
                value={message}
                onChange={(e)=>setMessage(e.target.value)}
                className="flex-1 border rounded-l-lg p-3"
                placeholder="Type message..."
              />

              <button
                onClick={sendMessage}
                className="bg-blue-700 text-white px-6 rounded-r-lg"
              >
                Send
              </button>

            </div>

          </div>

          {/* Call Duration */}

          {callStarted && (

            <div className="mt-6 text-center font-bold text-lg text-green-700">

              Call Duration :
              {" "}
              {Math.floor(callTime/60)}
              :
              {(callTime%60).toString().padStart(2,"0")}

            </div>

          )}

        </div>

      </div>

    </>
  );

};

export default VideoVerification;
