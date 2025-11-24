const mongoose = require('mongoose');

// Schema for each command in the data array
const dataSchema = new mongoose.Schema({
  command: {
    type: String,
    required: true
  },
  ct_ratio: {
    type: Map,
    of: Number
  },
  i_offset: {
    type: Map,
    of: Number
  },
  v_offset: {
    type: Map,
    of: Number
  }
}, { _id: false });

// Main schema for device measurements
const measurementsSchema = new mongoose.Schema({
  device_uuid: {
    type: String,
    required: true
  },
  data: {
    type: [dataSchema],
    required: true
  }
});

module.exports = mongoose.model('Measurements', measurementsSchema);
