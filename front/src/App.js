import React, { useState } from 'react';
import CaptureIDCard from './customer/CaptureIDCard';
import CaptureSelfie from './customer/CaptureSelfie';
import FaceMatch from './customer/FaceMatch'; // ይህንን ገጽ ገና እንሠራዋለን

function App() {
  const [step, setStep] = useState(1); // 1: ID, 2: Selfie, 3: Match
  const [userData, setUserData] = useState({ faydaNumber: '', idPhotoUrl: '', selfieUrl: '', descriptor: null });

  // ከ ID ካርድ ወደ Selfie የሚሸጋገርበት
  const handleIDSuccess = (data) => {
    setUserData({ ...userData, ...data });
    setStep(2);
  };

  // ከ Selfie ወደ Match የሚሸጋገርበት
  const handleSelfieSuccess = (data) => {
    setUserData({ ...userData, selfieUrl: data.selfieUrl, descriptor: data.currentDescriptor });
    setStep(3);
  };

  return (
    <div className="App">
      {step === 1 && <CaptureIDCard onSuccess={handleIDSuccess} />}
      {step === 2 && <CaptureSelfie onSuccess={handleSelfieSuccess} />}
      {step === 3 && <FaceMatch data={userData} />}
    </div>
  );
}

export default App;