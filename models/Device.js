const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  device_uuid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  device_imei: {
    type: String,
    required: false
  },
  device_ip: {
    type: String,
    required: false
  },
  mqtt_status: {
    type: Boolean,
    default: false
  },
  sftp_status: {
    type: Boolean,
    default: false
  },
  connection_status: {
    type: String,
    enum: ['online', 'offline', 'unknown'],
    default: 'unknown'
  },
  last_seen: {
    type: Date,
    default: Date.now
  },
  last_telemetry: {
    type: Date,
    required: false
  },
  firmware_version: {
    type: String,
    required: false
  },
  battery_level: {
    type: Number,
    required: false
  },
  signal_strength: {
    type: Number,
    required: false
  },
  // Configuration status tracking
  ntp_config: {
    server_1: String,
    server_2: String,
    server_3: String,
    last_updated: Date
  },
  mqtt_config: {
    broker_ip: String,
    broker_port: Number,
    broker_user: String,
    data_interval: Number,
    mqtt_topic: String,
    last_updated: Date
  },
  sftp_config: {
    server_ip: String,
    server_port: Number,
    username: String,
    data_interval: Number,
    last_updated: Date
  },
  // Device status tracking
  reboot_history: [{
    timestamp: Date,
    status: String, // 'requested', 'acknowledged', 'completed'
    response_data: mongoose.Schema.Types.Mixed
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
deviceSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Index for efficient queries
deviceSchema.index({ device_uuid: 1, last_seen: -1 });
deviceSchema.index({ connection_status: 1 });

module.exports = mongoose.model('Device', deviceSchema);
