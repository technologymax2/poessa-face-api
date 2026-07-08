const { Server } = require("socket.io");

module.exports = (server) => {

const io = new Server(server,{
    cors:{
        origin:"*",
        credentials:true
    }
});

const officers=new Map();
const pensioners=new Map();
const waitingQueue=[];
const rooms=new Map();

function broadcastQueue(){

    io.emit("queueUpdated",waitingQueue);

}

function findFreeOfficer(){

    for(const [id,user] of officers){

        if(user.status==="AVAILABLE"){

            return user;

        }

    }

    return null;

}

io.on("connection",(socket)=>{

console.log("Connected",socket.id);

////////////////////////////////////////////////////
// REGISTER
////////////////////////////////////////////////////

socket.on("register",({userId,role,name})=>{

    if(role==="OFFICER"){

        officers.set(userId,{
            userId,
            socketId:socket.id,
            name,
            status:"AVAILABLE",
            roomId:null
        });

        console.log("Officer Registered",name);

    }

    if(role==="PENSIONER"){

        pensioners.set(userId,{
            userId,
            socketId:socket.id,
            roomId:null
        });

        console.log("Pensioner Registered");

    }

    io.emit("officerStatus",Array.from(officers.values()));

});

////////////////////////////////////////////////////
// REQUEST CALL
////////////////////////////////////////////////////

socket.on("requestCall",(data)=>{

    const roomId="ROOM-"+Date.now();

    const room={

        roomId,

        pensionerId:data.pensionerId,

        faydaNumber:data.faydaNumber,

        pensionerName:data.name,

        officer:null,

        status:"WAITING"

    };

    waitingQueue.push(room);

    broadcastQueue();

    const freeOfficer=findFreeOfficer();

    if(freeOfficer){

        io.to(freeOfficer.socketId).emit("incomingCall",room);

    }

});

////////////////////////////////////////////////////
// ACCEPT
////////////////////////////////////////////////////

socket.on("acceptCall",({roomId,officerId})=>{

const room=waitingQueue.find(r=>r.roomId===roomId);

if(!room) return;

const officer=officers.get(officerId);

room.status="CONNECTED";

room.officer=officerId;

officer.status="BUSY";

officer.roomId=roomId;

rooms.set(roomId,room);

socket.join(roomId);

const pensioner=pensioners.get(room.pensionerId);

if(pensioner){

    io.sockets.sockets.get(pensioner.socketId)?.join(roomId);

}

io.to(roomId).emit("callAccepted",room);

broadcastQueue();

});

////////////////////////////////////////////////////
// OFFER
////////////////////////////////////////////////////

socket.on("offer",data=>{

socket.to(data.roomId).emit("offer",data);

});

////////////////////////////////////////////////////
// ANSWER
////////////////////////////////////////////////////

socket.on("answer",data=>{

socket.to(data.roomId).emit("answer",data);

});

////////////////////////////////////////////////////
// ICE
////////////////////////////////////////////////////

socket.on("iceCandidate",data=>{

socket.to(data.roomId).emit("iceCandidate",data);

});

////////////////////////////////////////////////////
// CHAT
////////////////////////////////////////////////////

socket.on("chatMessage",data=>{

io.to(data.roomId).emit("chatMessage",{

sender:data.sender,

message:data.message,

time:new Date()

});

});

////////////////////////////////////////////////////
// CAMERA
////////////////////////////////////////////////////

socket.on("cameraOn",(data)=>{

io.to(data.roomId).emit("cameraOn");

});

socket.on("cameraOff",(data)=>{

io.to(data.roomId).emit("cameraOff");

});

socket.on("micOn",(data)=>{

io.to(data.roomId).emit("micOn");

});

socket.on("micOff",(data)=>{

io.to(data.roomId).emit("micOff");

});

////////////////////////////////////////////////////
// SCREENSHOT
////////////////////////////////////////////////////

socket.on("captureEvidence",(data)=>{

io.to(data.roomId).emit("captureEvidence",data);

});

////////////////////////////////////////////////////
// END CALL
////////////////////////////////////////////////////

socket.on("endCall",({roomId,officerId})=>{

const room=rooms.get(roomId);

if(room){

room.status="COMPLETED";

}

const officer=officers.get(officerId);

if(officer){

officer.status="AVAILABLE";

officer.roomId=null;

}

rooms.delete(roomId);

io.to(roomId).emit("callEnded");

io.emit("officerStatus",Array.from(officers.values()));

});

////////////////////////////////////////////////////
// DISCONNECT
////////////////////////////////////////////////////

socket.on("disconnect",()=>{

for(const [id,officer] of officers){

if(officer.socketId===socket.id){

officers.delete(id);

}

}

for(const [id,pensioner] of pensioners){

if(pensioner.socketId===socket.id){

pensioners.delete(id);

}

}

io.emit("officerStatus",Array.from(officers.values()));

console.log("Disconnected");

});

});

return io;

};
