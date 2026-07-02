const Pensioner = require("../models/Pensioner");
const compareFaces = require("../services/faceRecognition");
const checkLiveness = require("../services/livenessDetection");

/**
 * POST /api/verification
 * Upload selfie and verify pensioner
 */
const verifyPensioner = async (req, res) => {
    try {

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Verification selfie is required."
            });
        }

        const { pensionerId, faydaNumber } = req.body;

        if (!pensionerId && !faydaNumber) {
            return res.status(400).json({
                success: false,
                message: "Pensioner ID or Fayda Number is required."
            });
        }

        const pensioner = await Pensioner.findOne({
            $or: [
                { pensionerId },
                { faydaNumber }
            ]
        });

        if (!pensioner) {
            return res.status(404).json({
                success: false,
                message: "Pensioner not found."
            });
        }

        pensioner.verificationAttempts += 1;

        const registeredImage = pensioner.image;
        const selfieImage = `/uploads/verification/${req.file.filename}`;

        pensioner.lastVerificationImage = selfieImage;

        // Compare faces
       const faceResult = await Promise.race([
    compareFaces(registeredImage, selfieImage),
    new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Face comparison timeout")), 30000)
    ),
]);

        if (!faceResult.match) {

            pensioner.faceMatched = false;
            pensioner.livenessPassed = false;
            pensioner.verified = false;

            await pensioner.save();

            return res.status(400).json({
                success: false,
                message: "Face does not match.",
                similarity: faceResult.similarity
            });

        }

        pensioner.faceMatched = true;

        // Check liveness
        const liveResult = await Promise.race([
    checkLiveness(selfieImage),
    new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Liveness timeout")), 30000)
    ),
]);

        if (!liveResult.live) {

            pensioner.livenessPassed = false;
            pensioner.verified = false;

            await pensioner.save();

            return res.status(400).json({
                success: false,
                message: "Liveness check failed."
            });

        }

        pensioner.livenessPassed = true;
        pensioner.verified = true;
        pensioner.verifiedAt = new Date();

        await pensioner.save();

        return res.status(200).json({

            success: true,

            message: "Pensioner verified successfully.",

            similarity: faceResult.similarity,

            data: pensioner

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

/**
 * GET /api/verification/history
 */
const verificationHistory = async (req, res) => {

    try {

        const history = await Pensioner.find({
            verified: true
        }).sort({
            verifiedAt: -1
        });

        res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {

    verifyPensioner,

    verificationHistory

};