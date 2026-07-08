// models/VideoVerification.js

const mongoose = require("mongoose");

const evidenceSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },

    capturedAt: {
      type: Date,
      default: Date.now,
    },

    remark: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const videoVerificationSchema = new mongoose.Schema(
  {
    // Pensioner
    pensioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pensioner",
      required: true,
    },

    // Renewal Period
    renewal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Renewal",
      required: true,
    },

    // Officer
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FaceUser",
      required: true,
    },

    officerName: {
      type: String,
      required: true,
      trim: true,
    },

    
