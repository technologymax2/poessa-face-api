import React, { useState, useRef } from "react";
import axios from "axios";

const API_BASE_URL = "https://poessa-face-api.onrender.com";
const IMGBB_API_KEY = "ebd592608f4dba1e8271bec8e920c408";

function CaptureIDCard({ onSuccess }) {
  const [faydaNumber, setFaydaNumber] = useState("");
  const [image, setImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef(null);

  const startCamera = async () => {
    setCameraActive(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    if (videoRef.current) videoRef.current.srcObject = stream;
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const base64 = canvas.toDataURL("image/jpeg", 0.7);

    video.srcObject.getTracks().forEach(t => t.stop());
    setCameraActive(false);
    setLoading(true);

    const formData = new FormData();
    formData.append("image", base64.split(",")[1]);
    const res = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, formData);
    setImage(res.data.data.url);
    setLoading(false);
  };

  const handleSubmit = async () => {
    onSuccess({ faydaNumber, idPhotoUrl: image });
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h3>🆔 ደረጃ 1፡ መታወቂያ</h3>
      <div style={{ height: "200px", border: "2px dashed #ccc" }}>
        {cameraActive ? <video ref={videoRef} autoPlay style={{ width: "100%" }} /> : image && <img src={image} style={{ height: "100%" }} />}
      </div>
      <button onClick={cameraActive ? capturePhoto : startCamera}>{cameraActive ? "ፎቶ አንሳ" : "ካሜራ ክፈት"}</button>
      <input value={faydaNumber} onChange={e => setFaydaNumber(e.target.value)} placeholder="የፋይዳ ቁጥር" />
      <button onClick={handleSubmit} disabled={loading}>ቀጥል →</button>
    </div>
  );
}
export default CaptureIDCard;