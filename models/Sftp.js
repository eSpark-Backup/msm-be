const mongoose = require('mongoose')


const SFTP = new mongoose.Schema({
    device_uuid: {
        type: String,
        required: true,
        index: true
    },
    server_ip: { 
        type: String, 
        required: true 
    },
    server_port: { 
        type: Number, 
        required: true 
    },
    username: { 
        type: String, 
        required: true 
    },
    password: { 
        type: String, 
        required: true 
    }, 
    data_interval: { 
        type: Number, 
        required: true 
    }
}, {
    timestamps: true
}

)

module.exports = mongoose.model('SFTP', SFTP);