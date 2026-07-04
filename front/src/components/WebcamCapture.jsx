import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";

const WebcamCapture = ({ onCapture, preview }) => {
  const webcamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [facingMode, setFacingMode] = useState("user");
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [status, setStatus] = useState("Idle");

  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus("Loading models...");
        const MODEL_URL = '/models'; 
        
        // ሞዴሎችን በቅደም ተከተል መጫን
        await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        await window.faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);

        setIsModelLoaded(true);
        setStatus("Ready");
        console.log("✅ Models loaded!");
      } catch (error) {
        console.error("❌ Model load error:", error);
        setStatus("Error loading models");
      }
    };

    loadModels();
  }, []);

  const capture = useCallback(async () => {
    if (!isModelLoaded) return;

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    try {
      setStatus("Analyzing...");
      const img = await window.faceapi.fetchImage(imageSrc);
      
      // ፊትን መለየት እና መረጃዎችን መውሰድ
      const detection = await window.faceapi.detectSingleFace(
        img, 
        new window.faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceDescriptor()
      .withFaceExpressions()
      .withAgeAndGender();

      if (!detection) {
        setStatus("Ready");
        alert("⚠️ ፊት አልተገኘም!");
        return;
      }

      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });

      setCameraOn(false);
      setStatus("Ready");

      if (onCapture) {
        onCapture(file, imageSrc, detection.descriptor);
      }
    } catch (err) {
      console.error(err);
      setStatus("Ready");
      alert("ስህተት ተፈጠረ።");
    }
  }, [onCapture, isModelLoaded]);

  // UI ክፍል...
  return (
    <div className="w-full max-w-md mx-auto">
      {!cameraOn && !preview && (
        <button type="button" onClick={() => setCameraOn(true)} disabled={!isModelLoaded}
                className="w-full bg-blue-600 disabled:bg-gray-400 text-white py-2.5 rounded-lg font-medium transition">
          {isModelLoaded ? "📷 Open Camera" : "⌛ Loading AI Models..."}
        </button>
      )}

      {cameraOn && (
        <div className="space-y-3">
          <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" videoConstraints={{ width: 400, height: 400, facingMode }} className="w-full" />
          <div className="flex gap-3">
            <button type="button" onClick={() => setFacingMode(prev => prev === "user" ? "environment" : "user")} className="bg-blue-600 text-white px-4 rounded-lg">🔄</button>
            <button type="button" onClick={capture} className="flex-1 bg-green-600 text-white py-2 rounded-lg">{status}</button>
            <button type="button" onClick={() => setCameraOn(false)} className="flex-1 bg-gray-600 text-white py-2 rounded-lg">Cancel</button>
          </div>
        </div>
      )}
      
      {preview && !cameraOn && (
        <div className="space-y-3">
          <img src={preview} alt="Result" className="w-full h-72 object-cover rounded-lg" />
          <button type="button" onClick={() => { setCameraOn(true); onCapture(null, null, null); }} className="w-full bg-yellow-500 text-white py-2 rounded-lg">🔄 Retake</button>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
