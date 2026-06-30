import React, { useEffect, useState } from 'react';

function FaceMatch({ data }) {
  const [result, setResult] = useState("⏳ በማወዳደር ላይ...");

  useEffect(() => {
    const runMatch = async () => {
      const imgID = await window.faceapi.fetchImage(data.idPhotoUrl);
      const detection = await window.faceapi.detectSingleFace(imgID).withFaceLandmarks().withFaceDescriptor();
      const dist = window.faceapi.euclideanDistance(detection.descriptor, new Float32Array(data.descriptor));
      setResult(dist < 0.6 ? "✅ ስኬታማ! ተመሳስለዋል" : "❌ አይመሳሰሉም");
    };
    runMatch();
  }, [data]);

  return <h3>{result}</h3>;
}
export default FaceMatch;