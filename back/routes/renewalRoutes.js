const express = require("express");
const router = express.Router();

const {
  createRenewal,
  getCurrentRenewal,
  updateRenewal,
  deleteRenewal,
} = require("../controllers/renewalController");

router.post("/", createRenewal);

router.get("/current", getCurrentRenewal);

// 👇 እነዚህን 2 መስመሮች ጨምር
router.put("/:id", updateRenewal);

router.delete("/:id", deleteRenewal);

module.exports = router;
