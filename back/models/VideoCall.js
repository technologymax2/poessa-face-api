const mongoose = require("mongoose");

const videoCallSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
    },
    // Renamed from "pensionerId" (String) to "pensioner" (ObjectId ref) to
    // match what the controller actually reads/writes and to make
    // .populate("pensioner") work.
    pensioner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pensioner",
      required: true,
    },
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FaceUser",
      default: null,
    },
    status: {
      type: String,
      enum: ["WAITING", "CONNECTED", "COMPLETED", "CANCELLED"],
      default: "WAITING",
    },
    // Was being set in the controller (approveRenewal) but was missing
    // from the schema, so it was silently dropped on save.
    renewalApproved: {
      type: Boolean,
      default: false,
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

module.exports = mongoose.model("VideoCall", videoCallSchema);
