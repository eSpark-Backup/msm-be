const mongoose = require('mongoose');
const { encrypt } = require('../utils/enryption');

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
    type: Boolean,
    default: false
  },
  device_status_updated_at: {
    type: Date,
    default: Date.now
  }
},
  {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
  }
);


deviceSchema.pre('save' , async function(next){
    if(this.isModified('device_pass')){
        this.device_pass = encrypt(this.device_pass);
    }
    next();
})

deviceSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();

  if (update.device_pass) {
    update.device_pass = encrypt(update.device_pass);
    this.setUpdate(update);
  }

  next();
});

deviceSchema.virtual('sftp' , {
    ref: 'SFTP',
    localField: 'device_uuid',
    foreignField: 'device_uuid'
})

deviceSchema.virtual('mqtt' , {
    ref: 'MQTT',
    localField: 'device_uuid',
    foreignField: 'device_uuid'
})

deviceSchema.virtual('ntp' , {
  ref : 'NTP',
  localField: 'device_uuid',
  foreignField: 'device_uuid'
})

deviceSchema.virtual('mqtts' , {
  ref : 'MqttS',
  localField: 'device_uuid',
  foreignField: 'device_uuid'
})

deviceSchema.virtual('ota' , {
  ref : 'OTA',
  localField: 'device_uuid',
  foreignField: 'device_uuid'
})



module.exports = mongoose.model('Device', deviceSchema);
