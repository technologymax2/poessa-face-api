const express = require("express");
const router = express.Router();

const {
  createRenewal,
  getCurrentRenewal,
} = require("../controllers/renewalController");

router.post("/", createRenewal);

router.get("/current", getCurrentRenewal);
PUT /api/renewals/:id;
DELETE /api/renewals/:id;

module.exports = router;
