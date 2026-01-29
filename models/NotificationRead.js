const mongoose = require('mongoose');

const notificationReadSchema = new mongoose.Schema({
    notification_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notification',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    read_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('NotificationRead', notificationReadSchema);
