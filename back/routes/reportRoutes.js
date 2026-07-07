const express = require("express");
const router = express.Router();

const {
  getRenewalReport,
} = require("../controllers/renewalReportController");

router.get("/renewal", getRenewalReport);

module.exports = router;
