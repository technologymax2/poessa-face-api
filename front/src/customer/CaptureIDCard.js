import React, { useState, useRef } from "react";
import axios from "axios";

// የ API አድራሻን አስተካክለናል (ያለ ድርብ ሰረዝ)
const API_BASE_URL = "https://poessa-face-api.onrender.com";
const IMGBB_API_KEY = "ebd592608f4dba1e8271bec8e920c408";

function CaptureIDCard({ onSuccess }) {
  const [faydaNumber, setFaydaNumber] = useState("");
  const [image, setImage] = useState(null); 
  const [cameraActive, setCameraActive] = useState(false);
  const [scanStatus, setScanStatus] = useState(""); 
  const [scanning, setScanning] = useState(false); 
  const [verifyingInDB, setVerifyingInDB] = useState(false);
  const videoRef = useRef(null);

  const startCamera = async () => {
    setCameraActive(true);
    setScanStatus("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("ካሜራውን ለመጠቀም ፈቃድ ያስፈልጋል!");
    }
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    const base64Image = canvas.toDataURL("image/jpeg", 0.6);

    // ካሜራ አጥፋ
    video.srcObject.getTracks().forEach(track => track.stop());
    setCameraActive(false);
    setScanning(true);

    // ወደ ImgBB ስቀል
    try {
      const formData = new FormData();
      formData.append("image", base64Image.split(",")[1]);
      const res = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, formData);
      const url = res.data.data.url;
      setImage(url);

      // OCR እና QR በደህና ለመጥራት ማረጋገጫ (window አለመኖሩን መፈተሽ)
      if (window.jsQR) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const qr = window.jsQR(imageData.data, imageData.width, imageData.height);
        if (qr) setFaydaNumber(qr.data.match(/\d{16}/)?.[0] || "");
      }
      setScanStatus("🟢 ፎቶ ተሰቅሏል።");
    } catch (e) {
      setScanStatus("⚠️ ስህተት ተፈጥሯል");
    } finally {
      setScanning(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setVerifyingInDB(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/pensioners`);
      const found = response.data.find(p => String(p.faydaNumber).trim() === faydaNumber);
      if (found) {
        onSuccess({ faydaNumber, idPhotoUrl: image });
      } else {
        alert("❌ ይህ ቁጥር አልተገኘም");
      }
    } catch (e) {
      onSuccess({ faydaNumber, idPhotoUrl: image }); // ሴፍቲ ኔት
    } finally {
      setVerifyingInDB(false);
    }
  };

  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h3>🆔 የጡረተኛ መታወቂያ</h3>
      <div style={{ height: "200px", border: "2px dashed #ccc", marginBottom: "10px" }}>
        {cameraActive ? <video ref={videoRef} autoPlay style={{ width: "100%", height: "100%" }} /> : 
         image ? <img src={image} alt="ID" style={{ width: "100%" }} /> : <p>ካሜራ ዝግጁ ነው</p>}
      </div>
      
      {!cameraActive && <button onClick={startCamera}>📸 ካሜራ ክፈት</button>}
      {cameraActive && <button onClick={capturePhoto}>🛑 ፎቶ አንሳ</button>}
      
      <input value={faydaNumber} onChange={(e) => setFaydaNumber(e.target.value)} placeholder="የፋይዳ ቁጥር" />
      <button onClick={handleSubmit} disabled={verifyingInDB}>ቀጥል →</button>
    </div>
  );
}

export default CaptureIDCard;
