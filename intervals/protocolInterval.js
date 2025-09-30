const Telemetry = require('../models/Telemetry')

class ProtocolInterval {
    constructor(interval_time, device_uuid, data_range, socket) {
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
            const telemetry = await Telemetry.aggregate([

                { $match: { device_uuid: this.device_uuid } },    
                {
                    $group: {
                        _id: { channel_id: "$channel_id", phase: "$phase" },
                        latest: { $first: "$$ROOT" }
                    }
                },
    
                { $replaceRoot: { newRoot: "$latest" } },
    
                { $sort: { channel_id: 1, phase: 1 } }
            ]);
    
            return telemetry;
        } catch (error) {
            console.error("Error fetching telemetry data:", error);
            return [];
        }
    }
    

    async interval() {
        console.log('interval runs')
        if (this.isRunning) return; 
        this.isRunning = true;

        try {
            const telemetry = await this.getTelemetryData();
            if (telemetry && this.socket?.connected) {
                this.socket.emit('mqtt_protocol', { telemetry });
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