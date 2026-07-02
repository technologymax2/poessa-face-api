import React, { useState } from "react";
import Navbar from "../components/Navbar";
import WebcamCapture from "../components/WebcamCapture";
import ImageUpload from "../components/ImageUpload";
import Loader from "../components/Loader";
import { registerPensioner } from "../services/api";

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
  const [preview, setPreview] = useState(null);
  const [imageMethod, setImageMethod] = useState("camera");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCapture = (file, imagePreview) => {
    setImageFile(file);
    setPreview(imagePreview);
  };

  const handleUpload = (file, imgPreview) => {
    setImageFile(file);
    setPreview(imgPreview);
  };

  const handleMethodChange = (method) => {
    setImageMethod(method);
    setImageFile(null);
    setPreview(null); // Clear image state when switching methods to avoid overlap bugs
  };
  
  const onlyLetters = (value) => /^[A-Za-z\s]+$/.test(value);
  const onlyAmharic = (value) => /^[\u1200-\u137F\s]+$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(formData.pensionerId)) {
      alert("Pensioner ID must contain exactly 10 digits.");
      return;
    }
    if (!/^\d{10}$/.test(formData.tin)) {
      alert("TIN must contain exactly 10 digits.");
      return;
    }
    if (!/^\d{16}$/.test(formData.faydaNumber)) {
      alert("Fayda Number must contain exactly 16 digits.");
      return;
    }
    if (!/^\d{10,15}$/.test(formData.phone)) {
      alert("Enter a valid phone number.");
      return;
    }
    if (!onlyLetters(formData.nameEng)) {
      alert("English Name must contain letters only.");
      return;
    }
    if (!onlyAmharic(formData.nameAmh)) {
      alert("Amharic Name must contain Amharic letters only.");
      return;
    }
    if (Number(formData.age) < 18 || Number(formData.age) > 120) {
      alert("Age must be between 18 and 120.");
      return;
    }
    if (Number(formData.pensionAmount) <= 0) {
      alert("Invalid pension amount.");
      return;
    }
    if (new Date(formData.issueDate) >= new Date(formData.expiryDate)) {
      alert("Expiry Date must be later than Issue Date.");
      return;
    }
    if (!imageFile) {
      alert("Please capture or upload a registration photo.");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      data.append("image", imageFile);

      await registerPensioner(data);

      alert("Pensioner registered successfully.");
      setFormData(initialFormState);
      setImageFile(null);
      setPreview(null);
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
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-xl p-6">
          <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">Pensioner Registration</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pensioner ID */}
            <div>
              <label className="block mb-2 font-semibold">Pensioner ID</label>
              <input
                type="text"
                name="pensionerId"
                value={formData.pensionerId}
                maxLength={10}
                onChange={(e) => setFormData({ ...formData, pensionerId: e.target.value.replace(/\D/g, "") })}
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* TIN Input */}
            <div>
              <label className="block mb-2 font-semibold">TIN (Tax Identification Number)</label>
              <input
                type="text"
                name="tin"
                value={formData.tin}
                maxLength={10}
                onChange={(e) => setFormData({ ...formData, tin: e.target.value.replace(/\D/g, "") })}
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* Fayda Number */}
            <div>
              <label className="block mb-2 font-semibold">Fayda Number</label>
              <input
                type="text"
                name="faydaNumber"
                value={formData.faydaNumber}
                maxLength={16}
                onChange={(e) => setFormData({ ...formData, faydaNumber: e.target.value.replace(/\D/g, "") })}
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* Name English */}
            <div>
              <label className="block mb-2 font-semibold">Name (English)</label>
              <input
                type="text"
                name="nameEng"
                value={formData.nameEng}
                onChange={(e) => setFormData({ ...formData, nameEng: e.target.value.replace(/[^A-Za-z\s]/g, "") })}
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* Name Amharic */}
            <div>
              <label className="block mb-2 font-semibold">Name (Amharic)</label>
              <input
                type="text"
                name="nameAmh"
                value={formData.nameAmh}
                onChange={(e) => setFormData({ ...formData, nameAmh: e.target.value.replace(/[^\u1200-\u137F\s]/g, "") })}
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block mb-2 font-semibold">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                maxLength={15}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                required
                className="w-full border rounded-lg p-3"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block mb-2 font-semibold">Age</label>
              <input type="number" name="age" value={formData.age} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>

            {/* Gender */}
            <div>
              <label className="block mb-2 font-semibold">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required className="w-full border rounded-lg p-3">
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
              </select>
            </div>

            {/* POESSA Branch */}
            <div>
              <label className="block mb-2 font-semibold">POESSA Branch</label>
              <input type="text" name="poessaBranch" value={formData.poessaBranch} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>

            {/* Bank Name English */}
            <div>
              <label className="block mb-2 font-semibold">Bank Name (English)</label>
              <input type="text" name="bankNameEng" value={formData.bankNameEng} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>

            {/* Bank Branch */}
            <div>
              <label className="block mb-2 font-semibold">Bank Branch</label>
              <input type="text" name="bankBranch" value={formData.bankBranch} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>

            {/* Pension Amount */}
            <div>
              <label className="block mb-2 font-semibold">Pension Amount</label>
              <input type="number" name="pensionAmount" value={formData.pensionAmount} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>

            {/* Address English */}
            <div>
              <label className="block mb-2 font-semibold">Address (English)</label>
              <textarea rows="2" name="addressEng" value={formData.addressEng} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>

            {/* Issue Date */}
            <div>
              <label className="block mb-2 font-semibold">Issue Date</label>
              <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>

            {/* Expiry Date */}
            <div>
              <label className="block mb-2 font-semibold">Expiry Date</label>
              <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} required className="w-full border rounded-lg p-3" />
            </div>

            {/* Camera / Upload Section */}
            <div className="md:col-span-2 border-t pt-4 mt-2">
              <label className="block mb-3 font-semibold text-lg">Registration Photo</label>
              <div className="flex gap-4 mb-5">
                <button type="button" onClick={() => handleMethodChange("camera")} className={`px-5 py-2 rounded-lg font-medium transition ${imageMethod === "camera" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>📷 Camera</button>
                <button type="button" onClick={() => handleMethodChange("upload")} className={`px-5 py-2 rounded-lg font-medium transition ${imageMethod === "upload" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>📁 Upload</button>
              </div>
              
              {imageMethod === "camera" ? (
                <WebcamCapture onCapture={handleCapture} preview={preview} />
              ) : (
                <div className="space-y-4">
                  <ImageUpload onImageSelect={handleUpload} />
                  {preview && (
                    <img src={preview} alt="Upload Preview" className="w-64 h-64 object-cover rounded-lg border shadow-md" />
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
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
