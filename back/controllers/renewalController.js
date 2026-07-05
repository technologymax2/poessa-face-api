const Renewal = require("../models/Renewal");

// ==============================
// Create Renewal
// POST /api/renewals
// ==============================
exports.createRenewal = async (req, res) => {
  try {
    const { title, message, startDate, endDate } = req.body;

    if (!title || !message || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: "End date must be later than start date.",
      });
    }

    // Close previous active renewals
    await Renewal.updateMany(
      { active: true },
      { $set: { active: false } }
    );

    const renewal = await Renewal.create({
      title,
      message,
      startDate,
      endDate,
      active: true,
    });

    res.status(201).json({
      success: true,
      message: "Renewal created successfully.",
      data: renewal,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};

// ==============================
// Get Current Renewal
// GET /api/renewals/current
// ==============================
exports.getCurrentRenewal = async (req, res) => {
  try {
    const renewal = await Renewal.findOne({ active: true });

    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: "No active renewal found.",
      });
    }

    const now = new Date();

    let status = "ACTIVE";

    if (now < renewal.startDate) {
      status = "NOT_STARTED";
    } else if (now > renewal.endDate) {
      status = "EXPIRED";
    }

    res.json({
      success: true,
      status,
      data: renewal,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
};
