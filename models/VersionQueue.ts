const mongoose = require("mongoose");

const VersionQueueSchema = new mongoose.Schema({
    device_uuid: {
        type: String,
        required: true
    },
    version: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("VersionQueue", VersionQueueSchema);