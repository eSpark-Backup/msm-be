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
        type: String, 
        required: true 
    },
    claim_cert: { 
        type: String, 
        required: true 
    },
    claim_key: { 
        type: String, 
        required: true 
    }
}, {
    timestamps: true,
    collection: 'mqtts'
}

)

module.exports = mongoose.model('MqttS', MqttS);