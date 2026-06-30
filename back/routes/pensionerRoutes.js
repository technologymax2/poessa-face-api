const express = require("express");
const router = express.Router();

const {
  registerPensioner,
  getAllPensioners,
  getPensionerById,
  updatePensioner,
  deletePensioner,
  searchPensioner,
} = require("../controllers/pensionerController");

const {
  uploadRegistration,
} = require("../middleware/uploadMiddleware");

const {
  protect,
} = require("../middleware/authMiddleware");

router.post(
  "/register",
  protect,
  uploadRegistration.single("image"),
  registerPensioner
);

router.get("/", protect, getAllPensioners);

router.get("/search/:keyword", protect, searchPensioner);

router.get("/:id", protect, getPensionerById);

router.put(
  "/:id",
  protect,
  uploadRegistration.single("image"),
  updatePensioner
);

router.delete("/:id", protect, deletePensioner);

module.exports = router;