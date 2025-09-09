const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema({
  device_uuid: {
    type: String,
    required: true,
    index: true
  },
  timestamp: {
    type: Date,
    required: true,
    index: true
  },
  
  channel_id: {
    type: Number,
    required: true
  },
  phase: {
    type: String,
    required: true
  },
  channel_status: {
    type: Boolean,
    default: true
  },
  temperature: Number,
  
  line_voltage: Number,
  rms_voltage: Number,
  frequency: Number,
  current: Number,
  
  power_factor: Number,
  active_power: Number,
  reactive_power: Number,
  apparent_power: Number,
  
  active_energy_positive: Number,
  active_energy_negative: Number,
  
  reactive_energy_positive: Number,
  reactive_energy_negative: Number,
  
  battery_level: Number,
  signal_strength: Number,
  firmware_version: String,
  
  processed: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

telemetrySchema.index({ device_uuid: 1, timestamp: -1 });

telemetrySchema.virtual('device', {
  ref: 'Device',
  localField: 'device_uuid',
  foreignField: 'device_uuid',
  justOne: true
});

module.exports = mongoose.model('Telemetry', telemetrySchema);
