const Configration = require('./models/Configration');
const { createNotification } = require('./controllers/notificationController');

// ===== VOLTAGE UNBALANCE CHECKER =====
const checkVoltageUnbalance = async (deviceUuid, telemetryData) => {
        try {
            // Get device configuration for voltage unbalance threshold
            const config = await Configration.findOne({ device_uuid: deviceUuid });
            
            if (!config) {
                console.warn(`⚠️  No configuration found for device ${deviceUuid}`);
                return;
            }

            const threshold = config.voltage_unbalance;
            if (!threshold) {
                console.warn(`⚠️  No voltage unbalance threshold set for device ${deviceUuid}`);
                return;
            }

            // Apply 2% more than configured threshold
            const adjustedThreshold = threshold * 1.02;

            // Group telemetry data by channel to calculate voltage unbalance per channel
            
            telemetryData.forEach(data => {
                if(data.line_voltage){
                    if(data.line_voltage > adjustedThreshold){
                        console.log(`line voltage greater for device ${deviceUuid} and channel ${data.channel_id}`)
                        createNotification(
                            deviceUuid, 
                            `Line Voltage Alert: Channel ${data.channel_id} has ${data.line_voltage.toFixed(2)}V (threshold: ${adjustedThreshold.toFixed(2)}V)`
                        );
                    }
                }

                if(data.rms_voltage){
                    if(data.rms_voltage > adjustedThreshold){
                        console.log(`rms voltage greater for device ${deviceUuid} and channel ${data.channel_id}`)
                        createNotification(
                            deviceUuid, 
                            `RMS Voltage Alert: Channel ${data.channel_id} has ${data.rms_voltage.toFixed(2)}V (threshold: ${adjustedThreshold.toFixed(2)}V)`
                        );
                    }
                }

            });

        } catch (error) {
            console.error(`❌ Error checking voltage unbalance for ${deviceUuid}:`, error);
        }
    }

module.exports = { checkVoltageUnbalance };
