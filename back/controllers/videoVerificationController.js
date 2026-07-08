const Pensioner = require("../models/Pensioner");
const VideoCall = require("../models/VideoCall");
const CallEvidence = require("../models/CallEvidence");

exports.searchPensioner = async (req, res) => {
  try {
    const query = req.query.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const pensioner = await Pensioner.findOne({
      $or: [
        { faydaNumber: query },
        { pensionerId: query }
      ],
    });

    if (!pensioner) {
      return res.status(404).json({
        success: false,
        message: "Pensioner not found",
      });
    }

    res.json({
      success: true,
      data: pensioner,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.createCallSession = async (req, res) => {
  try {

    const { pensionerId } = req.body;

    const roomId = "ROOM-" + Date.now();

    const call = await VideoCall.create({
      roomId,
      pensioner: pensionerId,
      status: "WAITING",
    });

    res.json({
      success: true,
      roomId,
      call,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.joinCall = async (req, res) => {

  const call = await VideoCall.findByIdAndUpdate(
    req.params.id,
    {
      status: "CONNECTED",
      startedAt: new Date(),
      officer: req.user.id,
    },
    {
      new: true,
    }
  );

  res.json({
    success: true,
    data: call,
  });
};

exports.endCall = async (req, res) => {

  const call = await VideoCall.findByIdAndUpdate(
    req.params.id,
    {
      status: "COMPLETED",
      endedAt: new Date(),
    },
    {
      new: true,
    }
  );

  res.json({
    success: true,
    data: call,
  });
};

exports.captureEvidence = async (req, res) => {

  const evidence = await CallEvidence.create({

    call: req.params.id,

    image: req.file.path,

    capturedBy: req.user.id,

  });

  res.json({
    success: true,
    data: evidence,
  });

};

exports.completeVerification = async (req, res) => {

  const { notes } = req.body;

  const call = await VideoCall.findByIdAndUpdate(
    req.params.id,
    {
      renewalApproved: true,
      notes,
      status: "COMPLETED",
      endedAt: new Date(),
    },
    {
      new: true,
    }
  );

  res.json({
    success: true,
    data: call,
  });

};

exports.getPendingCalls = async (req, res) => {

  const calls = await VideoCall.find({
    status: "WAITING",
  }).populate("pensioner");

  res.json({
    success: true,
    data: calls,
  });

};

exports.getCallHistory = async (req, res) => {

  const calls = await VideoCall.find()
    .populate("pensioner")
    .populate("officer")
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: calls,
  });

};

exports.getCallDetails = async (req, res) => {

  const call = await VideoCall.findById(req.params.id)
    .populate("pensioner")
    .populate("officer");

  const evidence = await CallEvidence.find({
    call: req.params.id,
  });

  res.json({
    success: true,
    call,
    evidence,
  });

};
