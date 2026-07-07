const Pensioner = require("../models/Pensioner");
const Renewal = require("../models/Renewal");

exports.getRenewalReport = async (req, res) => {
  try {
    const { renewalId, branch } = req.query;

    if (!renewalId) {
      return res.status(400).json({
        success: false,
        message: "renewalId is required",
      });
    }

    const renewal = await Renewal.findById(renewalId);

    if (!renewal) {
      return res.status(404).json({
        success: false,
        message: "Renewal not found",
      });
    }

    let filter = {};

    if (branch) {
      filter.poessaBranch = branch;
    }

    const renewed = await Pensioner.find({
      ...filter,
      lastRenewalId: renewal._id,
    });

    const notRenewed = await Pensioner.find({
      ...filter,
      $or: [
        { lastRenewalId: { $ne: renewal._id } },
        { lastRenewalId: null },
      ],
    });

    res.json({
      success: true,
      renewal,
      summary: {
        renewed: renewed.length,
        notRenewed: notRenewed.length,
        total: renewed.length + notRenewed.length,
      },
      renewed,
      notRenewed,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
