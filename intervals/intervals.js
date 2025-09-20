const Mqtt = require('../models/Mqtt');
const Device = require('../models/Device');
const socketService = require('../sockets/socket');

class DeviceIntervals{
    constructor(device){
        this.clientDevice = device;
        this.devices = [];
        this.counter = 1;
        this.direction = 1;
        this.init()
    }

    async init(){
        await this.getDevices();
        this.interval();
    }

    async getDevices(){
        this.devices = await Device.find({})
    }

    async getInterval(device_uuid){
        return await Mqtt.findOne({device_uuid})
    }

    async interval(){
        for (const device of this.devices) {
            const deviceInterval = await this.getInterval(device.device_uuid);
            if (!deviceInterval) continue;
          
            const intervalSeconds = deviceInterval.data_interval || 10;
            const topic = `msm/${device.device_uuid}/telemetry`;
          
            setInterval(() => {
              const channel_one_data = this.getMockTelemetryData(device.device_uuid , 1)
              const channel_two_data = this.getMockTelemetryData(device.device_uuid , 2)
              const channel_three_data = this.getMockTelemetryData(device.device_uuid , 3)
          
              socketService.emit('telemetry' , channel_one_data)
              socketService.emit('telemetry' , channel_two_data)
              socketService.emit('telemetry' , channel_three_data)

              this.clientDevice.publish(topic , JSON.stringify(channel_one_data))
              this.clientDevice.publish(topic , JSON.stringify(channel_two_data))
              this.clientDevice.publish(topic , JSON.stringify(channel_three_data))
            }, intervalSeconds * 1000);
          }           
    }

    getMockTelemetryData(device_uuid , channel_id){

        const value = this.counter;

        this.counter += this.direction;

        if(this.counter >= 10){
            this.direction = -1;
        }else if(this.counter <= 1){
            this.direction = 1;
        }

        const data = {
            "timestamp": new Date().toISOString(),
            "device_uuid": device_uuid,
            "channels": [
              {
                "ID": channel_id,
                "status": true,
                "temperature": value,
                "data": {
                  "phase_a": {
                    "general": {	
                      "line_voltage": value,
                      "rms_voltage": value,
                      "frequency": value,
                      "current": value
                    },
                    "power": {
                      "factor": value,
                      "active": value,
                      "reactive": value,
                      "apparent": value
                    },
                    "energy": {
                      "active": {
                        "positive": value,
                        "negative": value
                      },
                      "reactive": {
                        "positive": value,
                        "negative": value
                      }
                    },
                    "avg_power": {
                      "factor": value,
                      "active": value,
                      "reactive": value,
                      "apparent": value
                    },
                    "avg_energy": {
                      "active": {
                        "positive": value,
                        "negative": value
                      },
                      "reactive": {
                        "positive": value,
                        "negative": value
                      }
                    }
                  },
                  "phase_b": {
                    "general": {
                      "line_voltage": value,
                      "rms_voltage": value,
                      "frequency": value,
                      "current": value
                   },
                    "power": {
                      "factor": value,
                      "active": value,
                      "reactive": value,
                      "apparent": value
                    },
                    "energy": {
                      "active": {
                        "positive": value,
                        "negative": value
                      },
                      "reactive": {
                        "positive": value,
                        "negative": value
                      }
                    },
                    "avg_power": {
                      "factor": value,
                      "active": value,
                      "reactive": value,
                      "apparent": value
                    },
                    "avg_energy": {
                      "active": {
                        "positive": value,
                        "negative": value
                      },
                      "reactive": {
                        "positive": value,
                        "negative": value
                      }
                    }
                  },
                  "phase_c": {
                    "general": {
                      "line_voltage": value,
                      "rms_voltage": value,
                      "frequency": value,
                      "current": value
                    },
                    "power": {
                      "factor": value,
                      "active": value,
                      "reactive": value,
                      "apparent": value
                    },
                    "energy": {
                      "active": {
                        "positive": value,
                        "negative": value
                      },
                      "reactive": {
                        "positive": value,
                        "negative": value
                      }
                    },
                    "avg_power": {
                      "factor": value,
                      "active": value,
                      "reactive": value,
                      "apparent": value
                    },
                    "avg_energy": {
                      "active": {
                        "positive": value,
                        "negative": value
                      },
                      "reactive": {
                        "positive": value,
                        "negative": value
                      }
                    }
                  }
                }
              }
            ]
          }

        return data
    }


}

module.exports = DeviceIntervals