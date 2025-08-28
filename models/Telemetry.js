const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema({
  // Device Information
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
  
  // Channel Information
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
  
  // General Measurements
  line_voltage: Number,
  rms_voltage: Number,
  frequency: Number,
  current: Number,
  
  // Power Measurements
  power_factor: Number,
  active_power: Number,
  reactive_power: Number,
  apparent_power: Number,
  
  // Energy Measurements - Active
  active_energy_positive: Number,
  active_energy_negative: Number,
  
  // Energy Measurements - Reactive
  reactive_energy_positive: Number,
  reactive_energy_negative: Number,
  
  // Metadata Fields
  battery_level: Number,
  signal_strength: Number,
  firmware_version: String,
  
  // System Flags
  processed: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for faster queries
telemetrySchema.index({ device_uuid: 1, timestamp: -1 });

// Virtual for device reference
telemetrySchema.virtual('device', {
  ref: 'Device',
  localField: 'device_uuid',
  foreignField: 'deviceId',
  justOne: true
});

// Pre-save hook to update timestamps
telemetrySchema.pre('save', function(next) {
  this.updated_at = new Date();
  if (!this.created_at) {
    this.created_at = new Date();
  }
  next();
});

// Method to get latest telemetry for a device
telemetrySchema.statics.getLatest = function(device_uuid, limit = 1) {
  return this.find({ device_uuid })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

// Method to get telemetry in a time range
telemetrySchema.statics.getInTimeRange = function(device_uuid, start, end, limit = 1000) {
  const query = { device_uuid };
  
  if (start && end) {
    query.timestamp = { $gte: new Date(start), $lte: new Date(end) };
  } else if (start) {
    query.timestamp = { $gte: new Date(start) };
  } else if (end) {
    query.timestamp = { $lte: new Date(end) };
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

module.exports = mongoose.model('Telemetry', telemetrySchema);
