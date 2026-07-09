const mongoose = require("mongoose");

const callSessionSchema = new mongoose.Schema(
  {
    pensionerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pensioner",
      required: true,
    },
    officerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a User model for staff/officers
      required: true,
    },
    roomId: {
      type: String,
      required: true,
      index: true, // Speeds up lookups when a call starts
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["PENDING", "ONGOING", "COMPLETED", "FAILED", "MISSED"],
      default: "PENDING",
    },
    verificationResult: {
      livenessScore: Number,
      faceMatchConfidence: Number,
      notes: String,
    },
    recordingUrl: {
      type: String, // Link to S3 storage for video evidence
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("CallSession", callSessionSchema);
