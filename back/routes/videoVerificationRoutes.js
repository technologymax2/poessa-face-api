const express = require("express");
const router = express.Router();

const controller = require("../controllers/videoVerificationController");

router.post("/request-call", controller.requestCall);

router.get("/pensioner/:faydaNumber", controller.findPensioner);

router.post("/approve-renewal", controller.approveRenewal);

router.post("/save-evidence", controller.saveEvidence);

router.get("/waiting-queue", controller.waitingQueue);

router.get("/active-calls", controller.activeCalls);

module.exports = router;
