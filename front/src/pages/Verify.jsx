import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import WebcamCapture from "../components/WebcamCapture";
import ImageUpload from "../components/ImageUpload";
import Loader from "../components/Loader";
import { searchPensioner, verifyPensioner } from "../services/api"; // የአዲሱ ሰርቪስ ጥሪዎች

// ምስሎችን ከባክኤንድ ለማሳየት የ Base URL ፍላጎት ስላለን የ Axiosን መሠረት እንወስዳለን
import API from "../services/api";
const IMAGE_BASE_URL = API.defaults.baseURL.replace("/api", "");

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

  const executeSearch = useCallback(async (query) => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      setVerificationResult(null); setCapturedImage(null); setImageFile(null); setPreview(null);

      // አዲሱን የሰርቪስ ጥሪ መጠቀም
      const res = await searchPensioner(query);
      setPensioner(res.data);
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
    if (pid) { setSearch(pid); executeSearch(pid); }
  }, [searchParams, executeSearch]);

  const handleSearchClick = () => {
    if (!search.trim()) { alert("Enter Pensioner ID or Fayda Number."); return; }
    executeSearch(search);
  };

  const handleCapture = (image) => { setCapturedImage(image); setPreview(image); setImageFile(null); };
  const handleUpload = (file, previewImage) => { setImageFile(file); setPreview(previewImage); setCapturedImage(null); };

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
      if (imageFile) formData.append("image", imageFile);
      if (capturedImage) formData.append("capturedImage", capturedImage);

      // አዲሱን የሰርቪስ ጥሪ መጠቀም
      const res = await verifyPensioner(formData);
      setVerificationResult(res.data);
    } catch (err) {
      console.error(err);
      setVerificationResult({
        verified: false,
        faceMatched: false,
        livenessPassed: false,
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
        <div className="bg-white shadow-xl rounded-xl p-6">
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">Pensioner Verification</h2>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <input
              type="text"
              placeholder="Enter Pensioner ID or Fayda Number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border rounded-lg p-3"
            />
            <button onClick={handleSearchClick} className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg font-medium transition">
              Search
            </button>
          </div>

          {pensioner && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t pt-6">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Registered Information</h3>
                <div className="space-y-2 bg-gray-50 p-4 rounded-xl border">
                  <p><strong>Pensioner ID:</strong> {pensioner.pensionerId}</p>
                  <p><strong>Name:</strong> {pensioner.nameEng}</p>
                  <p><strong>Fayda Number:</strong> {pensioner.faydaNumber}</p>
                  <p><strong>POESSA Branch:</strong> {pensioner.poessaBranch}</p>
                </div>
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 text-gray-700">Registered Photo</h4>
                  <img src={`${IMAGE_BASE_URL}/${pensioner.image}`} alt="Registered" className="w-64 h-64 rounded-lg border object-cover shadow-sm" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Capture Verification Photo</h3>
                <div className="flex gap-4 mb-5">
                  <button type="button" onClick={() => setImageMethod("camera")} className={`px-5 py-2 rounded-lg font-medium transition ${imageMethod === "camera" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>📷 Camera</button>
                  <button type="button" onClick={() => setImageMethod("upload")} className={`px-5 py-2 rounded-lg font-medium transition ${imageMethod === "upload" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>📁 Upload</button>
                </div>

                {imageMethod === "camera" ? <WebcamCapture onCapture={handleCapture} /> : <ImageUpload onImageSelect={handleUpload} />}

                {preview && (
                  <div className="mt-6">
                    <img src={preview} alt="Verification" className="w-64 h-64 object-cover rounded-lg border shadow-sm" />
                  </div>
                )}

                <button type="button" onClick={handleVerifyIdentity} className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition shadow">
                  Verify Identity
                </button>

                {verificationResult && (
                  <div className={`mt-8 rounded-lg p-5 border shadow-sm ${verificationResult.verified ? "bg-green-50 border-green-400 text-green-900" : "bg-red-50 border-red-400 text-red-900"}`}>
                    <h3 className="text-xl font-bold mb-4">Verification Result</h3>
                    <p className="mb-2"><strong>Face Match:</strong> {verificationResult.faceMatched ? "✅ Yes" : "❌ No"}</p>
                    <p className="mb-2"><strong>Liveness:</strong> {verificationResult.livenessPassed ? "✅ Passed" : "❌ Failed"}</p>
                    <p className="mb-2"><strong>Status:</strong> {verificationResult.verified ? "✅ VERIFIED" : "❌ NOT VERIFIED"}</p>
                    <p className="mt-4 font-semibold border-t pt-2">{verificationResult.message}</p>
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