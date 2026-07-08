const mongoose=require("mongoose");

const officerStatusSchema=new mongoose.Schema({

    officer:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"FaceUser",
        required:true,
        unique:true
    },

    status:{
        type:String,
        enum:[
            "OFFLINE",
            "AVAILABLE",
            "BUSY"
        ],
        default:"OFFLINE"
    },

    currentRoom:{
        type:String,
        default:null
    }

},{timestamps:true});

module.exports=mongoose.model("OfficerStatus",officerStatusSchema);
