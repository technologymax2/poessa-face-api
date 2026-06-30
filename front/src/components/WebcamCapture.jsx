

import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 400,
  height: 400,
  facingMode: "user",
};

const WebcamCapture = ({ onCapture }) => {
  const webcamRef = useRef(null);

  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraOn, setCameraOn] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();

    if (imageSrc) {
      setCapturedImage(imageSrc);
      setCameraOn(false);

      if (onCapture) {
        onCapture(imageSrc);
      }
    }
  }, [webcamRef, onCapture]);

  const retake = () => {
    setCapturedImage(null);
    setCameraOn(true);

    if (onCapture) {
      onCapture(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">

      {!cameraOn && !capturedImage && (
        <button
          type="button"
          onClick={() => setCameraOn(true)}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Open Camera
        </button>
      )}

      {cameraOn && (
        <div className="space-y-3">

          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="rounded-lg border shadow w-full"
          />

          <div className="flex gap-2">

            <button
              type="button"
              onClick={capture}
              className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
            >
              Capture
            </button>

            <button
              type="button"
              onClick={() => setCameraOn(false)}
              className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
            >
              Cancel
            </button>

          </div>

        </div>
      )}

      {capturedImage && (
        <div className="space-y-3">

          <img
            src={capturedImage}
            alt="Captured"
            className="w-full rounded-lg border shadow"
          />

          <button
            type="button"
            onClick={retake}
            className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600"
          >
            Retake Photo
          </button>

        </div>
      )}
    </div>
  );
};

export default WebcamCapture;

