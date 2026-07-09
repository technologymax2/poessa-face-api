require("dotenv").config();
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const app = require("./app"); // Ensure your app.js exports the express 'app' object, not app.listen()

const PORT = process.env.PORT || 10000;

let server;

const connectDB = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // 2. Create HTTP Server
    server = http.createServer(app);

    // 3. Initialize Socket.io
    const io = new Server(server, {
      cors: {
        origin: "*", // Adjust to your actual frontend domain in production
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    // 4. Signaling Logic
    io.on("connection", (socket) => {
      console.log(`User connected: ${socket.id}`);

      socket.on("joinRoom", ({ roomId }) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room: ${roomId}`);
      });

      // Relay Offer
      socket.on("offer", ({ roomId, offer }) => {
        socket.to(roomId).emit("offer", { offer, roomId });
      });

      // Relay Answer
      socket.on("answer", ({ roomId, answer }) => {
        socket.to(roomId).emit("answer", { answer });
      });

      // Relay ICE Candidates
      socket.on("iceCandidate", ({ roomId, candidate }) => {
        socket.to(roomId).emit("iceCandidate", { candidate });
      });

      // Handle Call End
      socket.on("endCall", ({ roomId }) => {
        socket.to(roomId).emit("callEnded");
      });

      socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
      });
    });

    // 5. Start Server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

// Start the sequence
connectDB();

// Global Error Handling
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

process.on("unhandledRejection", (err) => handleFatalError("Unhandled Rejection", err));
process.on("uncaughtException", (err) => handleFatalError("Uncaught Exception", err));
