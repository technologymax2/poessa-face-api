import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";

const FaceProcessor = ({ onResult }) => {
  const webcamRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [cameraOn, setCameraOn] = useState(false);
  const [preview, setPreview] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [status, setStatus] = useState("Loading...");

  // ሞዴሎችን መጫን
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models';
        await window.faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        await window.faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
        
        setIsModelLoaded(true);
        setStatus("Ready");
      } catch (e) {
        setStatus("Model load error");
        alert("ሞዴሎቹ አልተገኙም");
      }
    };
    loadModels();
  }, []);

  // የጋራ የፊት መለየት ሂደት
  const processImage = async (imageSrc) => {
    setStatus("Analyzing...");
    const img = await window.faceapi.fetchImage(imageSrc);
    const detection = await window.faceapi.detectSingleFace(img, new window.faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      alert("⚠️ ፊት አልተገኘም!");
      setStatus("Ready");
      return;
    }
    onResult(detection.descriptor);
    setStatus("Ready");
  };

  // ካሜራ
  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) processImage(imageSrc);
  }, []);

  // ፋይል መምረጥ
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        processImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <div className="text-center font-bold">Status: {status}</div>

      {/* የፋይል መምረጫ */}
      {!cameraOn && !preview && (
        <label className="block border-2 border-dashed p-6 cursor-pointer text-center">
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          <p>Click to Upload Image or</p>
        </label>
      )}

      {/* የካሜራ አማራጭ */}
      {!preview && (
        <button onClick={() => setCameraOn(!cameraOn)} className="w-full bg-blue-600 text-white p-2">
          {cameraOn ? "Close Camera" : "Open Camera"}
        </button>
      )}

      {cameraOn && (
        <div className="space-y-2">
          <Webcam ref={webcamRef} screenshotFormat="image/jpeg" className="w-full" />
          <button onClick={capture} className="w-full bg-green-600 text-white p-2">Capture & Verify</button>
        </div>
      )}

      {preview && (
        <button onClick={() => { setPreview(null); setStatus("Ready"); }} className="w-full bg-red-600 text-white p-2">Remove Image</button>
      )}
    </div>
  );
};

export default FaceProcessor;
