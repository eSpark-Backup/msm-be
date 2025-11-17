const mongoose = require('mongoose');

const OTA = new mongoose.Schema({
    device_uuid:{
        type:String,
        required:true,
        index:true
    },
    current_version:{
        type:String,
        required:true
    },
    last_update_date:{
        type: String,
        default: ''
    },
    last_update_time:{
        type: String,
        default: ''
    },
    ota_status:{
        type: String,
        default: '',
        enum: ['success', 'failed', 'started', '']
    }
},{
    timestamps:true
})

module.exports = mongoose.model('OTA', OTA);
