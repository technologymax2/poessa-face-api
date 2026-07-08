const VideoCall = require("../models/VideoCall");
const Pensioner = require("../models/Pensioner");
const CallEvidence = require("../models/CallEvidence");
const Renewal = require("../models/Renewal");
const CallAudit = require("../models/CallAudit");

/*
====================================================
Search Pensioner
GET /api/video/search?query=
====================================================
*/

exports.searchPensioner = async (req, res) => {
  try {
    const { query } = req.query;

    const pensioner = await Pensioner.findOne({
      $or: [
        { faydaNumber: query },
        { pensionerId: query }
      ]
    });

    if (!pensioner) {
      return res.status(404).json({
        success: false,
        message: "Pensioner not found"
      });
    }

    res.json({
      success: true,
      data: pensioner
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/*
====================================================
Create Call
POST /api/video/create
====================================================
*/

exports.createCallSession = async (req, res) => {

  try {

    const { pensionerId } = req.body;

    const pensioner = await Pensioner.findById(pensionerId);

    if (!pensioner) {
      return res.status(404).json({
        success:false,
        message:"Pensioner not found"
      });
    }

    const roomId =
      "ROOM-" +
      Date.now() +
      "-" +
      Math.floor(Math.random()*10000);

    const call = await VideoCall.create({

      roomId,

      pensioner:pensioner._id,

      status:"WAITING"

    });

    await CallAudit.create({

      call:call._id,

      action:"CALL_CREATED",

      description:"Video call created"

    });

    res.json({

      success:true,

      roomId,

      call

    });

  }

  catch(err){

    res.status(500).json({

      success:false,

      message:err.message

    });

  }

};

/*
====================================================
Join Call
====================================================
*/

exports.joinCall = async(req,res)=>{

try{

const call=await VideoCall.findById(req.params.id);

if(!call){

return res.status(404).json({

success:false,

message:"Call not found"

});

}

call.officer=req.user.id;

call.status="CONNECTED";

call.startedAt=new Date();

await call.save();

await CallAudit.create({

call:call._id,

action:"CALL_CONNECTED",

description:"Officer accepted call"

});

res.json({

success:true,

call

});

}

catch(err){

res.status(500).json({

success:false,

message:err.message

});

}

};

/*
====================================================
End Call
====================================================
*/

exports.endCall=async(req,res)=>{

try{

const call=await VideoCall.findById(req.params.id);

if(!call){

return res.status(404).json({

success:false,

message:"Call not found"

});

}

call.status="COMPLETED";

call.endedAt=new Date();

await call.save();

await CallAudit.create({

call:call._id,

action:"CALL_ENDED",

description:"Video call finished"

});

res.json({

success:true,

message:"Call completed"

});

}

catch(err){

res.status(500).json({

success:false,

message:err.message

});

}

};

/*
====================================================
Capture Screenshot
====================================================
*/

exports.captureEvidence=async(req,res)=>{

try{

const call=await VideoCall.findById(req.params.id);

if(!call){

return res.status(404).json({

success:false,

message:"Call not found"

});

}

const evidence=await CallEvidence.create({

call:call._id,

image:req.file.path,

capturedBy:req.user.id

});

await Pensioner.findByIdAndUpdate(

call.pensioner,

{

lastVerificationImage:req.file.path

}

);

await CallAudit.create({

call:call._id,

action:"SCREENSHOT",

description:"Evidence captured"

});

res.json({

success:true,

evidence

});

}

catch(err){

res.status(500).json({

success:false,

message:err.message

});

}

};

/*
====================================================
Complete Renewal
====================================================
*/

exports.completeVerification=async(req,res)=>{

try{

const{

approved,

notes

}=req.body;

const call=await VideoCall.findById(req.params.id);

if(!call){

return res.status(404).json({

success:false,

message:"Call not found"

});

}

call.notes=notes;

call.renewalApproved=approved;

call.status="COMPLETED";

call.endedAt=new Date();

await call.save();

const renewal=await Renewal.create({

pensioner:call.pensioner,

officer:call.officer,

videoCall:call._id,

status:approved?"APPROVED":"REJECTED",

notes

});

await Pensioner.findByIdAndUpdate(

call.pensioner,

{

verified:approved,

verifiedAt:new Date(),

lastRenewalId:renewal._id

}

);

await CallAudit.create({

call:call._id,

action:"RENEWAL_COMPLETED",

description:"Renewal finished"

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

/*
====================================================
Pending Calls
====================================================
*/

exports.getPendingCalls=async(req,res)=>{

const calls=await VideoCall.find({

status:"WAITING"

})

.populate("pensioner")

.sort({

createdAt:1

});

res.json({

success:true,

data:calls

});

};

/*
====================================================
History
====================================================
*/

exports.getCallHistory=async(req,res)=>{

const history=await VideoCall.find()

.populate("pensioner")

.populate("officer")

.sort({

createdAt:-1

});

res.json({

success:true,

data:history

});

};

/*
====================================================
Details
====================================================
*/

exports.getCallDetails=async(req,res)=>{

const call=await VideoCall.findById(req.params.id)

.populate("pensioner")

.populate("officer");

if(!call){

return res.status(404).json({

success:false,

message:"Call not found"

});

}

const evidence=await CallEvidence.find({

call:call._id

});

const audit=await CallAudit.find({

call:call._id

});

res.json({

success:true,

call,

evidence,

audit

});

};
