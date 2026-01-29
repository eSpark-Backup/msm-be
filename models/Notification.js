const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    device_id: {
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