// models/Pensioner.js

const mongoose = require("mongoose");

const PensionerSchema = new mongoose.Schema(
  {
    pensionerId: {
      type: String,
      required: true,
      unique: true,
    },

    nameAmh: {
      type: String,
      required: true,
    },

    nameEng: {
      type: String,
      required: true,
    },

    tin: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: true,
    },

    faydaNumber: {
      type: String,
      required: true,
      unique: true,
    },

    poessaBranch: {
      type: String,
      required: true,
    },

    bankNameAmh: {
      type: String,
      required: true,
    },

    bankNameEng: {
      type: String,
      required: true,
    },

    bankBranch: {
      type: String,
      required: true,
    },

    pensionAmount: {
      type: Number,
      required: true,
    },

    addressAmh: {
      type: String,
      required: true,
    },

    addressEng: {
      type: String,
      required: true,
    },

    issueDate: {
      type: Date,
      required: true,
    },

    expiryDate: {
      type: Date,
      required: true,
    },

    // Registration photo
    image: {
      type: String,
      required: true,
    },

    // Verification information
    verified: {
      type: Boolean,
      default: false,
    },

    verificationDate: {
      type: Date,
      default: null,
    },

    faceMatched: {
      type: Boolean,
      default: false,
    },

    livenessPassed: {
      type: Boolean,
      default: false,
    },

    verificationAttempts: {
      type: Number,
      default: 0,
    },

    lastSelfie: {
      type: String,
      default: "",
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Pensioner", PensionerSchema);