const mongoose=require("mongoose");

const evidenceSchema=new mongoose.Schema({

    call:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"VideoCall",
        required:true
    },

    image:{
        type:String,
        required:true
    },

    capturedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"FaceUser"
    }

},{timestamps:true});

module.exports=mongoose.model("CallEvidence",evidenceSchema);
