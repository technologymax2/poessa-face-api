const express = require("express");
const router = express.Router();

const Pensioner = require("../models/Pensioner");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, async (req, res) => {
  try {

    const total = await Pensioner.countDocuments();

    const verified = await Pensioner.countDocuments({
      verified: true,
    });

    const unverified = await Pensioner.countDocuments({
      verified: false,
    });

    res.json({
      success: true,
      total,
      verified,
      unverified,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }
});

module.exports = router;