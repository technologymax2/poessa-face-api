import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Loader from "../components/Loader";

const socket = io(process.env.REACT_APP_API_URL.replace("/api", ""));

const PatientVideoCall = () => {

  const { roomId } = useParams();

  const localVideo = useRef(null);
  const remoteVideo = useRef(null);

  const localStream = useRef(null);
  const peerConnection = useRef(null);

  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const [callTime, setCallTime] = useState(0);

  const configuration = {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
    ],
  };

  // =====================================
  // Open Camera
  // =====================================

  useEffect(() => {

    const initialize = async () => {

      try {

        const stream =
          await navigator.mediaDevices.getUserMedia       ({
            video: true,
            audio: true,
          });

        localStream.current = stream;

        if (localVideo.current) {
          localVideo.current.srcObject = stream;
        }

        peerConnection.current =
          new RTCPeerConnection(configuration);

        stream.getTracks().forEach((track) => {
          peerConnection.current.addTrack(track, stream);
        });

        peerConnection.current.ontrack = (event) => {
          if (remoteVideo.current) {
            remoteVideo.current.srcObject = event.streams[0];
          }
        };

        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("ice-candidate", {
              roomId,
              candidate: event.candidate,
            });
          }
        };

        socket.emit("join-room", roomId);

        setLoading(false);

      } catch (err) {
        console.error(err);
        alert("Unable to access camera.");
      }

    };

    initialize();

  }, []);

  // =====================================
  // Receive Offer
  // =====================================

  useEffect(() => {

    socket.on("offer", async (offer) => {

      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      const answer =
        await peerConnection.current.createAnswer();

      await peerConnection.current.setLocalDescription(answer);

      socket.emit("answer", {
        roomId,
        answer,
      });

    });

    socket.on("answer", async (answer) => {

      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );

      setConnected(true);

    });

    socket.on("ice-candidate", async (candidate) => {

      try {

        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );

      } catch (err) {
        console.error(err);
      }

    });

    socket.on("chat-message", (data) => {

      setMessages((prev) => [...prev, data]);

    });

    return () => {

      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("chat-message");

    };

  }, 
              // =====================================
  // Create Offer
  // =====================================

  const startCall = async () => {

    const offer =
      await peerConnection.current.createOffer();

    await peerConnection.current.setLocalDescription(offer);

    socket.emit("offer", {
      roomId,
      offer,
    });

  };

  // =====================================
  // Toggle Camera
  // =====================================

  const toggleCamera = () => {

    const track =
      localStream.current
        ?.getVideoTracks()[0];

    if (!track) return;

    track.enabled = !track.enabled;

    setCameraOn(track.enabled);

  };

  // =====================================
  // Toggle Microphone
  // =====================================

  const toggleMic = () => {

    const track =
      localStream.current
        ?.getAudioTracks()[0];

    if (!track) return;

    track.enabled = !track.enabled;

    setMicOn(track.enabled);

  };

  // =====================================
  // Send Chat
  // =====================================

  const sendMessage = () => {

    if (!message.trim()) return;

    socket.emit("chat-message", {
      roomId,
      sender: "Patient",
      message,
      time: new Date(),
    });

    setMessages((prev) => [
      ...prev,
      {
        sender: "Patient",
        message,
        time: new Date(),
      },
    ]);

    setMessage("");

  };

  // =====================================
  // Leave Call
  // =====================================

  const leaveCall = () => {

    localStream.current?.getTracks().forEach(track =>
      track.stop()
    );

    peerConnection.current?.close();

    socket.disconnect();

    window.close();

  };

  // =====================================
  // Call Timer
  // =====================================

  useEffect(() => {

    const timer = setInterval(() => {
      setCallTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);

  }, []);

  // =====================================
  // UI
  // =====================================

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {loading && (
        <Loader
          fullScreen
          text="Opening Camera..."
        />
      )}

      <div className="p-5">

        <div className="flex justify-between items-center mb-5">

          <h1 className="text-3xl font-bold">
            Patient Video Call
          </h1>

          <div className="text-green-400 font-bold">
            {connected
              ? "🟢 Connected"
              : "🟡 Waiting..."}
          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* Local */}

          <div>

            <h2 className="mb-2 font-bold">
              You
            </h2>

            <video
              ref={localVideo}
              autoPlay
              muted
              playsInline
              className="rounded-xl w-full bg-black"
            />

          </div>

          {/* Remote */}

          <div>

            <h2 className="mb-2 font-bold">
              Officer
            </h2>

            <video
              ref={remoteVideo}
              autoPlay
              playsInline
              className="rounded-xl w-full bg-black"
            />

          </div>

        </div>

        {/* Controls */}

        <div className="flex flex-wrap gap-3 mt-6">

          <button
            onClick={startCall}
            className="bg-green-600 px-6 py-3 rounded-lg"
          >
            Start Call
          </button>

          <button
            onClick={toggleCamera}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            {cameraOn ? "Turn Camera Off" : "Turn Camera On"}
          </button>

          <button
            onClick={toggleMic}
            className="bg-yellow-600 px-6 py-3 rounded-lg"
          >
            {micOn ? "Mute Mic" : "Unmute Mic"}
          </button>

          <button
            onClick={leaveCall}
            className="bg-red-600 px-6 py-3 rounded-lg"
          >
            Leave
          </button>

        </div>

        {/* Call Duration */}

        <div className="mt-5 text-lg">
          Duration : {Math.floor(callTime / 60)}m {callTime % 60}s
        </div>

        {/* Chat */}

        <div className="mt-8 bg-white text-black rounded-xl p-4">

          <h2 className="font-bold mb-3">
            Chat
          </h2>

          <div className="h-56 overflow-y-auto border rounded p-3">

            {messages.map((msg, index) => (

              <div
                key={index}
                className="mb-2"
              >
                <strong>{msg.sender} :</strong>{" "}
                {msg.message}
              </div>

            ))}

          </div>

          <div className="flex mt-3">

            <input
              className="border flex-1 p-2 rounded-l"
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Type message..."
            />

            <button
              onClick={sendMessage}
              className="bg-blue-700 text-white px-5 rounded-r"
            >
              Send
            </button>

          </div>

        </div>

      </div>

    </div>
  );

};

export default PatientVideoCall;
