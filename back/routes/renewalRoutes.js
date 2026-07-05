const express = require("express");
const router = express.Router();

const {
  createRenewal,
  getCurrentRenewal,
} = require("../controllers/renewalController");

router.post("/", createRenewal);

router.get("/current", getCurrentRenewal);

module.exports = router;
