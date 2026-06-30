import React, { useState, useRef } from "react";
import axios from "axios";

function CaptureIDCard({ onSuccess }) {
  const [faydaNumber, setFaydaNumber] = useState("");
  const [image, setImage] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);

  const startCamera = async () => {
    setCameraActive(true);
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    videoRef.current.srcObject = stream;
  };

  const capturePhoto = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    
    // ImgBB Upload
    const formData = new FormData();
    formData.append("image", dataUrl.split(",")[1]);
    const res = await axios.post(`https://api.imgbb.com/1/upload?key=ebd592608f4dba1e8271bec8e920c408`, formData);
    setImage(res.data.data.url);
    videoRef.current.srcObject.getTracks().forEach(t => t.stop());
    setCameraActive(false);
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h3>🆔 ደረጃ 1፡ መታወቂያ መረጃ</h3>
      <div style={{ height: "200px", border: "1px solid #ccc" }}>
        {cameraActive ? <video ref={videoRef} autoPlay playsInline style={{ height: "100%" }} /> : <img src={image} style={{ height: "100%" }} />}
      </div>
      {!cameraActive && <button onClick={startCamera}>ካሜራ ክፈት</button>}
      {cameraActive && <button onClick={capturePhoto}>ፎቶ አንሳ</button>}
      <input value={faydaNumber} onChange={(e) => setFaydaNumber(e.target.value)} placeholder="የፋይዳ ቁጥር" />
      <button onClick={() => onSuccess({ faydaNumber, idPhotoUrl: image })}>ቀጥል →</button>
    </div>
  );
}
export default CaptureIDCard;