const mongoose = require('mongoose');

// Main schema for device measurements
const measurementsSchema = new mongoose.Schema({
  device_uuid: {
    type: String,
    required: true
  },
  command: {
    type: String,
    required: true
  },
  measurements: {
    type: Map,
    required: true
  }
});

module.exports = mongoose.model('Measurements', measurementsSchema);
