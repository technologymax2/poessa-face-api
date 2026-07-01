import React, { useState } from "react";
import Navbar from "../components/Navbar";
import WebcamCapture from "../components/WebcamCapture";
import ImageUpload from "../components/ImageUpload";
import Loader from "../components/Loader";
import { registerPensioner } from "../services/api"; // የአዲሱ ሰርቪስ ጥሪ

const initialFormState = {
  pensionerId: "", nameAmh: "", nameEng: "", tin: "", phone: "",
  age: "", gender: "", faydaNumber: "", poessaBranch: "",
  bankNameAmh: "", bankNameEng: "", bankBranch: "", pensionAmount: "",
  addressAmh: "", addressEng: "", issueDate: "", expiryDate: ""
};

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageMethod, setImageMethod] = useState("camera");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCapture = (image) => { setCapturedImage(image); setPreview(image); setImageFile(null); };
  const handleUpload = (file, imgPreview) => { setImageFile(file); setPreview(imgPreview); setCapturedImage(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!capturedImage && !imageFile) {
      alert("Please capture or upload a photo.");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      if (imageFile) data.append("image", imageFile);
      if (capturedImage) data.append("capturedImage", capturedImage);

      // አዲሱን የሰርቪስ ጥሪ መጠቀም
      await registerPensioner(data);

      alert("Pensioner registered successfully.");
      setFormData(initialFormState);
      setImageFile(null); setCapturedImage(null); setPreview(null);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      {loading && <Loader fullScreen size="lg" text="Registering Pensioner..." />}
      {/* ፎርሙ ከቀድሞው ጋር ተመሳሳይ ነው... */}
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">Pensioner Registration</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 font-semibold">Pensioner ID</label>
              <input type="text" name="pensionerId" value={formData.pensionerId} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Fayda Number</label>
              <input type="text" name="faydaNumber" value={formData.faydaNumber} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Name (English)</label>
              <input type="text" name="nameEng" value={formData.nameEng} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Name (Amharic)</label>
              <input type="text" name="nameAmh" value={formData.nameAmh} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Phone Number</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full border rounded-lg p-3">
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 font-semibold">POESSA Branch</label>
              <input type="text" name="poessaBranch" value={formData.poessaBranch} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Bank Name (English)</label>
              <input type="text" name="bankNameEng" value={formData.bankNameEng} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Bank Branch</label>
              <input type="text" name="bankBranch" value={formData.bankBranch} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Pension Amount</label>
              <input type="number" name="pensionAmount" value={formData.pensionAmount} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Address (English)</label>
              <textarea rows="2" name="addressEng" value={formData.addressEng} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Issue Date</label>
              <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>
            <div>
              <label className="block mb-2 font-semibold">Expiry Date</label>
              <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>

            <div className="md:col-span-2 border-t pt-4 mt-2">
              <label className="block mb-3 font-semibold text-lg">Registration Photo</label>
              <div className="flex gap-4 mb-5">
                <button type="button" onClick={() => setImageMethod("camera")} className={`px-5 py-2 rounded-lg font-medium transition ${imageMethod === "camera" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>📷 Camera</button>
                <button type="button" onClick={() => setImageMethod("upload")} className={`px-5 py-2 rounded-lg font-medium transition ${imageMethod === "upload" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>📁 Upload</button>
              </div>
              {imageMethod === "camera" ? <WebcamCapture onCapture={handleCapture} /> : <ImageUpload onImageSelect={handleUpload} />}
            </div>

            {preview && (
              <div className="md:col-span-2">
                <img src={preview} alt="Preview" className="w-64 h-64 object-cover rounded-lg border shadow-md" />
              </div>
            )}

            <div className="md:col-span-2 mt-4">
              <button type="submit" disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 rounded-lg text-lg font-semibold transition disabled:bg-gray-400">
                Register Pensioner
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;