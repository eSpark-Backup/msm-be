const mongoose = require('mongoose');

const MqttS = new mongoose.Schema({
    device_uuid: {
        type: String,
        required: true,
        index: true
    },
    broker_ip: { 
        type: String, 
        required: true 
    },
    broker_port: { 
        type: Number, 
        required: true 
    },
    data_interval: {
        type: Number, 
        required: true 
    },
    root_ca: { 
        type: Boolean, 
        required: true,
        default: false 
    },
    claim_cert: { 
        type: Boolean, 
        required: true,
        default: false 
    },
    claim_key: { 
        type: Boolean, 
        required: true,
        default:false 
    }
}, {
    timestamps: true,
    collection: 'mqtts'
}

)

module.exports = mongoose.model('MqttS', MqttS);