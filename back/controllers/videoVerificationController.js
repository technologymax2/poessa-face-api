const { v4: uuidv4 } = require("uuid");
const Pensioner = require("../models/Pensioner");
const Renewal = require("../models/Renewal");
const VideoVerification = require("../models/VideoVerification");

// 1. Search Pensioner
exports.searchPensioner = async (req, res) => {
  try {
    const { query } = req.query; // ራውቱ ላይ እንደተገለጸው
    const pensioner = await Pensioner.findOne({
      $or: [{ pensionerId: query }, { faydaNumber: query }],
    });
    if (!pensioner) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: pensioner });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// 2. Create Call Session
exports.createCallSession = async (req, res) => {
  try {
    const { pensionerId } = req.body;
    const roomId = uuidv4();
    const verification = await VideoVerification.create({
      pensioner: pensionerId,
      officer: req.user.id,
      roomId,
      callStatus: "WAITING",
      startedAt: new Date(),
    });
    res.status(201).json({ success: true, data: verification });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// 3. Join Call
exports.joinCall = async (req, res) => {
  try {
    const session = await VideoVerification.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    session.callStatus = "IN_PROGRESS";
    await session.save();
    res.json({ success: true, data: session });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// 4. End Call
exports.endCall = async (req, res) => {
  try {
    const session = await VideoVerification.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: "Session not found" });
    session.callStatus = "COMPLETED";
    session.endedAt = new Date();
    await session.save();
    res.json({ success: true, message: "Call ended" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// 5. Capture Evidence
exports.captureEvidence = async (req, res) => {
  try {
    const session = await VideoVerification.findById(req.params.id);
    if (!session || !req.file) return res.status(400).json({ success: false, message: "Invalid request" });
    session.evidenceImages.push("/uploads/evidence/" + req.file.filename);
    await session.save();
    res.json({ success: true, data: session });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// 6. Complete Verification
exports.completeVerification = async (req, res) => {
  try {
    const session = await VideoVerification.findById(req.params.id);
    session.callStatus = "VERIFIED";
    await session.save();
    res.json({ success: true, message: "Verification complete" });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// 7. Get Pending Calls
exports.getPendingCalls = async (req, res) => {
  const pending = await VideoVerification.find({ callStatus: "WAITING" });
  res.json({ success: true, data: pending });
};

// 8. Get Call History
exports.getCallHistory = async (req, res) => {
  const history = await VideoVerification.find({ callStatus: "COMPLETED" });
  res.json({ success: true, data: history });
};

// 9. Get Call Details
exports.getCallDetails = async (req, res) => {
  const session = await VideoVerification.findById(req.params.id);
  res.json({ success: true, data: session });
};
