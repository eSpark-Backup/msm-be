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
  }
},
  {
    timestamps: true
  }
);



module.exports = mongoose.model('Device', deviceSchema);
