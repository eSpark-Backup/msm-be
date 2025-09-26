const mongoose = require('mongoose')

const MQTT = new mongoose.Schema({
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
    broker_user: { 
        type: String, 
        required: true 
    },
    broker_pass: { 
        type: String, 
        required: true 
    },
    data_interval: {
        type: Number, 
        required: true 
    },
    mqtt_topic: { 
        type: String, 
        required: true 
    }
}, {
    timestamps: true
}

)

module.exports = mongoose.model('MQTT', MQTT);