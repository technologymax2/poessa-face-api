import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import WebcamCapture from "../components/WebcamCapture";
import ImageUpload from "../components/ImageUpload";
import { getPensioner, updatePensioner } from "../services/api";

const API_URL = process.env.REACT_APP_API_URL.replace("/api", "");

const EditPensioner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [faceDescriptor, setFaceDescriptor] = useState(null);
  const [imageMethod, setImageMethod] = useState("camera"); // ለምርጫ

  const [formData, setFormData] = useState({
    pensionerId: "", nameAmh: "", nameEng: "", tin: "", phone: "",
    age: "", gender: "", faydaNumber: "", poessaBranch: "",
    bankNameAmh: "", bankNameEng: "", bankBranch: "", pensionAmount: "",
    addressAmh: "", addressEng: "", issueDate: "", expiryDate: "",
  });

  useEffect(() => { loadPensioner(); }, []);

  const loadPensioner = async () => {
    try {
      setLoading(true);
      const res = await getPensioner(id);
      const p = res.data.data;
      setFormData({
        pensionerId: p.pensionerId || "", nameAmh: p.nameAmh || "", nameEng: p.nameEng || "",
        tin: p.tin || "", phone: p.phone || "", age: p.age || "", gender: p.gender || "",
        faydaNumber: p.faydaNumber || "", poessaBranch: p.poessaBranch || "",
        bankNameAmh: p.bankNameAmh || "", bankNameEng: p.bankNameEng || "",
        bankBranch: p.bankBranch || "", pensionAmount: p.pensionAmount || "",
        addressAmh: p.addressAmh || "", addressEng: p.addressEng || "",
        issueDate: p.issueDate?.substring(0, 10) || "", expiryDate: p.expiryDate?.substring(0, 10) || "",
      });
      setPreview(`${API_URL}${p.image}`);
    } catch (err) {
      console.error(err);
      alert("Unable to load pensioner.");
      navigate("/dashboard");
    } finally { setLoading(false); }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ካሜራ ሲጠቀም
  const handleCapture = (file, imagePreview, descriptor) => {
    setImageFile(file);
    setPreview(imagePreview);
    setFaceDescriptor(descriptor);
  };

  // Upload ሲጠቀም
  const handleUpload = (file, imgPreview, descriptor) => {
  console.log(file);
  console.log(imgPreview);
  console.log(descriptor);

  setImageFile(file);
  setPreview(imgPreview);
  setFaceDescriptor(descriptor);
};

  const handleMethodChange = (method) => {
    setImageMethod(method);
    setImageFile(null);
    setFaceDescriptor(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));
      if (imageFile) data.append("image", imageFile);
      if (faceDescriptor) data.append("faceDescriptor", JSON.stringify(Array.from(faceDescriptor)));

      await updatePensioner(id, data);
      alert("Pensioner updated successfully.");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Update failed.");
    } finally { setLoading(false); }
  };

  return (
    <>
      <Navbar />
      {loading && <Loader fullScreen size="lg" text="Updating..." />}
      
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-blue-700 mb-8">Edit Pensioner</h2>
          
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
            <Input label="Pensioner ID" name="pensionerId" value={formData.pensionerId} onChange={handleChange} />
            <Input label="Fayda Number" name="faydaNumber" value={formData.faydaNumber} onChange={handleChange} />
            <Input label="English Name" name="nameEng" value={formData.nameEng} onChange={handleChange} />
            <Input label="Amharic Name" name="nameAmh" value={formData.nameAmh} onChange={handleChange} />
            <Input label="TIN" name="tin" value={formData.tin} onChange={handleChange} />
            <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
            <Input label="Age" type="number" name="age" value={formData.age} onChange={handleChange} />
            <div>
              <label className="font-semibold">Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border rounded-lg p-3">
                <option>Male</option><option>Female</option>
              </select>
            </div>
            <Input label="POESSA Branch" name="poessaBranch" value={formData.poessaBranch} onChange={handleChange} />
            <Input label="Bank Name" name="bankNameEng" value={formData.bankNameEng} onChange={handleChange} />
            <Input label="Bank Branch" name="bankBranch" value={formData.bankBranch} onChange={handleChange} />
            <Input label="Pension Amount" type="number" name="pensionAmount" value={formData.pensionAmount} onChange={handleChange} />
            <div>
              <label className="font-semibold">Address (English)</label>
              <textarea rows="3" name="addressEng" value={formData.addressEng} onChange={handleChange} className="w-full border rounded-lg p-3" />
            </div>
            <div>
              <label className="font-semibold">Address (Amharic)</label>
              <textarea rows="3" name="addressAmh" value={formData.addressAmh} onChange={handleChange} className="w-full border rounded-lg p-3" />
            </div>
            <Input label="Issue Date" type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} />
            <Input label="Expiry Date" type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} />

            {/* Photo Update Section */}
            <div className="md:col-span-2 border-t pt-4">
              <label className="block mb-3 font-semibold text-lg">Update Photo</label>
              <div className="flex gap-4 mb-5">
                <button type="button" onClick={() => handleMethodChange("camera")} className={`px-5 py-2 rounded-lg font-medium ${imageMethod === "camera" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>📷 Camera</button>
                <button type="button" onClick={() => handleMethodChange("upload")} className={`px-5 py-2 rounded-lg font-medium ${imageMethod === "upload" ? "bg-blue-600 text-white" : "bg-gray-200"}`}>📁 Upload</button>
              </div>

              {imageMethod === "camera" ? (
                <WebcamCapture onCapture={handleCapture} preview={preview} />
              ) : (
                <ImageUpload
  onResult={handleUpload}
/>
              )}
              {preview && !imageFile && <img src={preview} alt="Current" className="mt-4 w-60 rounded-lg border" />}
            </div>

            <div className="md:col-span-2 flex gap-4">
              <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-lg">Update Pensioner</button>
              <button type="button" onClick={() => navigate("/dashboard")} className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

const Input = ({ label, type = "text", name, value, onChange }) => (
  <div>
    <label className="font-semibold">{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} className="w-full border rounded-lg p-3" />
  </div>
);

export default EditPensioner;
