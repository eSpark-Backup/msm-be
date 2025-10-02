const Telemetry = require('../models/Telemetry')
const { mapProtocols } = require('../utils/mapProtocol')

class ProtocolInterval {
    constructor(interval_time = 5000, device_uuid, data_range, socket) {
        this.interval_time = interval_time;
        this.device_uuid = device_uuid;
        this.data_range = data_range;
        this.socket = socket;
        this.intervalId = null;
        this.isRunning = false;

        this.init();
    }
    
    async init() {
        console.log(`Starting interval for device ${this.device_uuid} every ${this.interval_time}ms`);
        await Telemetry.syncIndexes();

        this.intervalId = setInterval(() => {
            this.interval().catch(console.error);
        }, this.interval_time);
    }

    async getTelemetryData() {
        try {
            const now = new Date();
            const fromTime = new Date(now.getTime() - 30 * 60 * 1000);


            const telemetry = await Telemetry.aggregate([
                { $match: { 
                    device_uuid: this.device_uuid,
                    createdAt: { $gte: fromTime, $lte: now }   

                 }},
    
                {
                    $group: {
                        _id: { channel_id: "$channel_id", phase: "$phase" },
                        latest: {
                            $topN: {
                                output: "$$ROOT",   
                                sortBy: { createdAt: -1 },
                                n: 1                   
                            }
                        }
                    }
                },
    
                { $unwind: "$latest" },               
                { $replaceRoot: { newRoot: "$latest" } },

                {
                    $lookup: {
                        from: "devices",
                        localField: "device_uuid",
                        foreignField: "device_uuid",
                        as: "deviceInfo"
                    }
                },
    
                { $sort: { channel_id: 1, phase: 1 } }
            ]).allowDiskUse(true);
    
            return telemetry;
        } catch (error) {
            console.error("Error fetching telemetry data:", error);
            return [];
        }
    }
    
    

    async interval() {
        console.log('interval runs' , this.isRunning);
        if (this.isRunning) return; 
        this.isRunning = true;

        try {
            const telemetry = await this.getTelemetryData();
            if (telemetry && telemetry.length > 0 && this.socket?.connected) {
                const mappedData = await mapProtocols(telemetry);
                this.socket.emit('mqtt_protocol', mappedData);
                console.log(`Interval ran for device ${this.device_uuid}`);
            }
        } catch (error) {
            console.error('Error in interval:', error);
        } finally {
            this.isRunning = false;
        }
    }

    cleanup() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}
module.exports = ProtocolInterval