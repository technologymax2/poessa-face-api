import React, { useEffect, useState } from 'react';

function FaceMatch({ data, onSuccess }) {
  const [result, setResult] = useState("⏳ በማወዳደር ላይ...");

  useEffect(() => {
    const runMatch = async () => {
      try {
        const idImg = await window.faceapi.fetchImage(data.idPhotoUrl);
        const idDetection = await window.faceapi.detectSingleFace(idImg).withFaceDescriptor();
        const selfieDescriptor = new Float32Array(data.descriptor);

        if (idDetection) {
          const distance = window.faceapi.euclideanDistance(idDetection.descriptor, selfieDescriptor);
          if (distance < 0.6) {
            setResult("✅ ስኬታማ! ተመሳስለዋል።");
            onSuccess();
          } else {
            setResult("❌ አይመሳሰሉም።");
          }
        }
      } catch (e) {
        setResult("⚠️ ስህተት ተፈጥሯል");
      }
    };
    runMatch();
  }, [data, onSuccess]);

  return <h3>{result}</h3>;
}
export default FaceMatch;