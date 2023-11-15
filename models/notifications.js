const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
    email: String,
    desktop: { type: Boolean, default: true },
    sms: { type: Boolean, default: false },
    whatsapp: { type: Boolean, default: false },
    mobile: String
});

module.exports = mongoose.model('notifications', notificationSchema);