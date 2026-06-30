
// src/pages/Verify.jsx

import React, { useState } from "react";
import axios from "axios";

import Navbar from "../components/Navbar";
import WebcamCapture from "../components/WebcamCapture";
import ImageUpload from "../components/ImageUpload";
import Loader from "../components/Loader";

const Verify = () => {
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");

  const [pensioner, setPensioner] = useState(null);

  const [capturedImage, setCapturedImage] = useState(null);

  const [imageFile, setImageFile] = useState(null);

  const [preview, setPreview] = useState(null);

  const [imageMethod, setImageMethod] = useState("camera");

  const [verificationResult, setVerificationResult] = useState(null);

  const handleSearch = async () => {

    if (!search.trim()) {
      alert("Enter Pensioner ID or Fayda Number.");
      return;
    }

    try {

      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:10000/api/pensioners/search?search=${search}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPensioner(res.data);

      setVerificationResult(null);

      setCapturedImage(null);

      setImageFile(null);

      setPreview(null);

    } catch (err) {

      console.error(err);

      setPensioner(null);

      alert(
        err.response?.data?.message ||
        "Pensioner not found."
      );

    } finally {

      setLoading(false);

    }

  };

  const handleCapture = (image) => {

    setCapturedImage(image);

    setPreview(image);

    setImageFile(null);

  };

  const handleUpload = (file, previewImage) => {

    setImageFile(file);

    setPreview(previewImage);

    setCapturedImage(null);

  };

  return (
    <>
      <Navbar />

      {loading && (
        <Loader
          fullScreen
          size="lg"
          text="Loading..."
        />
      )}

      <div className="max-w-6xl mx-auto p-6">

        <div className="bg-white shadow-xl rounded-xl p-6">

          <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">
            Pensioner Verification
          </h2>

          {/* Search */}

          <div className="flex flex-col md:flex-row gap-4 mb-8">

            <input
              type="text"
              placeholder="Enter Pensioner ID or Fayda Number"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border rounded-lg p-3"
            />

            <button
              onClick={handleSearch}
              className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-lg"
            >
              Search
            </button>

          </div>

          {/* Pensioner Details */}

          {pensioner && (

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Registered Information */}

              <div>

                <h3 className="text-xl font-semibold mb-4">
                  Registered Information
                </h3>

                <div className="space-y-2">

                  <p>
                    <strong>Pensioner ID:</strong>{" "}
                    {pensioner.pensionerId}
                  </p>

                  <p>
                    <strong>Name:</strong>{" "}
                    {pensioner.nameEng}
                  </p>

                  <p>
                    <strong>Amharic Name:</strong>{" "}
                    {pensioner.nameAmh}
                  </p>

                  <p>
                    <strong>Phone:</strong>{" "}
                    {pensioner.phone}
                  </p>

                  <p>
                    <strong>Age:</strong>{" "}
                    {pensioner.age}
                  </p>

                  <p>
                    <strong>Gender:</strong>{" "}
                    {pensioner.gender}
                  </p>

                  <p>
                    <strong>Fayda Number:</strong>{" "}
                    {pensioner.faydaNumber}
                  </p>

                  <p>
                    <strong>POESSA Branch:</strong>{" "}
                    {pensioner.poessaBranch}
                  </p>

                </div>

                <div className="mt-6">

                  <h4 className="font-semibold mb-3">
                    Registered Photo
                  </h4>

                  <img
                    src={`http://localhost:10000/${pensioner.image}`}
                    alt="Registered"
                    className="w-72 h-72 rounded-lg border object-cover shadow"
                  />

                </div>

              </div>

              {/* Verification Section */}

              <div>

                <h3 className="text-xl font-semibold mb-4">
                  Capture Verification Photo
                </h3>

                <div className="flex gap-4 mb-5">

                  <button
                    type="button"
                    onClick={() => setImageMethod("camera")}
                    className={`px-5 py-2 rounded-lg ${
                      imageMethod === "camera"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    📷 Camera
                  </button>

                  <button
                    type="button"
                    onClick={() => setImageMethod("upload")}
                    className={`px-5 py-2 rounded-lg ${
                      imageMethod === "upload"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    📁 Upload
                  </button>

                </div>

                {imageMethod === "camera" ? (
                  <WebcamCapture onCapture={handleCapture} />
                ) : (
                  <ImageUpload onImageSelect={handleUpload} />
                )}

                {/* Preview */}
                {preview && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">
                      Verification Photo
                    </h4>

                    <img
                      src={preview}
                      alt="Verification"
                      className="w-72 h-72 object-cover rounded-lg border shadow"
                    />
                  </div>
                )}

                <button
                  type="button"
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
                  disabled={loading}
                  onClick={async () => {
                    if (!capturedImage && !imageFile) {
                      alert(
                        "Please capture or upload a verification photo."
                      );
                      return;
                    }

                    try {
                      setLoading(true);
                      setVerificationResult(null);

                      const token = localStorage.getItem("token");

                      const formData = new FormData();

                      formData.append(
                        "pensionerId",
                        pensioner.pensionerId
                      );

                      if (imageFile) {
                        formData.append(
                          "image",
                          imageFile
                        );
                      }

                      if (capturedImage) {
                        formData.append(
                          "capturedImage",
                          capturedImage
                        );
                      }

                      const res = await axios.post(
                        "http://localhost:10000/api/verify",
                        formData,
                        {
                          headers: {
                            Authorization: `Bearer ${token}`,
                            "Content-Type":
                              "multipart/form-data",
                          },
                        }
                      );

                      setVerificationResult(res.data);

                    } catch (err) {
                      console.error(err);

                      setVerificationResult({
                        verified: false,
                        faceMatched: false,
                        livenessPassed: false,
                        message:
                          err.response?.data?.message ||
                          "Verification failed.",
                      });
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Verify Identity
                </button>

                {/* Verification Result */}

                {verificationResult && (
                  <div
                    className={`mt-8 rounded-lg p-5 border ${
                      verificationResult.verified
                        ? "bg-green-100 border-green-500"
                        : "bg-red-100 border-red-500"
                    }`}
                  >
                    <h3 className="text-xl font-bold mb-4">
                      Verification Result
                    </h3>

                    <p className="mb-2">
                      <strong>Face Match:</strong>{" "}
                      {verificationResult.faceMatched
                        ? "✅ Yes"
                        : "❌ No"}
                    </p>

                    <p className="mb-2">
                      <strong>Liveness:</strong>{" "}
                      {verificationResult.livenessPassed
                        ? "✅ Passed"
                        : "❌ Failed"}
                    </p>

                    <p className="mb-2">
                      <strong>Status:</strong>{" "}
                      {verificationResult.verified
                        ? "✅ VERIFIED"
                        : "❌ NOT VERIFIED"}
                    </p>

                    <p className="mt-4 font-medium">
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



