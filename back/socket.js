const { Server } = require("socket.io");

const VideoCall = require("./models/VideoCall");
const OfficerStatus = require("./models/OfficerStatus");

module.exports = (server) => {

const io = new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"],
        credentials:true
    },

    transports:["websocket","polling"]

});

const connectedUsers=new Map();

const officerSockets=new Map();

const pensionerSockets=new Map();

const waitingQueue=[];

const activeCalls=new Map();

console.log("✅ Socket.IO Started");
    socket.on("registerOfficer",async(data)=>{

const{

officerId,
name

}=data;

connectedUsers.set(socket.id,{

userId:officerId,

role:"OFFICER"

});

officerSockets.set(officerId,socket.id);

await OfficerStatus.findOneAndUpdate(

{officer:officerId},

{

online:true,

busy:false,

lastSeen:new Date()

},

{

upsert:true

}

);

io.emit("officerStatusUpdated");

});
    socket.on("registerPensioner",(data)=>{

connectedUsers.set(socket.id,{

userId:data.pensionerId,

role:"PENSIONER"

});

pensionerSockets.set(

data.pensionerId,

socket.id

);

});
    socket.on("requestCall",async(data)=>{

waitingQueue.push({

roomId:data.roomId,

pensionerId:data.pensionerId,

requestedAt:new Date()

});

io.emit("queueUpdated",waitingQueue);

assignOfficer();

});
    async function assignOfficer(){

const waiting=waitingQueue[0];

if(!waiting) return;

const freeOfficer=await OfficerStatus.findOne({

online:true,

busy:false

});

if(!freeOfficer) return;

freeOfficer.busy=true;

await freeOfficer.save();

const socketId=officerSockets.get(

String(freeOfficer.officer)

);

if(socketId){

io.to(socketId).emit(

"incomingCall",

waiting

);

}


    socket.on("acceptCall",async(data)=>{

const{

roomId,
officerId

}=data;

socket.join(roomId);

activeCalls.set(roomId,{

officerId

});

const call=await VideoCall.findOne({

roomId

});

call.status="CONNECTED";

call.officer=officerId;

call.startedAt=new Date();

await call.save();

const index=waitingQueue.findIndex(

q=>q.roomId===roomId

);

if(index!==-1){

waitingQueue.splice(index,1);

}

io.emit(

"queueUpdated",

waitingQueue

);

io.to(roomId).emit(

"callAccepted"

);

});
        socket.on("joinRoom", ({ roomId }) => {

    socket.join(roomId);

    console.log(`${socket.id} joined ${roomId}`);

});
        socket.on("offer", ({ roomId, offer }) => {

    socket.to(roomId).emit("offer", {

        offer,

        sender: socket.id

    });

});
        socket.on("answer", ({ roomId, answer }) => {

    socket.to(roomId).emit("answer", {

        answer,

        sender: socket.id

    });

});
        socket.on("iceCandidate", ({ roomId, candidate }) => {

    socket.to(roomId).emit("iceCandidate", {

        candidate,

        sender: socket.id

    });

});
        socket.on("chatMessage", ({ roomId, sender, message }) => {

    io.to(roomId).emit("chatMessage", {

        sender,

        message,

        createdAt: new Date()

    });

});
        socket.on("cameraOn", ({ roomId }) => {

    socket.to(roomId).emit("cameraOn", {

        userId: socket.id

    });

});

socket.on("cameraOff", ({ roomId }) => {

    socket.to(roomId).emit("cameraOff", {

        userId: socket.id

    });

});
        // Microphone ON
socket.on("micOn", ({ roomId }) => {

    socket.to(roomId).emit("micOn", {

        userId: socket.id

    });

});

// Microphone OFF
socket.on("micOff", ({ roomId }) => {

    socket.to(roomId).emit("micOff", {

        userId: socket.id

    });

});
        socket.on("captureEvidence", ({ roomId, image }) => {

    io.to(roomId).emit("evidenceCaptured", {

        image,
        capturedBy: socket.id,
        createdAt: new Date()

    });

});
        socket.on("recordingStarted", ({ roomId }) => {

    io.to(roomId).emit("recordingStarted");

});

socket.on("recordingStopped", ({ roomId }) => {

    io.to(roomId).emit("recordingStopped");

});
        socket.on("saveNotes", ({ roomId, notes }) => {

    io.to(roomId).emit("notesUpdated", {

        notes

    });

});
        socket.on("transferCall", async ({ roomId, fromOfficer, toOfficer }) => {

    const targetSocket = officerSockets.get(toOfficer);

    if (!targetSocket) {
        socket.emit("transferFailed", {
            message: "Target officer is offline."
        });
        return;
    }

    io.to(targetSocket).emit("incomingTransferredCall", {
        roomId,
        fromOfficer
    });

    io.to(roomId).emit("callTransferred", {
        toOfficer
    });

});
        socket.on("officerBusy", async ({ officerId }) => {

    await OfficerStatus.findOneAndUpdate(
        { officer: officerId },
        {
            busy: true,
            lastSeen: new Date()
        }
    );

    io.emit("officerStatusUpdated");

});
        socket.on("officerAvailable", async ({ officerId }) => {

    await OfficerStatus.findOneAndUpdate(
        { officer: officerId },
        {
            busy: false,
            lastSeen: new Date()
        }
    );

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

    await OfficerStatus.findOneAndUpdate(
        { officer: officerId },
        {
            busy: false,
            lastSeen: new Date()
        }
    );

    assignOfficer();

});
        socket.on("renewalCompleted", ({ roomId }) => {

    io.to(roomId).emit("renewalCompleted");

});
        socket.on("auditEvent", ({ roomId, action, officer }) => {

    io.to(roomId).emit("auditEvent", {
        roomId,
        action,
        officer,
        time: new Date()
    });

});
        socket.on("disconnect", async () => {

    const user = connectedUsers.get(socket.id);

    if (!user) return;

    connectedUsers.delete(socket.id);

    if (user.role === "OFFICER") {

        officerSockets.delete(user.userId);

        await OfficerStatus.findOneAndUpdate(
            { officer: user.userId },
            {
                online: false,
                busy: false,
                lastSeen: new Date()
            }
        );

        io.emit("officerStatusUpdated");

        assignOfficer();
    }

    if (user.role === "PENSIONER") {

        pensionerSockets.delete(user.userId);

    }

    console.log(`${socket.id} disconnected`);

});
        }); // end io.on("connection")

}; // end module.exports
