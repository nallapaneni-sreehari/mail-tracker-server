const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
    sender:{
        type:String,
        required:true
    },
    receiver:{
        type:Array,
        required:true
    },
    sentAt:{
        type:Date,
        required:true
    },
    openedAt:{
        type:Date,
        required:false
    },
    openedBy:{
        type:String,
        required:false
    },
    uniqueId:{
        type:String,
        required:false
    },
    emailBody:{
        type:String,
        required:false
    },
    emailSubject:{
        type:String,
        required:false
    },
    openedTimes:{
        type:Number,
        required:false,
        default:0
    },
    clicked:{
        type:String,
        required:false
    },
    clickedTimes:{
        type:Number,
        required:false,
        default:0
    },
});

module.exports = mongoose.model('emails', emailSchema);