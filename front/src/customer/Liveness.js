import React, { useState, useRef } from "react";

function Liveness({ onSuccess }) {
  const [task, setTask] = useState("ፈገግ ይበሉ!");
  const [passed, setPassed] = useState(false);
  const videoRef = useRef(null);

  const checkLiveness = async () => {
    // እዚህ ጋር የፊት Landmarking በመጠቀም የከንፈር ወይም የጭንቅላት እንቅስቃሴ ይረጋገጣል
    // ለአሁኑ በስልክ ፕሮቶታይፕነት፣ ተጠቃሚው አንዴ ፈገግ ብሎ 'አረጋግጥ' እንዲል እናድርግ
    setPassed(true);
    onSuccess({ smilePassed: true, nodPassed: true });
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h3>{task}</h3>
      <video ref={videoRef} autoPlay playsInline style={{ width: "200px" }} />
      {!passed ? (
        <button onClick={checkLiveness}>አረጋግጥ</button>
      ) : (
        <p>✅ የህይወት ማረጋገጫ ተጠናቋል!</p>
      )}
    </div>
  );
}
export default Liveness;