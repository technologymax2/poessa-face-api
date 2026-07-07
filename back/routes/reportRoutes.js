// routes/reportRoutes.js

const express = require("express");
const router = express.Router();

const {
  getRenewalReport,
  getRenewalPeriods,
  branchSummaryReport,
} = require("../controllers/reportController");

// =====================================
// GET All Renewal Periods
// GET /api/reports/renewals
// =====================================
router.get("/renewals", getRenewalPeriods);

// =====================================
// GET Renewal Report
// Example:
// /api/reports/renewal?renewalId=xxxxx
// /api/reports/renewal?renewalId=xxxxx&branch=Addis
// =====================================
router.get("/renewal", getRenewalReport);

// =====================================
// GET Branch Summary
// /api/reports/branches/:renewalId
// =====================================
router.get("/branches/:renewalId", branchSummaryReport);

module.exports = router;
