// models/Pensioner.js

const mongoose = require("mongoose");

const pensionerSchema = new mongoose.Schema(
  {
    pensionerId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    nameAmh: {
      type: String,
      required: true,
      trim: true,
    },

    nameEng: {
      type: String,
      required: true,
      trim: true,
    },

    tin: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
      min: 18,
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
      trim: true,
    },

    poessaBranch: {
      type: String,
      required: true,
      trim: true,
    },

    bankNameAmh: {
      type: String,
      default: "",
      trim: true,
    },

    bankNameEng: {
      type: String,
      default: "",
      trim: true,
    },

    bankBranch: {
      type: String,
      default: "",
      trim: true,
    },

    pensionAmount: {
      type: Number,
      default: 0,
    },

    addressAmh: {
      type: String,
      default: "",
      trim: true,
    },

    addressEng: {
      type: String,
      default: "",
      trim: true,
    },

    issueDate: {
      type: Date,
    },

    expiryDate: {
      type: Date,
    },

    image: {
      type: String,
      required: true,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    faceMatched: {
      type: Boolean,
      default: false,
    },

    livenessPassed: {
      type: Boolean,
      default: false,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },
lastRenewalId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Renewal",
  default: null,
},

    
    lastVerificationImage: {
      type: String,
      default: "",
    },

    verificationAttempts: {
      type: Number,
      default: 0,
    },


faceDescriptor: {
  type: [Number],
  default: [],
},

    
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Pensioner", pensionerSchema);
