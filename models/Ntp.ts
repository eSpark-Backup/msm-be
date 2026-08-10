const mongoose = require('mongoose')


const NTP = new mongoose.Schema({
    device_uuid: {
        type: String,
        required: true,
        index: true
    },
    data: {
        type: Map,
        of: String
    }
}, {
    timestamps: true
}

)

module.exports = mongoose.model('NTP', NTP);