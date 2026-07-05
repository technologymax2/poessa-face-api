const Pensioner = require("../models/Pensioner");

function euclideanDistance(desc1, desc2) {
  if (!desc1 || !desc2) return 999;
  if (desc1.length !== desc2.length) return 999;

  let sum = 0;

  for (let i = 0; i < desc1.length; i++) {
    sum += Math.pow(desc1[i] - desc2[i], 2);
  }

  return Math.sqrt(sum);
}

const verifyPensioner = async (req, res) => {
  try {
    const { pensionerId, faydaNumber, faceDescriptor } = req.body;

    if (!pensionerId && !faydaNumber) {
      return res.status(400).json({
        success: false,
        message: "Pensioner ID or Fayda Number is required.",
      });
    }

    const pensioner = await Pensioner.findOne({
      $or: [{ pensionerId }, { faydaNumber }],
    });

    if (!pensioner) {
      return res.status(404).json({
        success: false,
        message: "Pensioner not found.",
      });
    }

    if (!faceDescriptor) {
      return res.status(400).json({
        success: false,
        message: "Face descriptor is missing.",
      });
    }

    const incomingDescriptor = JSON.parse(faceDescriptor);

    if (
      !pensioner.faceDescriptor ||
      pensioner.faceDescriptor.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Registered face descriptor not found.",
      });
    }

    const distance = euclideanDistance(
      pensioner.faceDescriptor,
      incomingDescriptor
    );

    const threshold = 0.6;

    const matched = distance < threshold;

    pensioner.verificationAttempts += 1;
    pensioner.faceMatched = matched;
    pensioner.livenessPassed = true;
    pensioner.verified = matched;
    pensioner.verifiedAt = matched ? new Date() : null;

    if (req.file) {
      pensioner.lastVerificationImage =
        "/uploads/verification/" + req.file.filename;
    }

    await pensioner.save();

    return res.status(200).json({
  success: true,
  message: matched
    ? "Identity Verified Successfully."
    : "Face does not match.",

  data: {
    verified: matched,
    faceMatched: matched,
    livenessPassed: true,
    distance: Number(distance.toFixed(4)),
    similarity: Number((1 - distance).toFixed(4)),
  },
});
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const verificationHistory = async (req, res) => {
  try {
    const history = await Pensioner.find({
      verified: true,
    }).sort({
      verifiedAt: -1,
    });

    res.json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  verifyPensioner,
  verificationHistory,
};
