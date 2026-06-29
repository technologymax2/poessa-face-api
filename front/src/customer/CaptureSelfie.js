import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

// የ ImgBB API ቁልፍ (ከፈለግክ በ.env ፋይል ውስጥ ማስቀመጥ ትችላለህ)
const IMGBB_API_KEY = "ebd592608f4dba1e8271bec8e920c408";

function CaptureSelfie({ onSuccess }) {
  const [image, setImage] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const videoRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      setStatus("ካሜራ መክፈት አልተቻለም");
      console.error(err);
    }
  };

  const captureSelfie = async () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const base64Image = canvas.toDataURL("image/jpeg", 0.7);

    setUploading(true);
    setStatus("⏳ ምስል በማስኬድ ላይ...");

    try {
      // 1. ImgBB Upload
      const formData = new FormData();
      formData.append("image", base64Image.split(",")[1]);
      const res = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, formData);
      const uploadedUrl = res.data.data.url;

      // 2. Face Analysis (window.faceapi በመጠቀም)
      const imgElement = new Image();
      imgElement.src = base64Image;
      
      imgElement.onload = async () => {
        // የCDN ስክሪፕቱ በ index.html ውስጥ ስላለ window.faceapi ይገኛል
        const faceapi = window.faceapi;
        
        const detection = await faceapi
          .detectSingleFace(imgElement)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (detection) {
          setImage(uploadedUrl);
          setStatus("✅ ስኬታማ!");
          stopCamera();
          onSuccess({ selfieUrl: uploadedUrl, descriptor: Array.from(detection.descriptor) });
        } else {
          setStatus("⚠️ ፊት አልተገኘም፣ እንደገና ይሞክሩ።");
          setUploading(false);
        }
      };
    } catch (err) {
      console.error(err);
      setStatus("❌ ስህተት ተፈጥሯል");
      setUploading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h3>👤 Selfie Capture</h3>
      <div style={{ width: "220px", height: "220px", margin: "20px auto", borderRadius: "50%", overflow: "hidden", border: "4px solid #162447" }}>
        {image ? (
          <img src={image} alt="Selfie" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <video ref={videoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
      </div>
      <p style={{ color: "#b45309" }}>{status}</p>
      {!image && (
        <button onClick={captureSelfie} disabled={uploading} style={{ padding: "15px", background: "#22c55e", color: "#fff", border: "none", borderRadius: "8px" }}>
          {uploading ? "እባክዎ ይጠብቁ..." : "📸 ፎቶ አንሳ"}
        </button>
      )}
    </div>
  );
}

export default CaptureSelfie;
