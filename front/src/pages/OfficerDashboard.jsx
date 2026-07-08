import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import axios from "axios";
import Peer from "simple-peer";
import io from "socket.io-client";

const API =
  process.env.REACT_APP_API_URL ||
  "http://localhost:10000";

const socket = io(API, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
});

const OfficerCallCenter = () => {

  const user =
    JSON.parse(localStorage.getItem("user")) || {};

  /* ------------------------- */
  /* Video References          */
  /* ------------------------- */

  const myVideo = useRef(null);
  const remoteVideo = useRef(null);

  const peerRef = useRef(null);
  const streamRef = useRef(null);

  /* ------------------------- */
  /* States                    */
  /* ------------------------- */

  const [queue, setQueue] = useState([]);

  const [selectedCall, setSelectedCall] =
    useState(null);

  const [incomingCall, setIncomingCall] =
    useState(null);

  const [pensioner, setPensioner] =
    useState(null);

  const [messages, setMessages] =
    useState([]);

  const [message, setMessage] =
    useState("");

  const [notes, setNotes] =
    useState("");

  const [callStarted, setCallStarted] =
    useState(false);

  const [callTime, setCallTime] =
    useState(0);

  const [cameraOn, setCameraOn] =
    useState(true);

  const [micOn, setMicOn] =
    useState(true);

  const [busy, setBusy] =
    useState(false);

  const [recording, setRecording] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [officers, setOfficers] =
    useState([]);

  const [evidences, setEvidences] =
    useState([]);

  const [audit, setAudit] =
    useState([]);

  /* ------------------------- */
  /* Initialize Camera         */
  /* ------------------------- */

  const initCamera = useCallback(async () => {

    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({

          video: {
            width: 1280,
            height: 720,
            facingMode: "user",
          },

          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },

        });

      streamRef.current = stream;

      if (myVideo.current) {
        myVideo.current.srcObject = stream;
      }

    } catch (err) {

      console.log(err);

      alert("Camera permission denied.");

    }

  }, []);

  /* ------------------------- */
  /* Register Officer          */
  /* ------------------------- */

  useEffect(() => {

    initCamera();

    socket.emit("registerOfficer", {

      officerId: user._id,

      fullName: user.fullName,

    });

  }, [initCamera]);

  /* ------------------------- */
  /* Socket Connected          */
  /* ------------------------- */

  useEffect(() => {

    socket.on("connect", () => {

      console.log("Connected :", socket.id);

    });

    return () => {

      socket.off("connect");

    };

  }, []);

  /* ------------------------- */
  /* Waiting Queue             */
  /* ------------------------- */

  useEffect(() => {

    socket.on("queueUpdated", (calls) => {

      setQueue(calls);

    });

    return () => {

      socket.off("queueUpdated");

    };

  }, []);

  /* ------------------------- */
  /* Incoming Call             */
  /* ------------------------- */

  useEffect(() => {

    socket.on("incomingCall", (call) => {

      setIncomingCall(call);

      setSelectedCall(call);

    });

    return () => {

      socket.off("incomingCall");

    };

  }, []);

  /* ------------------------- */
  /* Officers Status           */
  /* ------------------------- */

  useEffect(() => {

    socket.on("officersUpdated", (list) => {

      setOfficers(list);

    });

    return () => {

      socket.off("officersUpdated");

    };

  }, []);

  /* ------------------------- */
  /* Timer                     */
  /* ------------------------- */

  useEffect(() => {

    let timer;

    if (callStarted) {

      timer = setInterval(() => {

        setCallTime((prev) => prev + 1);

      }, 1000);

    }

    return () => clearInterval(timer);

  }, [callStarted]);

  /* ------------------------- */
  /* Accept Call               */
  /* ------------------------- */

  const acceptCall = () => {

    if (!selectedCall) return;

    socket.emit("acceptCall", {

      roomId: selectedCall.roomId,

      officerId: user._id,

    });

    setBusy(true);

    setCallStarted(true);

  };

  /* ------------------------- */
  /* Reject Call               */
  /* ------------------------- */

  const rejectCall = () => {

    if (!selectedCall) return;

    socket.emit("rejectCall", {

      roomId: selectedCall.roomId,

      officerId: user._id,

    });

    setSelectedCall(null);

    setIncomingCall(null);

  };

  /* ------------------------- */
  /* Camera                    */
  /* ------------------------- */

  const toggleCamera = () => {

    const track =
      streamRef.current?.getVideoTracks()[0];

    if (!track) return;

    track.enabled = !track.enabled;

    setCameraOn(track.enabled);

    socket.emit(track.enabled ? "cameraOn" : "cameraOff", {

      roomId: selectedCall?.roomId,

    });

  };

  /* ------------------------- */
  /* Microphone                */
  /* ------------------------- */

  const toggleMic = () => {

    const track =
      streamRef.current?.getAudioTracks()[0];

    if (!track) return;

    track.enabled = !track.enabled;

    setMicOn(track.enabled);

    socket.emit(track.enabled ? "micOn" : "micOff", {

      roomId: selectedCall?.roomId,

    });

  };
 // ===============================
// OfficerCallCenter.jsx - Part 2
// ===============================


  // Receive incoming call from pensioner
  useEffect(() => {
    if (!socket) return;

    socket.on("incoming-call", ({ signal, from }) => {
      console.log("Incoming call from:", from);

      setIncomingCall({
        signal,
        from,
      });

      setCallStatus("incoming");
    });


    socket.on("call-ended", () => {
      endCall();
    });


    return () => {
      socket.off("incoming-call");
      socket.off("call-ended");
    };

  }, []);



  // Accept incoming call
  const acceptCall = () => {

    if (!incomingCall) return;


    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {

        setMyStream(stream);


        const peer = new Peer({
          initiator: false,
          trickle: false,
          stream,
        });


        peer.on("signal", (signal) => {

          socket.emit("answer-call", {
            signal,
            to: incomingCall.from,
          });

        });


        peer.on("stream", (remoteStream) => {

          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }

        });


        peer.signal(incomingCall.signal);


        peerRef.current = peer;


        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }


        setCallStatus("connected");
        setIncomingCall(null);

      });

  };




  // Reject call
  const rejectCall = () => {

    if (!incomingCall) return;


    socket.emit("reject-call", {
      to: incomingCall.from,
    });


    setIncomingCall(null);
    setCallStatus("idle");

  };




  // Start call to pensioner
  const callPensioner = (pensionerId) => {


    navigator.mediaDevices
      .getUserMedia({
        video:true,
        audio:true,
      })
      .then((stream)=>{


        setMyStream(stream);


        const peer = new Peer({
          initiator:true,
          trickle:false,
          stream,
        });



        peer.on("signal",(signal)=>{


          socket.emit("call-user",{

            pensionerId,
            signal,

          });


        });



        peer.on("stream",(remoteStream)=>{


          if(remoteVideoRef.current){

            remoteVideoRef.current.srcObject =
              remoteStream;

          }

        });



        peerRef.current = peer;



        if(myVideoRef.current){

          myVideoRef.current.srcObject =
            stream;

        }



        setCallStatus("calling");


      });


  };





  // Receive answer from pensioner
  useEffect(()=>{


    socket.on("call-accepted",({signal})=>{


      if(peerRef.current){

        peerRef.current.signal(signal);

        setCallStatus("connected");

      }


    });



    return()=>{

      socket.off("call-accepted");

    }


  },[]);






  // End call
  const endCall = ()=>{


    if(peerRef.current){

      peerRef.current.destroy();

      peerRef.current=null;

    }



    if(myStream){


      myStream.getTracks().forEach(
        track=>track.stop()
      );


    }



    if(myVideoRef.current){

      myVideoRef.current.srcObject=null;

    }


    if(remoteVideoRef.current){

      remoteVideoRef.current.srcObject=null;

    }



    setMyStream(null);

    setIncomingCall(null);

    setCallStatus("idle");


    socket.emit("end-call");

  };






  return (

    <div className="officer-call-center">


      <h2>
        Officer Video Call Center
      </h2>



      {
        callStatus==="incoming" && (

          <div className="incoming-call-box">

            <h3>
              Incoming Pensioner Call
            </h3>


            <button
              onClick={acceptCall}
            >
              Accept
            </button>


            <button
              onClick={rejectCall}
            >
              Reject
            </button>


          </div>

        )
      }




      <div className="video-container">


        <video

          ref={myVideoRef}

          autoPlay

          muted

          playsInline

          className="my-video"

        />



        <video

          ref={remoteVideoRef}

          autoPlay

          playsInline

          className="remote-video"

        />


      </div>





      {
        callStatus==="connected" && (

          <button

            className="end-call-btn"

            onClick={endCall}

          >

            End Call

          </button>

        )
      }



    </div>

  );

}

export default OfficerCallCenter;
