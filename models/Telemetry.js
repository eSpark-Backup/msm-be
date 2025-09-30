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
  
  // General
  line_voltage: Number,
  rms_voltage: Number,
  frequency: Number,
  current: Number,
  
  // Power
  power_factor: Number,
  active_power: Number,
  reactive_power: Number,
  apparent_power: Number,
  
  // Energy
  active_energy_positive: Number,
  active_energy_negative: Number,
  reactive_energy_positive: Number,
  reactive_energy_negative: Number,
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

telemetrySchema.index({ device_uuid: 1, createdAt: -1 });
telemetrySchema.index({ device_uuid: 1, channel_id: 1, createdAt: -1 });
telemetrySchema.index({ device_uuid: 1, channel_id: 1, phase: 1, createdAt: -1 });


telemetrySchema.virtual('device', {
  ref: 'Device',
  localField: 'device_uuid',
  foreignField: 'device_uuid',
  justOne: true
});


module.exports = mongoose.model('Telemetry', telemetrySchema);
