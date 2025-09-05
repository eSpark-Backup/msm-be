const awsIot = require('aws-iot-device-sdk');
const path = require('path');
const Telemetry = require('./models/Telemetry');
const Device = require('./models/Device');

class FleetConnect {
    constructor() {
        this.device = null;
        this.clientId = 'msm-backend-123';
        
        // ===== MQTT TOPICS CONFIGURATION =====
        this.topics = [
            'msm/+/telemetry',    // Device → Cloud: High-frequency telemetry data
            'msm/+/reboot',       // Cloud ↔ Device: Reboot commands and status
            'msm/+/device_info',  // Device → Cloud: Device information
            'msm/+/ntp',          // Cloud ↔ Device: NTP server configuration
            'msm/+/mqtt',         // Cloud ↔ Device: MQTT broker credentials
            'msm/+/sftp'          // Cloud ↔ Device: SFTP server credentials
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
                caPath: path.join(__dirname, './things/AmazonRootCA1.pem'),
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

            // ===== MESSAGE ROUTER =====
            this.device.on('message', async (topic, payload) => {
                try {
                    const message = JSON.parse(payload.toString());
                    const deviceUuid = this.extractDeviceUuid(topic);
                    const topicType = this.getTopicType(topic);
                    
                    console.log(`📨 [${topicType.toUpperCase()}] Message from ${deviceUuid}:`, message);
                    
                    // Route message to appropriate handler
                    switch (topicType) {
                        case 'telemetry':
                            await this.handleTelemetryMessage(message, deviceUuid);
                            break;
                        case 'reboot':
                            await this.handleRebootMessage(message, deviceUuid);
                            break;
                        case 'device_info':
                            await this.handleDeviceInfoMessage(message, deviceUuid);
                            break;
                        case 'ntp':
                            await this.handleNtpMessage(message, deviceUuid);
                            break;
                        case 'mqtt':
                            await this.handleMqttMessage(message, deviceUuid);
                            break;
                        case 'sftp':
                            await this.handleSftpMessage(message, deviceUuid);
                            break;
                        default:
                            console.warn(`⚠️  Unknown topic type: ${topicType}`);
                    }
                } catch (error) {
                    console.error('❌ Error processing message:', error);
                }
            });

        } catch (error) {
            console.error('❌ Failed to initialize MQTT client:', error);
            throw error;
        }
    }

    // ===== UTILITY METHODS =====
    extractDeviceUuid(topic) {
        const parts = topic.split('/');
        return parts[1]; // msm/{device_uuid}/topic_type
    }
    
    getTopicType(topic) {
        const parts = topic.split('/');
        return parts[2]; // msm/{device_uuid}/topic_type
    }
    
    // ===== TELEMETRY HANDLER =====
    async handleTelemetryMessage(message, deviceUuid) {
        try {
            if (!message.channels || message.channels.length === 0) {
                console.warn(`⚠️  No channels in telemetry message from ${deviceUuid}`);
                return;
            }
            
            const channel = message.channels[0];
            
            // Process each phase in the channel data
            for (const [phaseKey, phaseData] of Object.entries(channel.data || {})) {
                if (!phaseKey.startsWith('phase_')) continue;
                const phase = phaseKey.split('_')[1]; // Extract 'a', 'b', or 'c'
                
                if (phaseData) {
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
                    console.log(`✅ Telemetry saved: ${deviceUuid}, channel ${channel.ID}, phase ${phase}`);
                }
            }
        } catch (error) {
            console.error(`❌ Error handling telemetry from ${deviceUuid}:`, error);
        }
    }
    
    // ===== REBOOT HANDLER =====
    async handleRebootMessage(message, deviceUuid) {
        try {
            console.log(`🔄 Reboot message from ${deviceUuid}:`, message.data);
            
            // Store reboot status/response in database or handle accordingly
            // This could be a response to a reboot command or a reboot notification
            
            // Update device status
            this.updateDeviceStatus(deviceUuid, 'reboot_received', message.data);
            
        } catch (error) {
            console.error(`❌ Error handling reboot message from ${deviceUuid}:`, error);
        }
    }
    
    // ===== DEVICE INFO HANDLER =====
    async handleDeviceInfoMessage(message, deviceUuid) {
        try {
            console.log(`📱 Device info from ${deviceUuid}:`, message.data);
            
            const deviceInfo = message.data[0];
            
            // Update device information in database
            this.updateDeviceInfo(deviceUuid, {
                device_imei: deviceInfo.device_imei,
                device_ip: deviceInfo.device_ip,
                mqtt_status: deviceInfo.mqtt_status,
                sftp_status: deviceInfo.sftp_status,
                last_seen: new Date()
            });
            
        } catch (error) {
            console.error(`❌ Error handling device info from ${deviceUuid}:`, error);
        }
    }
    
    // ===== NTP HANDLER =====
    async handleNtpMessage(message, deviceUuid) {
        try {
            console.log(`🕐 NTP message from ${deviceUuid}:`, message.data);
            
            // This could be a confirmation of NTP configuration
            const ntpData = message.data[0];
            
            // Store NTP configuration status
            this.updateDeviceConfig(deviceUuid, 'ntp', ntpData);
            
        } catch (error) {
            console.error(`❌ Error handling NTP message from ${deviceUuid}:`, error);
        }
    }
    
    // ===== MQTT HANDLER =====
    async handleMqttMessage(message, deviceUuid) {
        try {
            console.log(`📡 MQTT config message from ${deviceUuid}:`, message.data);
            
            // This could be a confirmation of MQTT configuration
            const mqttData = message.data[0];
            
            // Store MQTT configuration status
            this.updateDeviceConfig(deviceUuid, 'mqtt', mqttData);
            
        } catch (error) {
            console.error(`❌ Error handling MQTT message from ${deviceUuid}:`, error);
        }
    }
    
    // ===== SFTP HANDLER =====
    async handleSftpMessage(message, deviceUuid) {
        try {
            console.log(`📁 SFTP config message from ${deviceUuid}:`, message.data);
            
            // This could be a confirmation of SFTP configuration
            const sftpData = message.data[0];
            
            // Store SFTP configuration status
            this.updateDeviceConfig(deviceUuid, 'sftp', sftpData);
            
        } catch (error) {
            console.error(`❌ Error handling SFTP message from ${deviceUuid}:`, error);
        }
    }
    
    // ===== COMMAND PUBLISHING METHODS =====
    
    // Send reboot command to device
    sendRebootCommand(deviceUuid) {
        const topic = `msm/${deviceUuid}/reboot`;
        const message = {
            device_uuid: deviceUuid,
            data: [{
                command: true
            }]
        };
        
        this.publishMessage(topic, message);
        console.log(`🔄 Reboot command sent to ${deviceUuid}`);
    }
    
    // Send NTP configuration to device
    sendNtpConfig(deviceUuid, ntpServers) {
        const topic = `msm/${deviceUuid}/ntp`;
        const message = {
            device_uuid: deviceUuid,
            data: [ntpServers]
        };
        
        this.publishMessage(topic, message);
        console.log(`🕐 NTP config sent to ${deviceUuid}`);
    }
    
    // Send MQTT configuration to device
    sendMqttConfig(deviceUuid, mqttConfig) {
        const topic = `msm/${deviceUuid}/mqtt`;
        const message = {
            device_uuid: deviceUuid,
            data: [mqttConfig]
        };
        
        this.publishMessage(topic, message);
        console.log(`📡 MQTT config sent to ${deviceUuid}`);
    }
    
    // Send SFTP configuration to device
    sendSftpConfig(deviceUuid, sftpConfig) {
        const topic = `msm/${deviceUuid}/sftp`;
        const message = {
            device_uuid: deviceUuid,
            data: [sftpConfig]
        };
        
        this.publishMessage(topic, message);
        console.log(`📁 SFTP config sent to ${deviceUuid}`);
    }
    
    // ===== HELPER METHODS =====
    
    publishMessage(topic, message) {
        if (this.device) {
            this.device.publish(topic, JSON.stringify(message));
        } else {
            console.error('❌ MQTT device not connected');
        }
    }
    
    async updateDeviceStatus(deviceUuid, status, data) {
        try {
            console.log(`📊 Device ${deviceUuid} status updated: ${status}`, data);
            
            const updateData = {
                last_seen: new Date(),
                connection_status: 'online'
            };
            
            if (status === 'reboot_received') {
                updateData.$push = {
                    reboot_history: {
                        timestamp: new Date(),
                        status: 'acknowledged',
                        response_data: data
                    }
                };
            }
            
            await Device.findOneAndUpdate(
                { device_uuid: deviceUuid },
                updateData,
                { upsert: true, new: true }
            );
            
            console.log(`✅ Device status saved to database: ${deviceUuid}`);
        } catch (error) {
            console.error(`❌ Error saving device status for ${deviceUuid}:`, error);
        }
    }
    
    async updateDeviceInfo(deviceUuid, info) {
        try {
            console.log(`📱 Device ${deviceUuid} info updated:`, info);
            
            const updateData = {
                device_uuid: deviceUuid,
                device_imei: info.device_imei,
                device_ip: info.device_ip,
                mqtt_status: info.mqtt_status,
                sftp_status: info.sftp_status,
                last_seen: info.last_seen || new Date(),
                connection_status: 'online'
            };
            
            const device = await Device.findOneAndUpdate(
                { device_uuid: deviceUuid },
                updateData,
                { upsert: true, new: true }
            );
            
            console.log(`✅ Device info saved to database: ${deviceUuid}`);
            return device;
        } catch (error) {
            console.error(`❌ Error saving device info for ${deviceUuid}:`, error);
            throw error;
        }
    }
    
    async updateDeviceConfig(deviceUuid, configType, config) {
        try {
            console.log(`⚙️  Device ${deviceUuid} ${configType} config updated:`, config);
            
            const updateData = {
                last_seen: new Date(),
                connection_status: 'online'
            };
            
            // Update specific config based on type
            switch (configType) {
                case 'ntp':
                    updateData.ntp_config = {
                        ...config,
                        last_updated: new Date()
                    };
                    break;
                case 'mqtt':
                    updateData.mqtt_config = {
                        ...config,
                        last_updated: new Date()
                    };
                    break;
                case 'sftp':
                    updateData.sftp_config = {
                        ...config,
                        last_updated: new Date()
                    };
                    break;
            }
            
            await Device.findOneAndUpdate(
                { device_uuid: deviceUuid },
                updateData,
                { upsert: true, new: true }
            );
            
            console.log(`✅ Device ${configType} config saved to database: ${deviceUuid}`);
        } catch (error) {
            console.error(`❌ Error saving device ${configType} config for ${deviceUuid}:`, error);
        }
    }
    
    // ===== CONNECTION MANAGEMENT =====
    
    disconnect() {
        if (this.device) {
            console.log('🔌 Disconnecting from AWS IoT...');
            this.device.end();
        }
    }

}

const mqttClient = new FleetConnect();
module.exports = mqttClient;