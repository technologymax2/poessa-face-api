import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";

const faceapi = window.faceapi;

const WebcamCapture = ({ onCapture, preview }) => {
  const webcamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [facingMode, setFacingMode] = useState("user");
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [status, setStatus] = useState("Idle");
  const [challenge, setChallenge] = useState(null);
const [livenessPassed, setLivenessPassed] = useState(false);

  // 1. Efficient Model Loading
  useEffect(() => {
    const loadModels = async () => {
      try {
        setStatus("Loading models...");
        const MODEL_URL = process.env.REACT_APP_MODEL_URL || "/models";
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        ]);
        
        setIsModelLoaded(true);
        setStatus("Ready");
      } catch (error) {
  console.error("Model loading error:", error);
  alert(error.message);
  setStatus("Error loading models");
}
    };
    loadModels();

    setChallenge("LOOK_LEFT");
  }, []);


  const checkLiveness = (detection) => {
  const landmarks = detection.landmarks;

  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();

  const nose = landmarks.getNose();

  const leftX = leftEye[0].x;
  const rightX = rightEye[3].x;
  const noseX = nose[3].x;

  // LOOK LEFT
  if (challenge === "LOOK_LEFT") {
    if (noseX > (leftX + rightX) / 2 + 10) {
      setChallenge("LOOK_RIGHT");
      return false;
    }
  }

  // LOOK RIGHT
  if (challenge === "LOOK_RIGHT") {
    if (noseX < (leftX + rightX) / 2 - 10) {
      setChallenge("SMILE");
      return false;
    }
  }

  // SMILE
  if (challenge === "SMILE") {
    if (detection.expressions.happy > 0.8) {
      setChallenge("DONE");
      setLivenessPassed(true);
      return true;
    }
  }

  return false;
};
  // 2. Optimized Capture Logic
  const capture = useCallback(async () => {
    if (!isModelLoaded || !webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    try {
      setStatus("Analyzing...");
      
      // Load image and convert for processing
      const img = await faceapi.fetchImage(imageSrc);
      
      const detection = await faceapi.detectSingleFace(
        img, 
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceDescriptor()
      .withFaceExpressions()
      .withAgeAndGender();

      if (!detection) {
        setStatus("Ready");
        alert("⚠️ ፊት አልተገኘም! እባክዎ በደንብ ብርሃን ባለበት ቦታ ይሞክሩ።");
        return;
      }


      
      // Convert to File for upload
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const file = new File([blob], `capture_${Date.now()}.jpg`, { type: "image/jpeg" });

      setCameraOn(false);
      setStatus("Ready");
      if (onCapture) {
  onCapture(file, imageSrc, detection.descriptor);
}
    } catch (err) {
      setStatus("Ready");
      alert("ስህተት ተፈጠረ። እባክዎ እንደገና ይሞክሩ።");
    }
  }, [onCapture, isModelLoaded]);

  return (
    <div className="w-full max-w-md mx-auto p-4">
      {!cameraOn && !preview && (
        <button 
          onClick={() => setCameraOn(true)} 
          disabled={!isModelLoaded}
          className="w-full bg-blue-600 disabled:bg-gray-400 text-white py-3 rounded-xl font-bold transition-all hover:bg-blue-700"
        >
          {isModelLoaded ? "📷 ካሜራ ይክፈቱ" : "⌛ AI ሞዴሎችን በመጫን ላይ..."}
        </button>
      )}

      {cameraOn && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border-4 border-blue-100">
           
            <div className="text-center font-bold text-blue-700">
  {challenge === "LOOK_LEFT" && "👈 Please Look Left"}
  {challenge === "LOOK_RIGHT" && "👉 Please Look Right"}
  {challenge === "SMILE" && "😊 Please Smile"}
  {challenge === "DONE" && "✅ Liveness Passed"}
</div>
            
            <Webcam 
              ref={webcamRef} 
              audio={false} 
              screenshotFormat="image/jpeg" 
              videoConstraints={{ facingMode }} 
              className="w-full aspect-square object-cover" 
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setFacingMode(prev => prev === "user" ? "environment" : "user")} className="p-3 bg-gray-200 rounded-lg">🔄</button>
            <button onClick={capture} className="flex-1 bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700">{status}</button>
            <button onClick={() => setCameraOn(false)} className="px-6 bg-red-500 text-white rounded-lg">ሰርዝ</button>
          </div>
        </div>
      )}
      
      {preview && !cameraOn && (
        <div className="space-y-3">
          <img src={preview} alt="Result" className="w-full rounded-lg shadow-lg" />
          <button onClick={() => setCameraOn(true)} className="w-full bg-yellow-500 text-white py-2 rounded-lg font-bold">እንደገና ይሞክሩ</button>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
