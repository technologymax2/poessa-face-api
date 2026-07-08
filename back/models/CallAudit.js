const mongoose=require("mongoose");

const auditSchema=new mongoose.Schema({

    call:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"VideoCall"
    },

    action:String,

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"FaceUser"
    },

    description:String

},{timestamps:true});

module.exports=mongoose.model("CallAudit",auditSchema);
