const mongoose = require('mongoose');

const aboutSchema = new mongoose.Schema({
    device_uuid: {
        type: String,
        required: true
    },
    manufacturer : {
        type:String,
        required: true
    },
    hardware_version : {
        type:String,
        required: true
    },
    firmware_version : {
        type:String,
        required: true
    },
    qt_license_version : {
        type:String,
        required: true
    }
})

module.exports = mongoose.model('About', aboutSchema);
