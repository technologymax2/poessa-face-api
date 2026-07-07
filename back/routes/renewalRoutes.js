const express = require("express");
const router = express.Router();

const {
  createRenewal,
  getCurrentRenewal,
  getRenewals,
  updateRenewal,
  deleteRenewal,
} = require("../controllers/renewalController");

router.get("/", getRenewals);

router.get("/current", getCurrentRenewal);

router.post("/", createRenewal);

router.put("/:id", updateRenewal);

router.delete("/:id", deleteRenewal);

module.exports = router;
