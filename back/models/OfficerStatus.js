const mongoose = require("mongoose");

const officerStatusSchema = new mongoose.Schema(
  {
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FaceUser",
      unique: true,
      required: true,
    },

    online: {
      type: Boolean,
      default: false,
    },

    busy: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "OfficerStatus",
  officerStatusSchema
);
