import React, { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";

const videoConstraints = {
  width: 400,
  height: 400,
  facingMode: "user",
};

// ከፓረንት ገጹ 'onCapture' እና 'preview' ቫልዩን እንቀበላለን
const WebcamCapture = ({ onCapture, preview }) => {
  const webcamRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);

  // ፓረንት ገጹ ላይ ፕሪቪውው ባዶ ከሆነ (ፎርም ሪሴት ሲደረግ)፣ የዚህን ኮምፖነንት ስቴትም እናስተካክላለን
  useEffect(() => {
    if (!preview) {
      setCameraOn(false);
    }
  }, [preview]);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();

    if (imageSrc) {
      setCameraOn(false);
      if (onCapture) {
        onCapture(imageSrc); // ምስሉን ወደ ላይ (Parent) እንልካለን
      }
    }
  }, [onCapture]);

  const retake = () => {
    setCameraOn(true);
    if (onCapture) {
      onCapture(null);
    }
  };

  const handleCancel = () => {
    setCameraOn(false);
    if (onCapture) {
      onCapture(null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* ካሜራው ካልተከፈተ እና እስካሁን ፎቶ ካልተነሳ */}
      {!cameraOn && !preview && (
        <button
          type="button"
          onClick={() => setCameraOn(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition"
        >
          📷 Open Camera
        </button>
      )}

      {/* ካሜራው ሲከፈት */}
      {cameraOn && (
        <div className="space-y-3">
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="rounded-lg border shadow-sm w-full object-cover"
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={capture}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
            >
              Capture
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ፎቶው ተነስቶ ፕሪቪው ዝግጁ ሲሆን */}
      {preview && !cameraOn && (
        <div className="space-y-3">
          <img
            src={preview}
            alt="Captured"
            className="w-full h-72 object-cover rounded-lg border shadow-sm"
          />

          <button
            type="button"
            onClick={retake}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-medium transition"
          >
            🔄 Retake Photo
          </button>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;