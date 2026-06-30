import React, { useState } from "react";
import CaptureIDCard from "./CaptureIDCard";
import CaptureSelfie from "./CaptureSelfie";


function App() {
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState({});

  return (
    <>
      {step === 1 && <CaptureIDCard onSuccess={(d) => {setUserData(d); setStep(2)}} />}
      {step === 2 && <Liveness onSuccess={(d) => {setUserData({...userData, ...d}); setStep(3)}} />}
      {step === 3 && <CaptureSelfie onSuccess={(d) => {setUserData({...userData, ...d}); setStep(4)}} />}
      {step === 4 && <FaceMatch data={userData} onSuccess={() => alert("ሁሉም ተጠናቋል!")} />}
    </>
  );
}
export default App;