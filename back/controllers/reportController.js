// controllers/reportController.js

const Pensioner = require("../models/Pensioner");
const Renewal = require("../models/Renewal");

// ==========================================
// Renewal Report
// GET /api/reports/renewal
// ==========================================
exports.getRenewalReport = async (req, res) => {
  try {
    const { renewalId, branch } = req.query;

    if (!renewalId) {
      return res.status(400).json({
        success: false,
        message: "Renewal ID is required.",
      });
    }

    const renewal = await Renewal.findById(renewalId);

    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: "Renewal period not found.",
      });
    }

    let filter = {};

    if (branch && branch.trim() !== "") {
      filter.poessaBranch = branch;
    }

    // ===========================
    // Renewed
    // ===========================

    const renewed = await Pensioner.find({
      ...filter,
      lastRenewalId: renewal._id,
    }).sort({
      nameEng: 1,
    });

    // ===========================
    // Not Renewed
    // ===========================

    const notRenewed = await Pensioner.find({
      ...filter,
      $or: [
        {
          lastRenewalId: {
            $ne: renewal._id,
          },
        },
        {
          lastRenewalId: null,
        },
      ],
    }).sort({
      nameEng: 1,
    });

    // ===========================
    // Summary
    // ===========================

    const total = renewed.length + notRenewed.length;

    const renewedPercent =
      total === 0
        ? 0
        : ((renewed.length / total) * 100).toFixed(2);

    const notRenewedPercent =
      total === 0
        ? 0
        : ((notRenewed.length / total) * 100).toFixed(2);

    res.status(200).json({
      success: true,

      renewal: {
        id: renewal._id,
        title: renewal.title,
        startDate: renewal.startDate,
        endDate: renewal.endDate,
      },

      summary: {
        total,
        renewed: renewed.length,
        notRenewed: notRenewed.length,
        renewedPercent,
        notRenewedPercent,
      },

      renewed,

      notRenewed,
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
// List All Renewal Periods
// GET /api/reports/renewals
// ==========================================
exports.getRenewalPeriods = async (req, res) => {
  try {

    const renewals = await Renewal.find()
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: renewals.length,
      data: renewals,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ==========================================
// Branch Summary Report
// GET /api/reports/branches/:renewalId
// ==========================================
exports.branchSummaryReport = async (req, res) => {
  try {

    const { renewalId } = req.params;

    const summary = await Pensioner.aggregate([
      {
        $group: {
          _id: "$poessaBranch",
          total: { $sum: 1 },
          renewed: {
            $sum: {
              $cond: [
                {
                  $eq: ["$lastRenewalId", renewalId],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const result = summary.map((item) => ({
      branch: item._id,
      total: item.total,
      renewed: item.renewed,
      notRenewed: item.total - item.renewed,
    }));

    res.json({
      success: true,
      data: result,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
