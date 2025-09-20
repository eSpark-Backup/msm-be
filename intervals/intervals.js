const Mqtt = require('../models/Mqtt');
const Device = require('../models/Device');
const socketService = require('../sockets/socket');

class DeviceIntervals {
    constructor(device) {
        this.clientDevice = device;
        this.devices = [];
        this.counter = 1;
        this.direction = 1;
        this.intervals = {};
        this.init()
    }

    async init() {
        await this.getDevices();
        for(const device of this.devices){
            this.interval(device);
        }
        this.watchIntervals();
    }

    async getDevices() {
        this.devices = await Device.find({})
    }

    async getSingleDevice(device_uuid){
        return await Device.findOne({ device_uuid })
    }

    async getInterval(device_uuid) {
        return await Mqtt.findOne({ device_uuid })
    }

    getNextValue() {
        const value = this.counter;

        this.counter += this.direction;

        if (this.counter >= 10) {
            this.direction = -1;
        } else if (this.counter <= 1) {
            this.direction = 1;
        }

        return value;
    }

    async watchIntervals(){
        socketService.on('mqtt_updated' , async (device_uuid) => {
            const device = await this.getSingleDevice(device_uuid)
            this.interval(device)
        })
    }


    async interval(device) {
        console.log('interval runs');
            const deviceInterval = await this.getInterval(device.device_uuid);
            if (!deviceInterval) return;

            const intervalSeconds = deviceInterval.data_interval;
            const topic = `msm/${device.device_uuid}/telemetry`;

            if (this.intervals[device.device_uuid]) {
                clearInterval(this.intervals[device.device_uuid])
            }

            this.intervals[device.device_uuid] = setInterval(() => {

                const value = this.getNextValue();

                const channel_one_data = this.getMockTelemetryData(device.device_uuid, 1, value)
                const channel_two_data = this.getMockTelemetryData(device.device_uuid, 2, value)
                const channel_three_data = this.getMockTelemetryData(device.device_uuid, 3, value)

                socketService.emitToClients('telemetry', channel_one_data)
                socketService.emitToClients('telemetry', channel_two_data)
                socketService.emitToClients('telemetry', channel_three_data)

                const channelOneEvent = `telemetry:${device.device_uuid}:channel:1`;
                const channelTwoEvent = `telemetry:${device.device_uuid}:channel:2`;
                const channelThreeEvent = `telemetry:${device.device_uuid}:channel:3`;

                socketService.emitToClients(channelOneEvent, { data: channel_one_data });
                socketService.emitToClients(channelTwoEvent, { data: channel_two_data });
                socketService.emitToClients(channelThreeEvent, { data: channel_three_data });

                this.clientDevice.publish(topic, JSON.stringify(channel_one_data))
                this.clientDevice.publish(topic, JSON.stringify(channel_two_data))
                this.clientDevice.publish(topic, JSON.stringify(channel_three_data))
            }, intervalSeconds * 1000);
    }

    getMockTelemetryData(device_uuid, channel_id, value) {

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