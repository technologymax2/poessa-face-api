// socket.js

const { Server } = require("socket.io");

module.exports = (server) => {

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // ============================================
  // Connected Users
  // key = userId
  // value = socket.id
  // ============================================

  const connectedUsers = new Map();

  // ============================================
  // Active Rooms
  // roomId =>
  // {
  //   officer,
  //   pensioner,
  //   startedAt
  // }
  // ============================================

  const activeRooms = new Map();

  io.on("connection", (socket) => {

    console.log("Socket Connected:", socket.id);

    // ========================================
    // Register User
    // ========================================

    socket.on("register", ({ userId, role }) => {

      connectedUsers.set(userId, {
        socketId: socket.id,
        role,
      });

      socket.userId = userId;
      socket.role = role;

      console.log(`${role} Registered -> ${userId}`);

      io.emit(
        "onlineUsers",
        Array.from(connectedUsers.keys())
      );
    });

    // ========================================
    // Officer Creates Room
    // ========================================

    socket.on("createRoom", ({ roomId, officerId }) => {

      activeRooms.set(roomId, {
        roomId,
        officer: officerId,
        pensioner: null,
        startedAt: new Date(),
      });

      socket.join(roomId);

      console.log("Room Created:", roomId);

      socket.emit("roomCreated", {
        success: true,
        roomId,
      });

    });

    // ========================================
    // Pensioner Join Room
    // ========================================

    socket.on("joinRoom", ({ roomId, pensionerId }) => {

      if (!activeRooms.has(roomId)) {

        return socket.emit("roomError", {
          message: "Room not found.",
        });

      }

      const room = activeRooms.get(roomId);

      room.pensioner = pensionerId;

      activeRooms.set(roomId, room);

      socket.join(roomId);

      io.to(roomId).emit("userJoined", {
        pensionerId,
        roomId,
      });

      console.log(
        `${pensionerId} joined room ${roomId}`
      );

    });

    // ========================================
    // Get Active Rooms
    // ========================================

    socket.on("getRooms", () => {

      socket.emit(
        "rooms",
        Array.from(activeRooms.values())
      );

    });

    // ========================================
    // Heartbeat
    // ========================================

    socket.on("pingServer", () => {

      socket.emit("pongServer", {
        serverTime: new Date(),
      });

    });
        // ========================================
    // WebRTC Offer
    // ========================================

    socket.on("offer", ({ roomId, offer }) => {

      console.log("Offer ->", roomId);

      socket.to(roomId).emit("offer", {
        offer,
        sender: socket.userId,
      });

    });

    // ========================================
    // WebRTC Answer
    // ========================================

    socket.on("answer", ({ roomId, answer }) => {

      console.log("Answer ->", roomId);

      socket.to(roomId).emit("answer", {
        answer,
        sender: socket.userId,
      });

    });

    // ========================================
    // ICE Candidate
    // ========================================

    socket.on("iceCandidate", ({ roomId, candidate }) => {

      socket.to(roomId).emit("iceCandidate", {
        candidate,
        sender: socket.userId,
      });

    });

    // ========================================
    // Camera Enabled
    // ========================================

    socket.on("cameraOn", ({ roomId }) => {

      io.to(roomId).emit("cameraOn", {
        userId: socket.userId,
      });

    });

    // ========================================
    // Camera Disabled
    // ========================================

    socket.on("cameraOff", ({ roomId }) => {

      io.to(roomId).emit("cameraOff", {
        userId: socket.userId,
      });

    });

    // ========================================
    // Microphone Enabled
    // ========================================

    socket.on("micOn", ({ roomId }) => {

      io.to(roomId).emit("micOn", {
        userId: socket.userId,
      });

    });

    // ========================================
    // Microphone Disabled
    // ========================================

    socket.on("micOff", ({ roomId }) => {

      io.to(roomId).emit("micOff", {
        userId: socket.userId,
      });

    });

    // ========================================
    // Screen Share Started
    // ========================================

    socket.on("screenShareStart", ({ roomId }) => {

      io.to(roomId).emit("screenShareStart", {
        userId: socket.userId,
      });

    });

    // ========================================
    // Screen Share Stopped
    // ========================================

    socket.on("screenShareStop", ({ roomId }) => {

      io.to(roomId).emit("screenShareStop", {
        userId: socket.userId,
      });

    });

    // ========================================
    // Chat Message
    // ========================================

    socket.on("chatMessage", ({ roomId, message }) => {

      io.to(roomId).emit("chatMessage", {
        sender: socket.userId,
        message,
        createdAt: new Date(),
      });

    });

    // ========================================
    // Officer Ends Call
    // ========================================

    socket.on("endCall", ({ roomId }) => {

      io.to(roomId).emit("callEnded", {
        roomId,
      });

      if (activeRooms.has(roomId)) {
        activeRooms.delete(roomId);
      }

      console.log("Call Ended:", roomId);

    });
        // ========================================
    // Capture Evidence
    // ========================================

    socket.on("captureEvidence", ({ roomId, image }) => {

      io.to(roomId).emit("captureEvidence", {
        capturedBy: socket.userId,
        image,
        createdAt: new Date(),
      });

    });

    // ========================================
    // Verification Completed
    // ========================================

    socket.on("verificationCompleted", ({ roomId, pensionerId }) => {

      io.to(roomId).emit("verificationCompleted", {
        pensionerId,
        officer: socket.userId,
        completedAt: new Date(),
      });

      console.log(
        "Verification Completed:",
        pensionerId
      );

    });

    // ========================================
    // Call Duration Request
    // ========================================

    socket.on("callDuration", ({ roomId, seconds }) => {

      io.to(roomId).emit("callDuration", {
        seconds,
      });

    });

    // ========================================
    // Audit Log
    // ========================================

    socket.on("auditLog", (data) => {

      console.log("Audit Log");

      console.table(data);

    });

    // ========================================
    // Disconnect
    // ========================================

    socket.on("disconnect", () => {

      console.log("Disconnected:", socket.id);

      if (socket.roomId) {

        socket.to(socket.roomId).emit("participantLeft", {
          userId: socket.userId,
        });

        const room = activeRooms.get(socket.roomId);

        if (room) {

          room.participants =
            room.participants.filter(
              (id) => id !== socket.userId
            );

          if (room.participants.length === 0) {
            activeRooms.delete(socket.roomId);

            console.log(
              "Room deleted:",
              socket.roomId
            );
          } else {
            activeRooms.set(socket.roomId, room);
          }
        }

      }

    });

  });

  // ========================================
  // Active Rooms API
  // ========================================

  io.getActiveRooms = () => {

    return [...activeRooms.values()];

  };

  // ========================================
  // Socket.IO Instance
  // ========================================

  return io;

};
module.exports = initializeSocket;
