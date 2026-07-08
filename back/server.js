require("dotenv").config();

const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 10000;

let server;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Start Express once
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}`);
    });

    // Attach Socket.IO to the existing server
    require("./socket")(server);

    console.log("✅ Socket.IO Initialized");

  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error.message);
    process.exit(1);
  }
};

connectDB();

const handleFatalError = (type, err) => {
  console.error(`❌ ${type}:`, err.message || err);

  if (server) {
    server.close(() => {
      console.log("💤 Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

process.on("unhandledRejection", (err) =>
  handleFatalError("Unhandled Rejection", err)
);

process.on("uncaughtException", (err) =>
  handleFatalError("Uncaught Exception", err)
);
