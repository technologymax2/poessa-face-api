const VideoCall = require("../models/VideoCall");
const Pensioner = require("../models/Pensioner");
const Renewal = require("../models/Renewal");
const CallEvidence = require("../models/CallEvidence");
const CallAudit = require("../models/CallAudit");
exports.findPensioner = async (req,res)=>{

try{

const pensioner=await Pensioner.findOne({

faydaNumber:req.params.faydaNumber

});

if(!pensioner){

return res.status(404).json({

success:false,

message:"Pensioner not found"

});

}

res.json({

success:true,

data:pensioner

});

}

catch(err){

res.status(500).json({

success:false,

message:err.message

});

}

};
exports.requestCall=async(req,res)=>{

try{

const{

roomId,

pensionerId

}=req.body;

const pensioner=await Pensioner.findById(

pensionerId

);

if(!pensioner){

return res.status(404).json({

message:"Pensioner not found"

});

}

const call=await VideoCall.create({

roomId,

pensioner:pensioner._id,

status:"WAITING"

});

await CallAudit.create({

roomId,

action:"CALL_REQUESTED",

performedBy:pensioner._id

});

res.json({

success:true,

data:call

});

}

catch(err){

res.status(500).json({

success:false,

message:err.message

});

}

};
exports.saveEvidence=async(req,res)=>{

try{

const{

roomId,

image,

officerId

}=req.body;

const evidence=await CallEvidence.create({

roomId,

image,

capturedBy:officerId

});

await CallAudit.create({

roomId,

action:"SCREENSHOT_CAPTURED",

performedBy:officerId

});

res.json({

success:true,

data:evidence

});

}

catch(err){

res.status(500).json({

success:false,

message:err.message

});

}

};
exports.approveRenewal=async(req,res)=>{

try{

const{

callId,

officerId,

notes

}=req.body;

const call=await VideoCall.findById(callId);

call.renewalApproved=true;

call.notes=notes;

call.status="COMPLETED";

await call.save();

const renewal=await Renewal.create({

pensioner:call.pensioner,

officer:officerId,

status:"APPROVED"

});

await Pensioner.findByIdAndUpdate(

call.pensioner,

{

verified:true,

verifiedAt:new Date(),

lastRenewalId:renewal._id

}

);

await CallAudit.create({

roomId:call.roomId,

action:"RENEWAL_APPROVED",

performedBy:officerId

});

res.json({

success:true,

renewal

});

}

catch(err){

res.status(500).json({

success:false,

message:err.message

});

}

};
exports.waitingQueue=async(req,res)=>{

const queue=await VideoCall

.find({

status:"WAITING"

})

.populate("pensioner");

res.json(queue);

};
exports.activeCalls=async(req,res)=>{

const calls=await VideoCall

.find({

status:"CONNECTED"

})

.populate("pensioner")

.populate("officer");

res.json(calls);

};
