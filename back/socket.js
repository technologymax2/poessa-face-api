const { Server } = require("socket.io");
const { Types } = require("mongoose");
const VideoCall = require("./models/VideoCall");
const OfficerStatus = require("./models/OfficerStatus");

module.exports = (server) => {
    const io = new Server(server, {
        cors: { origin: "*", methods: ["GET", "POST"], credentials: true },
        transports: ["websocket", "polling"]
    });

    const connectedUsers = new Map();   // socket.id -> { userId, role }
    const officerSockets = new Map();   // officerId (string) -> socket.id
    const pensionerSockets = new Map(); // pensionerId -> socket.id
    const waitingQueue = [];
    const activeCalls = new Map();

    console.log("✅ Socket.IO Started");

    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        async function assignOfficer() {
            const waiting = waitingQueue[0];
            if (!waiting) return;
            const freeOfficer = await OfficerStatus.findOne({ online: true, busy: false });
            if (!freeOfficer) return;

            freeOfficer.busy = true;
            await freeOfficer.save();

            const socketId = officerSockets.get(String(freeOfficer.officer));
            if (socketId) {
                io.to(socketId).emit("incomingCall", waiting);
            } else {
                // Officer marked online but no live socket — revert and try again later
                freeOfficer.busy = false;
                await freeOfficer.save();
                console.warn(`⚠️ Officer ${freeOfficer.officer} has no active socket connection.`);
            }
        }

        // ---- Officer registration ----
        socket.on("registerOfficer", async (data) => {
            const { officerId, name } = data || {};
            if (!officerId) return;

            // Track this socket so we can actually reach the officer later
            officerSockets.set(String(officerId), socket.id);
            connectedUsers.set(socket.id, { userId: officerId, role: "OFFICER" });

            try {
                const officerObjectId = new Types.ObjectId(officerId);
                await OfficerStatus.findOneAndUpdate(
                    { officer: officerObjectId },
                    { online: true, busy: false, lastSeen: new Date() },
                    { upsert: true, new: true }
                );
                console.log(`✅ Officer ${name || officerId} registered on socket ${socket.id}`);
                // In case someone was already waiting when this officer came online
                assignOfficer();
            } catch (err) {
                console.error("❌ Registration Error:", err.message);
            }
        });

        // ---- Pensioner registration ----
        socket.on("registerPensioner", (data) => {
            const { pensionerId } = data || {};
            if (!pensionerId) return;
            connectedUsers.set(socket.id, { userId: pensionerId, role: "PENSIONER" });
            pensionerSockets.set(pensionerId, socket.id);
        });

        // ---- Room join (both sides must call this before signaling) ----
        socket.on("joinRoom", ({ roomId }) => {
            if (!roomId) return;
            socket.join(roomId);
            console.log(`Socket ${socket.id} joined room ${roomId}`);
        });

        socket.on("requestCall", async (data) => {
            waitingQueue.push({ roomId: data.roomId, pensionerId: data.pensionerId, requestedAt: new Date() });
            io.emit("queueUpdated", waitingQueue);
            assignOfficer();
        });

        socket.on("acceptCall", async (data) => {
            const { roomId, officerId } = data;
            socket.join(roomId); // safe to call again, no-op if already joined
            activeCalls.set(roomId, { officerId });

            const call = await VideoCall.findOne({ roomId });
            if (call) {
                call.status = "CONNECTED";
                call.officer = officerId;
                call.startedAt = new Date();
                await call.save();
            }

            const index = waitingQueue.findIndex(q => q.roomId === roomId);
            if (index !== -1) waitingQueue.splice(index, 1);

            io.emit("queueUpdated", waitingQueue);
            io.to(roomId).emit("callAccepted");
        });

        // ---- WebRTC Signaling ----
        // roomId is echoed back so clients never have to rely on stale local state
        socket.on("offer", ({ roomId, offer }) => {
            socket.to(roomId).emit("offer", { offer, sender: socket.id, roomId });
        });

        socket.on("answer", ({ roomId, answer }) => {
            socket.to(roomId).emit("answer", { answer, sender: socket.id, roomId });
        });

        socket.on("iceCandidate", ({ roomId, candidate }) => {
            socket.to(roomId).emit("iceCandidate", { candidate, sender: socket.id, roomId });
        });

        socket.on("chatMessage", ({ roomId, sender, message }) => {
            io.to(roomId).emit("chatMessage", { sender, message, createdAt: new Date() });
        });

        socket.on("cameraOn", ({ roomId }) => { io.to(roomId).emit("cameraOn", { userId: socket.id }); });
        socket.on("cameraOff", ({ roomId }) => { io.to(roomId).emit("cameraOff", { userId: socket.id }); });
        socket.on("micOn", ({ roomId }) => { io.to(roomId).emit("micOn", { userId: socket.id }); });
        socket.on("micOff", ({ roomId }) => { io.to(roomId).emit("micOff", { userId: socket.id }); });
        socket.on("captureEvidence", ({ roomId, image }) => { io.to(roomId).emit("evidenceCaptured", { image, capturedBy: socket.id, createdAt: new Date() }); });
        socket.on("recordingStarted", ({ roomId }) => { io.to(roomId).emit("recordingStarted"); });
        socket.on("recordingStopped", ({ roomId }) => { io.to(roomId).emit("recordingStopped"); });
        socket.on("saveNotes", ({ roomId, notes }) => { io.to(roomId).emit("notesUpdated", { notes }); });

        socket.on("transferCall", async ({ roomId, fromOfficer, toOfficer }) => {
            const targetSocket = officerSockets.get(String(toOfficer));
            if (!targetSocket) {
                socket.emit("transferFailed", { message: "Target officer is offline." });
                return;
            }
            io.to(targetSocket).emit("incomingTransferredCall", { roomId, fromOfficer });
            io.to(roomId).emit("callTransferred", { toOfficer });
        });

        socket.on("officerBusy", async ({ officerId }) => {
            await OfficerStatus.findOneAndUpdate({ officer: officerId }, { busy: true, lastSeen: new Date() });
            io.emit("officerStatusUpdated");
        });

        socket.on("officerAvailable", async ({ officerId }) => {
            await OfficerStatus.findOneAndUpdate({ officer: officerId }, { busy: false, lastSeen: new Date() });
            io.emit("officerStatusUpdated");
            assignOfficer();
        });

        socket.on("endCall", async ({ roomId, officerId }) => {
            activeCalls.delete(roomId);
            io.to(roomId).emit("callEnded");

            const call = await VideoCall.findOne({ roomId });
            if (call) {
                call.status = "COMPLETED";
                call.endedAt = new Date();
                await call.save();
            }

            if (officerId) {
                await OfficerStatus.findOneAndUpdate({ officer: officerId }, { busy: false, lastSeen: new Date() });
            }
            assignOfficer();
        });

        socket.on("renewalCompleted", ({ roomId }) => { io.to(roomId).emit("renewalCompleted"); });
        socket.on("auditEvent", ({ roomId, action, officer }) => { io.to(roomId).emit("auditEvent", { roomId, action, officer, time: new Date() }); });

        socket.on("disconnect", async () => {
            const user = connectedUsers.get(socket.id);
            if (!user) return;
            connectedUsers.delete(socket.id);

            if (user.role === "OFFICER") {
                officerSockets.delete(String(user.userId));
                await OfficerStatus.findOneAndUpdate({ officer: user.userId }, { online: false, busy: false, lastSeen: new Date() });
                io.emit("officerStatusUpdated");
                assignOfficer();
            }
            if (user.role === "PENSIONER") {
                pensionerSockets.delete(user.userId);
            }
            console.log(`${socket.id} disconnected`);
        });
    });
};
