const mongoose = require('mongoose');

const configrationSchema = new mongoose.Schema({
    device_uuid: {
        type: String,
        required: true,
    },
    voltage_unbalance: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true
}
)

module.exports = mongoose.model('Configration', configrationSchema);