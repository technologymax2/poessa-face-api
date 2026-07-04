import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";

const WebcamCapture = ({ onCapture, preview }) => {
  const webcamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [facingMode, setFacingMode] = useState("user");
  const [isModelLoaded, setIsModelLoaded] = useState(false);

  // 1. ሞዴሎችን መጫን
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models'; 
      await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await window.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      setIsModelLoaded(true);
      console.log("Face-api models loaded successfully!");
    };
    loadModels();
  }, []);

  const videoConstraints = {
    width: 400,
    height: 400,
    facingMode,
  };

  useEffect(() => {
    if (!preview) setCameraOn(false);
  }, [preview]);

  // 2. ፊትን መለየት እና መያዝ (Capture & Detect)
  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc || !isModelLoaded) return;

    // ፊትን ለመለየት ምስሉን ማዘጋጀት
    const img = await window.faceapi.fetchImage(imageSrc);
    const detection = await window.faceapi.detectSingleFace(img, new window.faceapi.TinyFaceDetectorOptions())
                                           .withFaceLandmarks()
                                           .withFaceDescriptor();

    if (!detection) {
      alert("⚠️ ፊት አልተገኘም! እባክዎ ፊትዎን በግልጽ ያሳዩ።");
      return;
    }

    // ምስሉን ወደ File መቀየር
    const byteString = atob(imageSrc.split(",")[1]);
    const mimeString = imageSrc.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
    
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });

    setCameraOn(false);

    if (onCapture) {
      // ፋይሉን እና የፊቱን መለኪያ (descriptor) ለወላጅ ኮምፖነንት እንልካለን
      onCapture(file, imageSrc, detection.descriptor);
    }
  }, [onCapture, isModelLoaded]);

  const retake = () => {
    setCameraOn(true);
    if (onCapture) onCapture(null, null, null);
  };

  const handleCancel = () => {
    setCameraOn(false);
    if (onCapture) onCapture(null, null, null);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {!cameraOn && !preview && (
        <button type="button" onClick={() => setCameraOn(true)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition">
          📷 Open Camera
        </button>
      )}

      {cameraOn && (
        <div className="space-y-3">
          <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" videoConstraints={videoConstraints} className="rounded-lg border shadow-sm w-full object-cover" />
          <div className="flex gap-3">
            <button type="button" onClick={() => setFacingMode((prev) => (prev === "user" ? "environment" : "user"))} className="bg-blue-600 text-white px-4 rounded-lg">🔄 Toggle</button>
            <button type="button" onClick={capture} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium">
              {isModelLoaded ? "Capture & Verify" : "Loading..."}
            </button>
            <button type="button" onClick={handleCancel} className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-medium">Cancel</button>
          </div>
        </div>
      )}

      {preview && !cameraOn && (
        <div className="space-y-3">
          <img src={preview} alt="Captured Result" className="w-full h-72 object-cover rounded-lg border shadow-sm" />
          <button type="button" onClick={retake} className="w-full bg-yellow-500 text-white py-2 rounded-lg font-medium">🔄 Retake Photo</button>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
