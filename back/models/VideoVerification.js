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
  {
    _id: false,
  }
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

    // Video Room
    roomId: {
      type: String,
      required: true,
      unique: true,
    },

    // Call Status
    callStatus: {
      type: String,
      enum: [
        "WAITING",
        "RINGING",
        "CONNECTED",
        "COMPLETED",
        "REJECTED",
        "CANCELLED",
      ],
      default: "WAITING",
    },

    // Start Time
    startedAt: {
      type: Date,
      default: Date.now,
    },

    // Connected Time
    connectedAt: {
      type: Date,
      default: null,
    },

    // End Time
    endedAt: {
      type: Date,
      default: null,
    },

    // Duration (seconds)
    duration: {
      type: Number,
      default: 0,
    },

    // Officer Notes
    notes: {
      type: String,
      default: "",
      trim: true,
    },

    // Alive Confirmation
    aliveConfirmed: {
      type: Boolean,
      default: false,
    },

    // Renewal Completed
    renewalCompleted: {
      type: Boolean,
      default: false,
    },

    // Evidence Photos
    evidences: [evidenceSchema],

    // Call Recording (optional)
    recording: {
      type: String,
      default: "",
    },

    // Network Quality
    networkQuality: {
      type: String,
      enum: ["Excellent", "Good", "Fair", "Poor"],
      default: "Good",
    },

    // Device Used
    device: {
      type: String,
      default: "",
    },

    // Browser Used
    browser: {
      type: String,
      default: "",
    },

    // IP Address
    ipAddress: {
      type: String,
      default: "",
    },

    // GPS Location (Optional)
    location: {
      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },

      address: {
        type: String,
        default: "",
      },
    },

    // Audit Status
    status: {
      type: String,
      enum: [
        "OPEN",
        "CLOSED",
      ],
      default: "OPEN",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "VideoVerification",
  videoVerificationSchema
);
