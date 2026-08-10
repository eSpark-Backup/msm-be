const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    device_uuid: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Notification', notificationSchema);