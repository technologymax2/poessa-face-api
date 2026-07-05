import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Webcam from "react-webcam";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";

const faceapi = window.faceapi;

const Liveness = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const webcamRef = useRef(null);

  const { pensioner, imageFile, capturedImage, faceDescriptor } =
    location.state || {};

  const [loading, setLoading] = useState(true);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  const [instruction, setInstruction] = useState("Loading AI...");
  const [step, setStep] = useState(0);

  const steps = [
    "👈 Look Left",
    "👉 Look Right",
    "😉 Blink",
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
      .withFaceExpressions();
  };

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
                  width: `${(step / 4) * 100}%`,
                }}
              />
            </div>

          </div>

          <div className="rounded-xl overflow-hidden border">

            <Webcam
              ref={webcamRef}
              audio={false}
              mirrored={true}
              screenshotFormat="image/jpeg"
              className="w-full"
            />

          </div>

          <div className="mt-6 text-center text-gray-700">

            {modelsLoaded
              ? "Camera Ready"
              : "Loading Models..."}

          </div>

        </div>

      </div>
    </>
  );
};

export default Liveness;
