// server.js
require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app

                    
server = app.listen(PORT, () => {
   console.log(`Server running on ${PORT}`);
});

require("./socket")(server);

const PORT = process.env.PORT || 10000;
let server; // Store the server instance here

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Assign the server instance
    server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error.message);
    process.exit(1);
  }
};

connectDB();

// A reusable function to close the server gracefully
const handleFatalError = (type, err) => {
  console.error(`❌ ${type}:`, err.message || err);
  
  if (server) {
    // Stops the server from accepting new connections but finishes existing ones
    server.close(() => {
      console.log("💤 Server closed. Exiting process...");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

// Listeners updated to use the graceful shutdown function
process.on("unhandledRejection", (err) => handleFatalError("Unhandled Rejection", err));
process.on("uncaughtException", (err) => handleFatalError("Uncaught Exception", err));
