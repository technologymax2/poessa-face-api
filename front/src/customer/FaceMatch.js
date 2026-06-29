import React, { useEffect, useState } from 'react';

function FaceMatch({ data }) {
  const [matchResult, setMatchResult] = useState("⏳ የፊት ማነጻጸሪያ እየተካሄደ ነው...");
  const [isMatch, setIsMatch] = useState(null);

  useEffect(() => {
    const runMatch = async () => {
      try {
        // የCDN ስክሪፕቱ በ index.html ስላለ window.faceapiን እንጠቀማለን
        const faceapi = window.faceapi;

        // 1. መታወቂያ ላይ ያለውን ፊት ለመለየት ፎቶውን እንደ ምስል መጫን
        const imgID = await faceapi.fetchImage(data.idPhotoUrl);
        
        // 2. ፊቱን መለየት
        const detectionID = await faceapi
          .detectSingleFace(imgID)
          .withFaceLandmarks()
          .withFaceDescriptor();

        // 3. Selfie ላይ ያለውን Descriptor ከዳታ (Props) መጠቀም
        // descriptorArray ን ወደ Float32Array መቀየር ያስፈልጋል
        const descriptorSelfie = new Float32Array(data.descriptor);

        if (!detectionID) {
          setMatchResult("⚠️ በመታወቂያው ላይ ፊት ማግኘት አልተቻለም።");
          return;
        }

        // 4. የርቀት መለኪያ (Euclidean Distance)
        const distance = faceapi.euclideanDistance(detectionID.descriptor, descriptorSelfie);
        
        // 0.6 ወይም ከዚያ በታች ከሆነ አንድ ሰው ናቸው
        if (distance < 0.6) {
          setIsMatch(true);
          setMatchResult("✅ ማረጋገጫ ተሳክቷል! የጡረተኛው ማንነት ተረጋግጧል።");
        } else {
          setIsMatch(false);
          setMatchResult("❌ ማረጋገጫ አልተሳካም! ፊቶቹ አይመሳሰሉም።");
        }
      } catch (err) {
        console.error(err);
        setMatchResult("⚠️ ስህተት ተፈጥሯል፡ " + err.message);
      }
    };

    runMatch();
  }, [data]);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h3>የማንነት ማረጋገጫ ውጤት</h3>
      <div style={{ fontSize: "20px", fontWeight: "bold", color: isMatch ? "green" : "red" }}>
        {matchResult}
      </div>
      {isMatch && (
        <button 
          onClick={() => window.location.reload()} 
          style={{ marginTop: "20px", padding: "10px 20px" }}
        >
          ወደ ዋናው ገጽ ተመለስ
        </button>
      )}
    </div>
  );
}

export default FaceMatch;
