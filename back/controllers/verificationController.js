const Pensioner = require("../models/Pensioner");
const checkLiveness = require("../services/livenessDetection");

/**
 * POST /api/verification
 * Frontend በ face-api.js ያረጋገጠውን ውጤት በመቀበል ማረጋገጫ መስጠት
 */
const verifyPensioner = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Verification selfie is required."
            });
        }

        // Frontend የላከው verified (boolean) እና similarity (number)
        const { pensionerId, faydaNumber, verified, similarity } = req.body;

        if (!pensionerId && !faydaNumber) {
            return res.status(400).json({
                success: false,
                message: "Pensioner ID or Fayda Number is required."
            });
        }

        const pensioner = await Pensioner.findOne({
            $or: [{ pensionerId }, { faydaNumber }]
        });

        if (!pensioner) {
            return res.status(404).json({
                success: false,
                message: "Pensioner not found."
            });
        }

        // የፊት ንፅፅር ውጤት ከ Frontend የመጣ
        if (!verified || verified === 'false') {
            pensioner.verificationAttempts += 1;
            pensioner.faceMatched = false;
            pensioner.verified = false;
            await pensioner.save();
            return res.status(400).json({
                success: false,
                message: "Face verification failed on client side.",
                similarity: similarity || 0
            });
        }

        // Liveness Detection (ይህንን Backend ላይ ማስቀጠል ትችላለህ)
        const selfieImage = `/uploads/verification/${req.file.filename}`;
        const liveResult = await Promise.race([
            checkLiveness(selfieImage),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Liveness timeout")), 30000))
        ]);

        if (!liveResult.live) {
            pensioner.verificationAttempts += 1;
            pensioner.livenessPassed = false;
            pensioner.verified = false;
            await pensioner.save();
            return res.status(400).json({
                success: false,
                message: "Liveness check failed."
            });
        }

        // ሁሉም ነገር ከተሳካ
        pensioner.verificationAttempts += 1;
        pensioner.faceMatched = true;
        pensioner.livenessPassed = true;
        pensioner.verified = true;
        pensioner.verifiedAt = new Date();
        pensioner.lastVerificationImage = selfieImage;

        await pensioner.save();

        return res.status(200).json({
            success: true,
            message: "Pensioner verified successfully.",
            similarity: similarity,
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
        const history = await Pensioner.find({ verified: true }).sort({ verifiedAt: -1 });
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
