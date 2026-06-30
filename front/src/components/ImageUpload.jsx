
// src/components/ImageUpload.jsx

import React, { useRef, useState } from "react";

const ImageUpload = ({ onImageSelect }) => {
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Allow only images
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image.");
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();

    reader.onloadend = () => {
      setPreview(reader.result);

      if (onImageSelect) {
        onImageSelect(file, reader.result);
      }
    };

    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setPreview(null);
    setFileName("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    if (onImageSelect) {
      onImageSelect(null, null);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">

      {!preview && (
        <label className="block">

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />

          <div className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-500 hover:bg-gray-50">

            <div className="text-5xl mb-2">📁</div>

            <p className="font-semibold text-gray-700">
              Click to Upload Image
            </p>

            <p className="text-sm text-gray-500 mt-1">
              JPG, JPEG or PNG
            </p>

          </div>

        </label>
      )}

      {preview && (
        <div className="space-y-3">

          <img
            src={preview}
            alt="Preview"
            className="w-full h-72 object-cover rounded-lg border shadow"
          />

          <p className="text-sm text-center text-gray-600">
            {fileName}
          </p>

          <button
            type="button"
            onClick={removeImage}
            className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
          >
            Remove Image
          </button>

        </div>
      )}
    </div>
  );
};

export default ImageUpload;

