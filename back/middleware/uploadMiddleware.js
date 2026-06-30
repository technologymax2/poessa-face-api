const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create upload directories if they don't exist
const registrationDir = path.join(__dirname, "../uploads/registration");
const verificationDir = path.join(__dirname, "../uploads/verification");

[registrationDir, verificationDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Allowed image types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpg|jpeg|png|webp/;

  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  const mimetype = allowedTypes.test(file.mimetype.split("/")[1]);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, JPEG, PNG and WEBP images are allowed."));
  }
};

// Registration image storage
const registrationStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, registrationDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      "REG_" +
      Date.now() +
      "_" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// Verification selfie storage
const verificationStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, verificationDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      "VERIFY_" +
      Date.now() +
      "_" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// Upload limits
const limits = {
  fileSize: 5 * 1024 * 1024, // 5 MB
};

// Registration upload
const uploadRegistration = multer({
  storage: registrationStorage,
  fileFilter,
  limits,
});

// Verification upload
const uploadVerification = multer({
  storage: verificationStorage,
  fileFilter,
  limits,
});

module.exports = {
  uploadRegistration,
  uploadVerification,
};