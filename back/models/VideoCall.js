const mongoose = require("mongoose");

const videoCallSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },

    pensionerId: {
      type: String,
      required: true,
    },

    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FaceUser",
      default: null,
    },

    status: {
      type: String,
      enum: [
        "WAITING",
        "CONNECTED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "WAITING",
    },

    requestedAt: {
      type: Date,
      default: Date.now,
    },

    startedAt: Date,

    endedAt: Date,

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "VideoCall",
  videoCallSchema
);
