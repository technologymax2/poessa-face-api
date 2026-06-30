import React, { useRef, useState } from "react";

function CaptureSelfie({ onSuccess }) {
  const videoRef = useRef(null);
  
  const captureSelfie = async () => {
    const canvas = document.createElement("canvas");
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    const imgElement = new Image();
    imgElement.src = canvas.toDataURL("image/jpeg");
    
    // window.faceapiን ከCDN መጠቀም
    const detection = await window.faceapi.detectSingleFace(imgElement).withFaceDescriptor();
    if (detection) onSuccess({ descriptor: Array.from(detection.descriptor) });
    else alert("ፊት አልተገኘም!");
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline />
      <button onClick={captureSelfie}>Selfie አንሳ</button>
    </div>
  );
}
export default CaptureSelfie;