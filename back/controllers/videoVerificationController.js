// controllers/videoVerificationController.js

const { v4: uuidv4 } = require("uuid");

const Pensioner = require("../models/Pensioner");
const Renewal = require("../models/Renewal");
const VideoVerification = require("../models/VideoVerification");

// ===============================================
// Search Pensioner
// POST /api/video/search
// ===============================================

exports.searchPensioner = async (req, res) => {
  try {
    const { pensionerId, faydaNumber } = req.body;

    if (!pensionerId && !faydaNumber) {
      return res.status(400).json({
        success: false,
        message: "Pensioner ID or Fayda Number is required.",
      });
    }

    const pensioner = await Pensioner.findOne({
      $or: [
        { pensionerId },
        { faydaNumber }
      ],
    });

    if (!pensioner) {
      return res.status(404).json({
        success: false,
        message: "Pensioner not found.",
      });
    }

    return res.json({
      success: true,
      data: pensioner,
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ===============================================
// Start Video Verification
// POST /api/video/start
// ===============================================

exports.startVideoVerification = async (req, res) => {
  try {

    const { pensionerId } = req.body;

    if (!pensionerId) {
      return res.status(400).json({
        success: false,
        message: "Pensioner ID is required.",
      });
    }

    const pensioner = await Pensioner.findById(pensionerId);

    if (!pensioner) {
      return res.status(404).json({
        success: false,
        message: "Pensioner not found.",
      });
    }

    // Current Renewal
    const renewal = await Renewal.findOne({
      active: true,
    });

    if (!renewal) {
      return res.status(400).json({
        success: false,
        message: "No active renewal period.",
      });
    }

    // Already renewed
    if (
      pensioner.lastRenewalId &&
      pensioner.lastRenewalId.toString() ===
        renewal._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This pensioner has already completed renewal.",
      });
    }

    // Generate Room ID
    const roomId = uuidv4();

    const verification =
      await VideoVerification.create({

        pensioner: pensioner._id,

        renewal: renewal._id,

        officer: req.user.id,

        officerName:
          req.user.firstName +
          " " +
          req.user.lastName,

        roomId,

        callStatus: "WAITING",

        startedAt: new Date(),

      });

    return res.status(201).json({

      success: true,

      message: "Video session created.",

      data: verification,

    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
// =========================================
// Start Video Call
// =========================================
exports.startCall = async (req, res) => {
  try {

    const { sessionId } = req.params;

    const session = await VideoVerification.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found."
      });
    }

    session.callStartedAt = new Date();
    session.status = "IN_PROGRESS";

    await session.save();

    res.json({
      success: true,
      message: "Video call started.",
      data: session
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }
};

// =========================================
// Capture Evidence
// =========================================
exports.captureEvidence = async (req, res) => {

  try {

    const { sessionId } = req.params;

    const session = await VideoVerification.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found."
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Evidence image is required."
      });
    }

    session.evidenceImages.push(
      "/uploads/evidence/" + req.file.filename
    );

    await session.save();

    res.json({
      success: true,
      message: "Evidence captured successfully.",
      data: session
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};

// =========================================
// End Video Call
// =========================================
exports.endCall = async (req, res) => {

  try {

    const { sessionId } = req.params;
    const { remarks } = req.body;

    const session = await VideoVerification
      .findById(sessionId)
      .populate("pensioner");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found."
      });
    }

    session.callEndedAt = new Date();

    session.duration =
      Math.floor(
        (session.callEndedAt - session.callStartedAt) / 1000
      );

    session.remarks = remarks;

    session.status = "COMPLETED";

    await session.save();

    session.pensioner.verified = true;
    session.pensioner.verifiedAt = new Date();

    await session.pensioner.save();

    res.json({
      success: true,
      message: "Video verification completed successfully.",
      data: session
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message
    });

  }

};
// ==========================================
// End Video Verification
// ==========================================
exports.endVideoVerification = async (req, res) => {
  try {
    const { sessionId, remarks } = req.body;

    const session = await VideoVerification.findById(sessionId)
      .populate("pensioner");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Video session not found.",
      });
    }

    if (session.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Session already completed.",
      });
    }

    session.endTime = new Date();

    session.duration = Math.floor(
      (session.endTime - session.startTime) / 1000
    );

    session.status = "COMPLETED";
    session.remarks = remarks || "";

    // Officer confirms pensioner is alive
    session.isAliveConfirmed = true;

    // Update pensioner record
    const pensioner = session.pensioner;

    pensioner.verified = true;
    pensioner.faceMatched = true;
    pensioner.livenessPassed = true;
    pensioner.verifiedAt = new Date();

    await pensioner.save();
    await session.save();

    res.json({
      success: true,
      message: "Video verification completed successfully.",
      data: session,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ==========================================
// Capture Evidence
// ==========================================
exports.captureEvidence = async (req, res) => {
  try {

    const { sessionId } = req.body;

    const session = await VideoVerification.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Evidence image required.",
      });
    }

    session.evidenceImages.push(
      "/uploads/videoEvidence/" + req.file.filename
    );

    await session.save();

    res.json({
      success: true,
      message: "Evidence captured successfully.",
      images: session.evidenceImages,
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


// ==========================================
// Get Session Details
// ==========================================
exports.getSession = async (req, res) => {
  try {

    const session = await VideoVerification.findById(
      req.params.id
    )
      .populate("pensioner")
      .populate("officer");

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found.",
      });
    }

    res.json({
      success: true,
      data: session,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
