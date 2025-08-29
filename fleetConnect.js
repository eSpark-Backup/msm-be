const awsIot = require('aws-iot-device-sdk');
const path = require('path');
const Telemetry = require('./models/Telemetry');

class FleetConnect {
    constructor() {
        this.device = null;
        this.clientId = 'msm-backend';
        this.topics = [
            'msm/+/telemetry'
        ];
        this.connectedDevices = new Map();  // Track connected devices
        this.connect();
    }

    connect() {
        console.log('Connecting to AWS IoT...');        
        try {
            this.device = awsIot.device({
                keyPath: path.join(__dirname, './things/ESP90000005/ESP90000005.private.key'),
                certPath: path.join(__dirname, './things/ESP90000005/ESP90000005.cert.pem'),
                caPath: path.join(__dirname, './things/AmazonRootCA1.pem.txt'),
                clientId: this.clientId,
                host: process.env.AWS_IOT_ENDPOINT,
                debug: true,
                protocol: 'mqtts',
                port: 8883,
                reconnectPeriod: 10000, // 10 seconds
                clean: true,
                keepalive: 30, // 30 seconds
                resubscribe: true
            });

            // Setup event handlers
            this.device.on('connect', () => {
                console.log('✅ Connected to AWS IoT Core');
            });

            this.device.subscribe(this.topics, (err, granted) => {
                if (err) {
                    console.error('Subscription error:', err);
                } else {
                    console.log('Subscribed to:', granted.map(g => g.topic));
                }
            });

            this.device.on('error', (error) => {
                console.error('❌ MQTT Error:', error);
                if (error.code) console.error('Error code:', error.code);
                if (error.stack) console.error(error.stack);
            });

            this.device.on('offline', () => {
                console.log('⚠️  Disconnected from AWS IoT');
            });

            this.device.on('close', () => {
                console.log('🔌 Connection closed');
            });

            this.device.on('reconnect', () => {
                console.log('🔄 Attempting to reconnect...');
            });

      this.device.on('message', async (topic, payload) => {
            try {
                const message = JSON.parse(payload.toString());
                console.log(`Received message on ${topic}:`, message);

                // Only process telemetry topics
                if (topic.endsWith('/telemetry') && message.channels && message.channels.length > 0) {
                    const channel = message.channels[0];
                    
                    // Process each phase in the channel data
                    for (const [phaseKey, phaseData] of Object.entries(channel.data || {})) {
                        if (!phaseKey.startsWith('phase_')) continue;
                        const phase = phaseKey.split('_')[1]; // Extract 'a', 'b', or 'c' from 'phase_a'
                        
                        if (phaseData) {
                            // Create a new telemetry document with flattened structure
                            const telemetryData = {
                            // Device and Channel Info
                            device_uuid: message.device_uuid,
                            timestamp: new Date(message.timestamp),
                            channel_id: channel.ID,
                            phase: phase,
                            channel_status: channel.status,
                            
                            // General measurements
                            temperature: channel.temperature,
                            line_voltage: phaseData.general?.line_voltage,
                            rms_voltage: phaseData.general?.rms_voltage,
                            frequency: phaseData.general?.frequency,
                            current: phaseData.general?.current,
                            
                            // Power measurements
                            power_factor: phaseData.power?.factor,
                            active_power: phaseData.power?.active,
                            reactive_power: phaseData.power?.reactive,
                            apparent_power: phaseData.power?.apparent,
                            
                            // Energy measurements - active
                            active_energy_positive: phaseData.energy?.active?.positive,
                            active_energy_negative: phaseData.energy?.active?.negative,
                            
                            // Energy measurements - reactive
                            reactive_energy_positive: phaseData.energy?.reactive?.positive,
                            reactive_energy_negative: phaseData.energy?.reactive?.negative,
                            
                            // System metadata
                            battery_level: message.battery_level,
                            signal_strength: message.signal_strength,
                            firmware_version: message.firmware_version,
                            
                            // Processing flags
                            processed: false
                        };

                            // Save to database
                            const telemetry = new Telemetry(telemetryData);
                            await telemetry.save();
                            console.log(`Telemetry saved for device ${message.device_uuid}, channel ${channel.ID}, phase ${phase}`);
                        }
                    }
                }
            } catch (error) {
                console.error('Error processing message:', error);
            }
        });

        } catch (error) {
            console.error('❌ Failed to initialize MQTT client:', error);
            throw error;
        }
    }

    disconnect() {
        if (this.device) {
            console.log('Disconnecting...');
            this.device.end();
        }
    }



}

const mqttClient = new FleetConnect();
module.exports = mqttClient;