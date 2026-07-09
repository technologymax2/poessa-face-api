// One-off cleanup script.
// Run once with: node cleanup-officer-status.js
// Make sure MONGO_URI is set in your environment (or .env in this folder).

require("dotenv").config();
const mongoose = require("mongoose");
const OfficerStatus = require("./models/OfficerStatus");

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected");

  const bad = await OfficerStatus.find({
    $or: [{ officer: { $exists: false } }, { officer: null }],
  });

  console.log(`Found ${bad.length} corrupt OfficerStatus record(s):`);
  console.log(bad);

  if (bad.length > 0) {
    const result = await OfficerStatus.deleteMany({
      $or: [{ officer: { $exists: false } }, { officer: null }],
    });
    console.log(`🗑️  Deleted ${result.deletedCount} record(s).`);
  }

  await mongoose.disconnect();
  process.exit(0);
})().catch((err) => {
  console.error("❌ Cleanup failed:", err);
  process.exit(1);
});
