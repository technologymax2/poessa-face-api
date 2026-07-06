const express = require("express");
const router = express.Router();

const {
  createRenewal,
  getCurrentRenewal,
} = require("../controllers/renewalController");

router.post("/", createRenewal);

router.get("/current", getCurrentRenewal);
router.put("/:id", updateRenewal);

router.delete("/:id", deleteRenewal);

module.exports = router;
