import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";

const WebcamCapture = ({ onCapture, preview }) => {
  const webcamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [facingMode, setFacingMode] = useState("user");
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [status, setStatus] = useState("Idle");

  // ሞዴሎችን በቅደም ተከተል በመጫን ላይ
  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus("Loading models...");
        const MODEL_URL = '/models'; 
        
        // ሞዴሎችን በቅደም ተከተል መጫን ለሞባይል ብሮውዘር የተረጋጋ ነው
        await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        await window.faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL);

        setIsModelLoaded(true);
        setStatus("Ready");
        console.log("✅ All Face-api models loaded successfully!");
      } catch (error) {
        console.error("❌ Model load error:", error);
        setStatus("Error loading models");
        alert("ሞዴሎችን መጫን አልተቻለም። እባክዎ ፋይሎቹ በ public/models ውስጥ መኖራቸውን ያረጋግጡ።");
      }
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

  // ካሜራውን መያዝ እና ፊትን መለየት
  const capture = useCallback(async () => {
    if (!isModelLoaded) {
      alert("ሞዴሎች ገና እየተጫኑ ነው፣ እባክዎ ይጠብቁ...");
      return;
    }

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
        alert("⚠️ ፊት አልተገኘም! እባክዎ ፊትዎን በግልጽ ያሳዩ።");
        return;
      }

      // ምስሉን ወደ File መቀየር
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });

      setCameraOn(false);
      setStatus("Ready");

      if (onCapture) {
        onCapture(file, imageSrc, detection.descriptor);
      }
    } catch (err) {
      console.error("Capture process error:", err);
      setStatus("Ready");
      alert("የፊት መለየቱ ሂደት ላይ ስህተት ተፈጥሯል።");
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
        <button type="button" onClick={() => setCameraOn(true)} className={`w-full ${isModelLoaded ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"} text-white py-2.5 rounded-lg font-medium transition`}>
          {isModelLoaded ? "📷 Open Camera" : "⌛ Loading AI Models..."}
        </button>
      )}

      {cameraOn && (
        <div className="space-y-3">
          <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" videoConstraints={videoConstraints} className="rounded-lg border shadow-sm w-full object-cover" />
          <div className="flex gap-3">
            <button type="button" onClick={() => setFacingMode((prev) => (prev === "user" ? "environment" : "user"))} className="bg-blue-600 text-white px-4 rounded-lg">🔄</button>
            <button type="button" onClick={capture} className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium">
              {status === "Ready" ? "Capture & Verify" : status}
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
