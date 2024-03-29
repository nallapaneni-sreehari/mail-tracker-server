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
    status:{
        type:String,
        required:true,
        default:'sent'
    },
    messageId:{
        type:String,
        required:false
    },
    openedAt:{
        type:Date,
        required:false
    },
    lastOpenedAt:{
        type:Date,
        required:false,
        default:Date.now()
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
    notificationSettings: {
        type: Object, default: {
            desktop: 'enabled',
            whatsapp: 'disabled',
            sms: 'disabled',
        }
    },
    geoInfo: {
        type: Object,
        default: {}
    }
});

module.exports = mongoose.model('emails', emailSchema);