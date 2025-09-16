const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
  device_uuid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  device_pass: {
    type: String,
    required:true
  },
  device_imei: {
    type: String,
    required: true
  },
  device_ip: {
    type: String,
    required: true
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
