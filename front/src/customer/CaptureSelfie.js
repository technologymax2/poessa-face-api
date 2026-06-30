import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

function CaptureSelfie({ onSuccess }) {
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      .then(s => videoRef.current.srcObject = s);
  }, []);

  const captureSelfie = async () => {
    setLoading(true);
    const canvas = document.createElement("canvas");
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg", 0.7);

    const res = await axios.post(`https://api.imgbb.com/1/upload?key=ebd592608f4dba1e8271bec8e920c408`, { image: base64.split(",")[1] }, { headers: { 'Content-Type': 'multipart/form-data' } });
    const detection = await window.faceapi.detectSingleFace(new Image().src = base64).withFaceLandmarks().withFaceDescriptor();
    
    onSuccess({ selfieUrl: res.data.data.url, descriptor: Array.from(detection.descriptor) });
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h3>👤 ደረጃ 2፡ Selfie</h3>
      <video ref={videoRef} autoPlay style={{ width: "200px", borderRadius: "50%" }} />
      <button onClick={captureSelfie} disabled={loading}>ፎቶ አንሳ እና አረጋግጥ</button>
    </div>
  );
}
export default CaptureSelfie;