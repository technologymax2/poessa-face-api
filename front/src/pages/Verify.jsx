import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import WebcamCapture from "../components/WebcamCapture";
import ImageUpload from "../components/ImageUpload";
import Loader from "../components/Loader";
import { searchPensioner, verifyPensioner } from "../services/api";

const API_URL = process.env.REACT_APP_API_URL.replace("/api", "");

const Verify = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [pensioner, setPensioner] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageMethod, setImageMethod] = useState("camera");
  const [verificationResult, setVerificationResult] = useState(null);
  const [faceDescriptor, setFaceDescriptor] = useState(null); // አዲስ state

  const executeSearch = useCallback(async (query) => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      setVerificationResult(null);
      setCapturedImage(null);
      setImageFile(null);
      setPreview(null);
      const res = await searchPensioner(query);
      if (!res.data.success || res.data.data.length === 0) {
        setPensioner(null);
        alert("Pensioner not found.");
        return;
      }
      setPensioner(res.data.data[0]);
    } catch (err) {
      console.error(err);
      setPensioner(null);
      alert(err.response?.data?.message || "Pensioner not found.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const pid = searchParams.get("pid");
    if (pid) {
      setSearch(pid);
      executeSearch(pid);
    }
  }, [searchParams, executeSearch]);

  const handleSearchClick = () => {
    if (!search.trim()) { alert("Enter Pensioner ID or Fayda Number."); return; }
    executeSearch(search);
  };

  // የፊት መለኪያውን (descriptor) ለመቀበል የተሻሻለ
  const handleCapture = (file, image, descriptor) => {
  console.log("Descriptor:", descriptor);
  console.log("Length:", descriptor?.length);

  setCapturedImage(image);
  setPreview(image);
  setFaceDescriptor(descriptor);
  setImageFile(null);
};

  const handleUpload = (file, imagePreview) => {
    setImageFile(file);
    setPreview(imagePreview);
    setCapturedImage(null);
    setFaceDescriptor(null);
  };

  const handleVerifyIdentity = async () => {
  if (!capturedImage && !imageFile) {
    alert("Please capture or upload a verification photo.");
    return;
  }

  try {
    setLoading(true);
    setVerificationResult(null);

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
    } else if (capturedImage) {
      const blob = await (await fetch(capturedImage)).blob();
      formData.append(
        "selfie",
        new File([blob], "selfie.jpg", { type: "image/jpeg" })
      );
    }

    // ===== DEBUG =====
    console.log("faceDescriptor:", faceDescriptor);
    console.log("Descriptor Length:", faceDescriptor?.length);

    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    // =================

    const res = await verifyPensioner(formData);

    console.log("Verify Response:", res.data);

    setVerificationResult({
  verified: res.data.data.verified,
  faceMatched: res.data.data.faceMatched,
  livenessPassed: res.data.data.livenessPassed,
  distance: res.data.data.distance,
  similarity: res.data.data.similarity,
  message: res.data.message,
});
  } catch (err) {
    console.error(err);

    setVerificationResult({
      verified: false,
      faceMatched: false,
      livenessPassed: false,
      similarity: 0,
      message: err.response?.data?.message || "Verification failed.",
    });
  } finally {
    setLoading(false);
  }
};
  return (
    <>
      <Navbar />
      {loading && <Loader fullScreen size="lg" text="Processing..." />}
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">Pensioner Verification</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <input type="text" value={search} placeholder="Enter Pensioner ID or Fayda Number" onChange={(e) => setSearch(e.target.value)} className="flex-1 border rounded-lg p-3" />
            <button onClick={handleSearchClick} className="bg-blue-700 hover:bg-blue-800 text-white px-8 rounded-lg">Search</button>
          </div>

          {pensioner && (
            <div className="grid md:grid-cols-2 gap-8 border-t pt-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Registered Information</h3>
                <div className="bg-gray-50 border rounded-lg p-4 space-y-2">
                  <p><strong>ID:</strong> {pensioner.pensionerId}</p>
                  <p><strong>Name:</strong> {pensioner.nameEng}</p>
                  <p><strong>Fayda:</strong> {pensioner.faydaNumber}</p>
                </div>
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Registered Photo</h4>
                  <img src={`${API_URL}${pensioner.image}`} alt={pensioner.nameEng} className="w-64 h-64 object-cover rounded-lg border shadow" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Verification Photo</h3>
                <div className="flex gap-4 mb-5">
                  <button type="button" onClick={() => setImageMethod("camera")} className={`px-5 py-2 rounded-lg ${imageMethod === "camera" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>📷 Camera</button>
                  <button type="button" onClick={() => setImageMethod("upload")} className={`px-5 py-2 rounded-lg ${imageMethod === "upload" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>📁 Upload</button>
                </div>

                {imageMethod === "camera" ? (
                  <WebcamCapture onCapture={handleCapture} preview={preview} />
                ) : (
                  <ImageUpload onImageSelect={handleUpload} preview={preview} />
                )}

                <button type="button" onClick={handleVerifyIdentity} className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg">Verify Identity</button>

                {verificationResult && (
  <div
    className={`mt-6 p-5 rounded-lg border ${
      verificationResult.verified
        ? "bg-green-50 border-green-400"
        : "bg-red-50 border-red-400"
    }`}
  >
    <p>
      <strong>Face Match:</strong>{" "}
      {verificationResult.faceMatched ? "✅ Yes" : "❌ No"}
    </p>

    <p>
      <strong>Status:</strong>{" "}
      {verificationResult.verified
        ? "✅ VERIFIED"
        : "❌ NOT VERIFIED"}
    </p>

    <p>
      <strong>Distance:</strong>{" "}
      {verificationResult.distance?.toFixed(4)}
    </p>

    <p>
      <strong>Similarity:</strong>{" "}
      {(verificationResult.similarity * 100).toFixed(2)}%
    </p>

    <p className="mt-3 font-semibold">
      {verificationResult.message}
    </p>
  </div>
)}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Verify;
