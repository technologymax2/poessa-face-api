const mongoose = require("mongoose");

const videoCallSchema = new mongoose.Schema(
{
    roomId:{
        type:String,
        required:true,
        unique:true
    },

    pensioner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Pensioner",
        required:true
    },

    officer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"FaceUser",
        default:null
    },

    status:{
        type:String,
        enum:[
            "WAITING",
            "RINGING",
            "CONNECTED",
            "COMPLETED",
            "REJECTED",
            "CANCELLED"
        ],
        default:"WAITING"
    },

    startedAt:Date,
    endedAt:Date,

    notes:{
        type:String,
        default:""
    },

    renewalApproved:{
        type:Boolean,
        default:false
    }

},
{timestamps:true}
);

module.exports = mongoose.model("VideoCall",videoCallSchema);
