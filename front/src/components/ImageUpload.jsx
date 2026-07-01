import React, { useRef } from "react";

// ከፓረንት ገጹ ላይ 'preview' ቫልዩን በ props እንቀበላለን
const ImageUpload = ({ onImageSelect, preview }) => {
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // ምስል ብቻ መሆኑን ማረጋገጫ
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (onImageSelect) {
        // ፋይሉን እና የፕሪቪው ዳታውን ለፓረንት ገጽ እናስተላልፋለን
        onImageSelect(file, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onImageSelect) {
      // ሁሉንም ነገር ባዶ እናደርጋለን
      onImageSelect(null, null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* ምስል ካልተመረጠ ይህ ይታያል */}
      {!preview && (
        <label className="block">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
          <div className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-500 hover:bg-gray-50 transition">
            <div className="text-5xl mb-2">📁</div>
            <p className="font-semibold text-gray-700">Click to Upload Image</p>
            <p className="text-sm text-gray-500 mt-1">JPG, JPEG or PNG</p>
          </div>
        </label>
      )}

      {/* ምስል ሲመረጥ ይህ ይታያል */}
      {preview && (
        <div className="space-y-3">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-72 object-cover rounded-lg border shadow-sm"
          />
          <button
            type="button"
            onClick={removeImage}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium"
          >
            Remove Image
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;