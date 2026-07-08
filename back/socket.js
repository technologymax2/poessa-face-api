const { Server } = require("socket.io");

module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const connectedUsers = new Map(); // userId -> {socketId, role}
  const activeRooms = new Map();    // roomId -> {officer, pensioner, startedAt}
  const waitingQueue = [];          // Array of objects for waiting calls
  const busyOfficers = new Map();   // officerId -> roomId

  io.on("connection", (socket) => {
    console.log("Socket Connected:", socket.id);

    // 1. ምዝገባ (Registration)
    socket.on("register", ({ userId, role }) => {
      socket.userId = userId;
      socket.role = role;
      connectedUsers.set(userId, { socketId: socket.id, role });
      console.log(`${role} Registered -> ${userId}`);
    });

    // 2. ጥሪ መጠየቅ (Request Video Verification)
    socket.on("requestVideoVerification", (data) => {
      const queueItem = { ...data, requestedAt: new Date(), status: "WAITING" };
      waitingQueue.push(queueItem);
      io.emit("queueUpdated", waitingQueue);
    });

    // 3. ኦፊሰር ጥሪ መቀበል (Accept Call)
    socket.on("acceptCall", ({ roomId, officerId }) => {
      const room = waitingQueue.find((r) => r.roomId === roomId);
      if (room) {
        room.status = "CONNECTED";
        socket.join(roomId);
        busyOfficers.set(officerId, roomId);
        io.to(roomId).emit("callAccepted", room);
        io.emit("queueUpdated", waitingQueue);
      }
    });

    // 4. WebRTC Signalling (Offer, Answer, ICE Candidate)
    socket.on("offer", ({ roomId, offer }) => {
      socket.to(roomId).emit("offer", { offer, sender: socket.userId });
    });

    socket.on("answer", ({ roomId, answer }) => {
      socket.to(roomId).emit("answer", { answer, sender: socket.userId });
    });

    socket.on("iceCandidate", ({ roomId, candidate }) => {
      socket.to(roomId).emit("iceCandidate", { candidate, sender: socket.userId });
    });

    // 5. የቻት እና የካሜራ መቆጣጠሪያዎች
    socket.on("chatMessage", ({ roomId, message }) => {
      io.to(roomId).emit("chatMessage", { 
        sender: socket.userId, 
        message, 
        createdAt: new Date() 
      });
    });

    socket.on("cameraOn", ({ roomId }) => io.to(roomId).emit("cameraOn", { userId: socket.userId }));
    socket.on("cameraOff", ({ roomId }) => io.to(roomId).emit("cameraOff", { userId: socket.userId }));
    socket.on("micOn", ({ roomId }) => io.to(roomId).emit("micOn", { userId: socket.userId }));
    socket.on("micOff", ({ roomId }) => io.to(roomId).emit("micOff", { userId: socket.userId }));

    // 6. ማስረጃ መያዝ (Capture Evidence)
    socket.on("captureEvidence", ({ roomId, image }) => {
      io.to(roomId).emit("captureEvidence", { capturedBy: socket.userId, image });
    });

    // 7. ጥሪ ማጠናቀቅ (End Call)
    socket.on("endCall", ({ roomId, officerId }) => {
      busyOfficers.delete(officerId);
      io.to(roomId).emit("callEnded", { roomId });
      console.log("Call Ended:", roomId);
    });

    // 8. መቋረጥ (Disconnect)
    socket.on("disconnect", () => {
      console.log("Disconnected:", socket.id);
      connectedUsers.delete(socket.userId);
    });
  });

  return io;
};
