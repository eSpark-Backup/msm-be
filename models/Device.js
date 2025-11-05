const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  },
  ntp_status: {
    type: String,
    default: ""
  },
  gsm_status: {
    type: String,
    default: ""
  },
  device_status: {
    type: String,
    default: ""
  },
  device_status_updated_at: {
    type: Date,
    default: Date.now
  }
},
  {
    timestamps: true
  }
);


deviceSchema.pre('save' , async function(next){
    if(this.isModified('device_pass')){
        this.device_pass = await bcrypt.hash(this.device_pass , 10);
    }
    next();
})



module.exports = mongoose.model('Device', deviceSchema);
