const express = require("express");
const router = express.Router();

const {
  verifyPensioner,
  verificationHistory,
} = require("../controllers/verificationController");

const {
  uploadVerification,
} = require("../middleware/uploadMiddleware");

const {
  protect,
} = require("../middleware/authMiddleware");

router.post(
  "/",
  protect,
  uploadVerification.single("selfie"),
  verifyPensioner
);

router.get(
  "/history",
  protect,
  verificationHistory
);

module.exports = router;