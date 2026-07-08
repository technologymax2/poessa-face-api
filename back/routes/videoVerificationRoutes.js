const express = require("express");
const router = express.Router();

const {
  searchPensioner,
  createCallSession,
  joinCall,
  endCall,
  captureEvidence,
  completeVerification,
  getPendingCalls,
  getCallHistory,
  getCallDetails,
} = require("../controllers/videoVerificationController");

const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// =======================================
// Search Pensioner by Fayda / Pensioner ID
// GET /api/video/search?query=xxxxx
// =======================================
router.get(
  "/search",
  authMiddleware,
  searchPensioner
);

// =======================================
// Create New Video Call
// POST /api/video/create
// =======================================
router.post(
  "/create",
  authMiddleware,
  createCallSession
);

// =======================================
// Join Existing Call
// POST /api/video/:id/join
// =======================================
router.post(
  "/:id/join",
  authMiddleware,
  joinCall
);

// =======================================
// End Video Call
// POST /api/video/:id/end
// =======================================
router.post(
  "/:id/end",
  authMiddleware,
  endCall
);

// =======================================
// Capture Evidence Image
// POST /api/video/:id/evidence
// =======================================
router.post(
  "/:id/evidence",
  authMiddleware,
  upload.single("image"),
  captureEvidence
);

// =======================================
// Complete Renewal
// POST /api/video/:id/complete
// =======================================
router.post(
  "/:id/complete",
  authMiddleware,
  completeVerification
);

// =======================================
// Waiting Calls Dashboard
// GET /api/video/pending
// =======================================
router.get(
  "/pending",
  authMiddleware,
  getPendingCalls
);

// =======================================
// Call History
// GET /api/video/history
// =======================================
router.get(
  "/history",
  authMiddleware,
  getCallHistory
);

// =======================================
// Call Details
// GET /api/video/:id
// =======================================
router.get(
  "/:id",
  authMiddleware,
  getCallDetails
);

module.exports = router;
