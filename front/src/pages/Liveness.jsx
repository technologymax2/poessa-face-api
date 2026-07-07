import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import { verifyPensioner } from "../services/api";


const faceapi = window.faceapi;

const Liveness = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const webcamRef = useRef(null);

  const { pensioner, imageFile, capturedImage, faceDescriptor } =
    location.state || {};

  const [loading, setLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);
const [completed, setCompleted] = useState(false);
  const [instruction, setInstruction] = useState("Loading AI...");
  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const steps = [
    "👈 Look Left",
    "👉 Look Right",
    "😊 Smile",
    "✅ Completed",
  ];

  useEffect(() => {
    if (!pensioner) {
      navigate("/verify");
    }
  }, [pensioner, navigate]);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL =
          process.env.REACT_APP_MODEL_URL || "/models";

       await Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
  faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
  faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
  faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
]);

        setModelsLoaded(true);
        setInstruction(steps[0]);
      } catch (err) {
        console.error(err);
        alert("Unable to load AI models.");
      } finally {
        setLoading(false);
      }
    };

    loadModels();
  }, []);

  const detectFace = async () => {
    if (!webcamRef.current) return null;

    const screenshot = webcamRef.current.getScreenshot();
    if (!screenshot) return null;

    const img = await faceapi.fetchImage(screenshot);

    return await faceapi
  .detectSingleFace(
    img,
    new faceapi.TinyFaceDetectorOptions()
  )
  .withFaceLandmarks()
  .withFaceExpressions()
  .withFaceDescriptor();
  };

  const finishVerification = async () => {
  try {
    setLoading(true);

    const formData = new FormData();

    formData.append("pensionerId", pensioner.pensionerId);

    if (faceDescriptor) {
      formData.append(
        "faceDescriptor",
        JSON.stringify(Array.from(faceDescriptor))
      );
    }

    if (imageFile) {
      formData.append("selfie", imageFile);
    } else {
      const blob = await (await fetch(capturedImage)).blob();

      formData.append(
        "selfie",
        new File([blob], "selfie.jpg", {
          type: "image/jpeg",
        })
      );
    }

    
    const res = await verifyPensioner(formData);

    setResult(res.data.data);

  } catch (err) {
    console.error(err);
    alert("Verification failed.");
  } finally {
    setLoading(false);
  }
};

  const euclideanDistance = (a, b) => {
  let sum = 0;

  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }

  return Math.sqrt(sum);
};

const checkLiveness = async () => {
  const detection = await detectFace();

  if (!detection) return;
  const distance = euclideanDistance(
  Array.from(faceDescriptor),
  Array.from(detection.descriptor)
);

if (distance > 0.6) {
  alert("❌ This face does not match the selected pensioner.");
  navigate("/verify");
  return;
}
if (detection.expressions.happy > 0.8) {
  setStep(3);
  setInstruction("Verification Completed");

  await finishVerification();
}
  const landmarks = detection.landmarks;

  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  const nose = landmarks.getNose();

  const leftX = leftEye[0].x;
  const rightX = rightEye[3].x;
  const noseX = nose[3].x;

  const center = (leftX + rightX) / 2;

  // Step 0 → Look Left
  if (step === 0) {
    if (noseX > center + 10) {
      setStep(1);
      setInstruction(steps[1]);
    }
  }

  // Step 1 → Look Right
  else if (step === 1) {
    if (noseX < center - 10) {
      setStep(2);
      setInstruction(steps[2]);
    }
  }


// Step 2 → Smile
else if (step === 2) {
  if (detection.expressions.happy > 0.8) {
    setStep(3);
    setInstruction(steps[3]);
await finishVerification();

    // እዚህ backend verification እንጠራለን
  }
}
  
};
  
useEffect(() => {
  if (!modelsLoaded) return;

  const interval = setInterval(() => {
    checkLiveness();
  }, 500);

  return () => clearInterval(interval);

}, [modelsLoaded, step]);
  
  return (
    <>
      <Navbar />

      {loading && (
        <Loader
          fullScreen
          size="lg"
          text="Loading AI..."
        />
      )}

      <div className="max-w-4xl mx-auto p-6">

        <div className="bg-white rounded-xl shadow-lg p-6">

          <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
            Liveness Detection
          </h2>

          <div className="mb-4 text-center">

            <div className="text-xl font-bold text-green-700">
              {instruction}
            </div>

            <div className="mt-3 w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-600 h-4 rounded-full"
                style={{
                  width: `${((step + 1) / steps.length) * 100}%`
                }}
              />
            </div>

          </div>

{!completed && (
  <div className="flex justify-center mt-6">
    <div className="w-[500px] h-[500px] rounded-full overflow-hidden border-8 border-blue-600 shadow-2xl">
      <Webcam
        ref={webcamRef}
        audio={false}
        mirrored
        screenshotFormat="image/jpeg"
        className="w-full h-full object-cover"
      />
    </div>
  </div>
)}
        

          <div className="mt-6 text-center text-gray-700">

            {modelsLoaded
              ? "Camera Ready"
              : "Loading Models..."}

          </div>


{completed && result && (
  <div className="mt-10 text-center">

    <div className="text-7xl mb-4">
      ✅
    </div>

    <h2 className="text-3xl font-bold text-green-700">
      Verification Successful
    </h2>

    <p className="text-lg mt-3 text-gray-700">
      Pensioner identity has been verified successfully.
    </p>

    <div className="mt-6">
      <button
        onClick={() => navigate("/verify")}
        className="bg-blue-700 text-white px-8 py-3 rounded-lg"
      >
        Verify Another Pensioner
      </button>
    </div>

  </div>
)}
          
        </div>

      </div>
    </>
  );
};

export default Liveness;
