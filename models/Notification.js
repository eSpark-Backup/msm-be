const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    message : {
        type : String,
        required : true
    },
    is_read : {
        type : Boolean,
        default : false
    },
}, {
    timestamps: true
})

module.exports = mongoose.model('Notification', notificationSchema);