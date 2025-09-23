const awsIot = require('aws-iot-device-sdk');
const path = require('path');
const Telemetry = require('./models/Telemetry');
const Device = require('./models/Device');
const Mqtt = require('./models/Mqtt');
const Ntp = require('./models/Ntp');
const Sftp = require('./models/Sftp');
const Dashboard = require('./models/Dashboard');
const socketService = require('./sockets/socket');
const DeviceIntervals = require('./intervals/intervals');
const Protocol = require('./models/Protocol');

class FleetConnect {
    constructor() {
        this.device = null;
        this.clientId = 'msm-backend-1234';
        // this.clientId = 'ESP90000005';

        // ===== MQTT TOPICS CONFIGURATION =====
        this.topics = [
            'msm/+/telemetry',    // Device → Cloud: High-frequency telemetry data
            'msm/+/reboot',       // Cloud ↔ Device: Reboot commands and status
            'msm/+/device_info',  // Device → Cloud: Device information
            'msm/+/ntp',          // Cloud ↔ Device: NTP server configuration
            'msm/+/mqtt',         // Cloud ↔ Device: MQTT broker credentials
            'msm/+/sftp',         // Cloud ↔ Device: SFTP server credentials
            'msm/+/protocols',    // Cloud ↔ Device: Protocols configuration

            // Shadow topics
            '$aws/things/+/shadow/update',

            // Aws mqtt topics
            '$aws/events/presence/#',

        ];

        this.connectedDevices = new Map();  // Track connected devices
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
                new DeviceIntervals(this.device)
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
                    let deviceUuid = this.extractDeviceUuid(topic);
                    const topicType = this.getTopicType(topic);

                    // console.log(`📨 [${topicType.toUpperCase()}] Message from ${deviceUuid}:`, message);

                    // Route message to appropriate handler
                    switch (topicType) {
                        case 'telemetry':
                            await this.handleTelemetryMessage(message, deviceUuid);
                            this.updateShadow(deviceUuid, message, topicType);
                            break;
                        case 'reboot':
                            await this.handleRebootMessage(message, deviceUuid);
                            this.updateShadow(deviceUuid, message, topicType);
                            break;
                        case 'device_info':
                            await this.handleDeviceInfoMessage(message, deviceUuid);
                            this.updateShadow(deviceUuid, message, topicType);
                            break;
                        case 'ntp':
                            await this.handleNtpMessage(message, deviceUuid);
                            this.updateShadow(deviceUuid, message, topicType);
                            break;
                        case 'mqtt':
                            await this.handleMqttMessage(message, deviceUuid);
                            this.updateShadow(deviceUuid, message, topicType);
                            break;
                        case 'sftp':
                            await this.handleSftpMessage(message, deviceUuid);
                            this.updateShadow(deviceUuid, message, topicType);
                            break;
                        case 'protocols':
                            await this.handleProtocolsMessage(message, deviceUuid);
                            this.updateShadow(deviceUuid, message, topicType);
                            break;
                        case 'presence':
                            deviceUuid = topic.split('/').pop();
                            await this.handlePresenceMessage(message, deviceUuid);
                            break;
                        default:
                        // console.warn(`⚠️  Unknown topic type: ${topicType}`);
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

    async updateShadow(deviceUuid, message, topicType) {
        try {
            // console.log(`Updating shadow for ${deviceUuid}:`, message);

            // Construct shadow topic
            const shadowTopic = `$aws/things/${deviceUuid}/shadow/update`;

            // Construct shadow payload
            const shadowPayload = {
                state: {
                    reported: {
                        [topicType]: message // you can pick specific fields if needed
                    }
                }
            };

            // Publish to shadow
            this.device.publish(
                shadowTopic,
                JSON.stringify(shadowPayload),
                { qos: 1 },
                (err) => {
                    if (err) {
                        console.error(`❌ Failed to update shadow for ${deviceUuid}:`, err);
                    } else {
                        // console.log(`✅ Shadow updated for ${deviceUuid}`);
                    }
                }
            );

        } catch (error) {
            console.error(`❌ Error updating shadow for ${deviceUuid}:`, error);
        }
    }

    async handlePresenceMessage(message, deviceUuid) {
        try {

            const { eventType, ipAddress, clientId } = message;

            console.log(`Presence message from ${clientId}:`, message);

            // mqtt_status will be true if connected, false otherwise
            const mqttStatus = eventType === "connected";

            // update device in DB
            const updatedDevice = await Device.findOneAndUpdate(
                { device_uuid: clientId }, // find device by UUID
                {
                    mqtt_status: mqttStatus,
                    device_ip: ipAddress // optional: also update latest IP
                },
                { new: true } // return updated document
            );

            if (updatedDevice) {
                console.log(`✅ Device ${clientId} updated. MQTT status: ${mqttStatus}`);
            } else {
                console.log(`⚠️ Device ${clientId} not found in DB`);
            }
        } catch (error) {
            console.error("❌ Error processing presence message:", error);
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

                        // Avg Power
                        avg_power_factor: phaseData.avg_power?.factor,
                        avg_active_power: phaseData.avg_power?.active,
                        avg_reactive_power: phaseData.avg_power?.reactive,
                        avg_apparent_power: phaseData.avg_power?.apparent,

                        // Avg Energy - active
                        avg_active_energy_positive: phaseData.avg_energy?.active?.positive,
                        avg_active_energy_negative: phaseData.avg_energy?.active?.negative,

                        // Avg Energy - reactive
                        avg_reactive_energy_positive: phaseData.avg_energy?.reactive?.positive,
                        avg_reactive_energy_negative: phaseData.avg_energy?.reactive?.negative,
                    };

                    // Save to database
                    const telemetry = new Telemetry(telemetryData);
                    await telemetry.save();
                    socketService.emitToClients('telemetry', { data: telemetryData });
                    const eventName = `telemetry:${deviceUuid}:channel:${channel.ID}`;
                    socketService.emitToClients(eventName, { data: telemetryData });
                    // console.log(`✅ Telemetry saved: ${deviceUuid}, channel ${channel.ID}, phase ${phase}`);
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
                device_pass: deviceInfo.device_pass,
                device_ip: deviceInfo.device_ip,
                mqtt_status: deviceInfo.mqtt_status,
                sftp_status: deviceInfo.sftp_status
            });

        } catch (error) {
            console.error(`❌ Error handling device info from ${deviceUuid}:`, error);
        }
    }

    // ===== PROTOCOLS HANDLER =====
    async handleProtocolsMessage(message, deviceUuid) {
        try {
            console.log(`� Protocols message from ${deviceUuid}:`, message);

            // Create protocol data object matching the Protocol model schema
            const protocolData = {
                // Main fields from the message root
                date: message.date,
                time: message.time,
                ip_address: message.ip_address,
                ofp_uid: message.ofp_uid,

                // All measurement data from message.data object
                V_R: message.data?.V_R,
                In1_R1: message.data?.In1_R1,
                In1_RPF: message.data?.In1_RPF,
                V_Y: message.data?.V_Y,
                In1_Y1: message.data?.In1_Y1,
                In1_YPF: message.data?.In1_YPF,
                V_B: message.data?.V_B,
                In1_B1: message.data?.In1_B1,
                In1_BPF: message.data?.In1_BPF,
                P1_R: message.data?.P1_R,
                P1_B: message.data?.P1_B,
                P1_Y: message.data?.P1_Y,
                P1: message.data?.P1,
                Q1_R: message.data?.Q1_R,
                Q1_B: message.data?.Q1_B,
                Q1_Y: message.data?.Q1_Y,
                Q1: message.data?.Q1,
                S1_R: message.data?.S1_R,
                S1_B: message.data?.S1_B,
                S1_Y: message.data?.S1_Y,
                S1: message.data?.S1,
                Epimp1: message.data?.Epimp1,
                Epexp1: message.data?.Epexp1,
                Eqimp1: message.data?.Eqimp1,
                Eqexp1: message.data?.Eqexp1,

                // F1 series
                F1_R: message.data?.F1_R,
                PF_R1: message.data?.PF_R1,
                F1_Y: message.data?.F1_Y,
                PF_Y1: message.data?.PF_Y1,
                F1_B: message.data?.F1_B,
                PF_B1: message.data?.PF_B1,
                F1_P: message.data?.F1_P,
                F1_Q: message.data?.F1_Q,
                F1_S: message.data?.F1_S,
                F1_Epimp: message.data?.F1_Epimp,
                F1_Epexp: message.data?.F1_Epexp,
                F1_Eqimp: message.data?.F1_Eqimp,
                F1_Eqexp: message.data?.F1_Eqexp,

                // F2 series
                F2_R: message.data?.F2_R,
                PF_R2: message.data?.PF_R2,
                F2_Y: message.data?.F2_Y,
                PF_Y2: message.data?.PF_Y2,
                F2_B: message.data?.F2_B,
                PF_B2: message.data?.PF_B2,
                F2_P: message.data?.F2_P,
                F2_Q: message.data?.F2_Q,
                F2_S: message.data?.F2_S,
                F2_Epimp: message.data?.F2_Epimp,
                F2_Epexp: message.data?.F2_Epexp,
                F2_Eqimp: message.data?.F2_Eqimp,
                F2_Eqexp: message.data?.F2_Eqexp,

                // F3 series
                F3_R: message.data?.F3_R,
                PF_R3: message.data?.PF_R3,
                F3_Y: message.data?.F3_Y,
                PF_Y3: message.data?.PF_Y3,
                F3_B: message.data?.F3_B,
                PF_B3: message.data?.PF_B3,
                F3_P: message.data?.F3_P,
                F3_Q: message.data?.F3_Q,
                F3_S: message.data?.F3_S,
                F3_Epimp: message.data?.F3_Epimp,
                F3_Epexp: message.data?.F3_Epexp,
                F3_Eqimp: message.data?.F3_Eqimp,
                F3_Eqexp: message.data?.F3_Eqexp,

                // F4 series
                F4_R: message.data?.F4_R,
                PF_R4: message.data?.PF_R4,
                F4_Y: message.data?.F4_Y,
                PF_Y4: message.data?.PF_Y4,
                F4_B: message.data?.F4_B,
                PF_B4: message.data?.PF_B4,
                F4_P: message.data?.F4_P,
                F4_Q: message.data?.F4_Q,
                F4_S: message.data?.F4_S,
                F4_Epimp: message.data?.F4_Epimp,
                F4_Epexp: message.data?.F4_Epexp,
                F4_Eqimp: message.data?.F4_Eqimp,
                F4_Eqexp: message.data?.F4_Eqexp,

                // F5 series
                F5_R: message.data?.F5_R,
                PF_R5: message.data?.PF_R5,
                F5_Y: message.data?.F5_Y,
                PF_Y5: message.data?.PF_Y5,
                F5_B: message.data?.F5_B,
                PF_B5: message.data?.PF_B5,
                F5_P: message.data?.F5_P,
                F5_Q: message.data?.F5_Q,
                F5_S: message.data?.F5_S,
                F5_Epimp: message.data?.F5_Epimp,
                F5_Epexp: message.data?.F5_Epexp,
                F5_Eqimp: message.data?.F5_Eqimp,
                F5_Eqexp: message.data?.F5_Eqexp,

                // F6 series
                F6_R: message.data?.F6_R,
                PF_R6: message.data?.PF_R6,
                F6_Y: message.data?.F6_Y,
                PF_Y6: message.data?.PF_Y6,
                F6_B: message.data?.F6_B,
                PF_B6: message.data?.PF_B6,
                F6_P: message.data?.F6_P,
                F6_Q: message.data?.F6_Q,
                F6_S: message.data?.F6_S,
                F6_Epimp: message.data?.F6_Epimp,
                F6_Epexp: message.data?.F6_Epexp,
                F6_Eqimp: message.data?.F6_Eqimp,
                F6_Eqexp: message.data?.F6_Eqexp,

                // F7 series
                F7_R: message.data?.F7_R,
                PF_R7: message.data?.PF_R7,
                F7_Y: message.data?.F7_Y,
                PF_Y7: message.data?.PF_Y7,
                F7_B: message.data?.F7_B,
                PF_B7: message.data?.PF_B7,
                F7_P: message.data?.F7_P,
                F7_Q: message.data?.F7_Q,
                F7_S: message.data?.F7_S,
                F7_Epimp: message.data?.F7_Epimp,
                F7_Epexp: message.data?.F7_Epexp,
                F7_Eqimp: message.data?.F7_Eqimp,
                F7_Eqexp: message.data?.F7_Eqexp,

                // F8 series
                F8_R: message.data?.F8_R,
                PF_R8: message.data?.PF_R8,
                F8_Y: message.data?.F8_Y,
                PF_Y8: message.data?.PF_Y8,
                F8_B: message.data?.F8_B,
                PF_B8: message.data?.PF_B8,
                F8_P: message.data?.F8_P,
                F8_Q: message.data?.F8_Q,
                F8_S: message.data?.F8_S,
                F8_Epimp: message.data?.F8_Epimp,
                F8_Epexp: message.data?.F8_Epexp,
                F8_Eqimp: message.data?.F8_Eqimp,
                F8_Eqexp: message.data?.F8_Eqexp
            };

            // Save to database
            const protocol = await Protocol.findOneAndUpdate({ ofp_uid: deviceUuid }, protocolData, { new: true, upsert: true });

            // Emit socket event for real-time updates
            socketService.emitToClients('protocols', { data: protocol });
            const eventName = `protocols:${deviceUuid}`;
            socketService.emitToClients(eventName, { data: protocol });

            console.log(`✅ Protocols data saved for device: ${deviceUuid}`);

        } catch (error) {
            console.error(`❌ Error handling protocols info from ${deviceUuid}:`, error);
        }
    }

    // ===== NTP HANDLER =====
    async handleNtpMessage(message, deviceUuid) {
        try {
            console.log(`🕐 NTP message from ${deviceUuid}:`, message.data);

            // This could be a confirmation of NTP configuration
            const ntpData = message.data[0];

            this.updateNtpConfig(deviceUuid, ntpData);

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

            this.updateMqttConfig(deviceUuid, mqttData);

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

            this.updateSftpConfig(deviceUuid, sftpData);

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

    async updateNtpConfig(deviceUuid, ntpData) {
        try {
            console.log(`🕐 NTP config updated for ${deviceUuid}:`, ntpData);

            await Ntp.findOneAndUpdate(
                { device_uuid: deviceUuid },
                ntpData,
                { upsert: true, new: true }
            );

            console.log(`✅ NTP config saved to database: ${deviceUuid}`);
        } catch (error) {
            console.error(`❌ Error saving NTP config for ${deviceUuid}:`, error);
        }
    }

    async updateMqttConfig(deviceUuid, mqttData) {
        try {
            console.log(`📡 MQTT config updated for ${deviceUuid}:`, mqttData);

            await Mqtt.findOneAndUpdate(
                { device_uuid: deviceUuid },
                mqttData,
                { upsert: true, new: true }
            );

            console.log(`✅ MQTT config saved to database: ${deviceUuid}`);
        } catch (error) {
            console.error(`❌ Error saving MQTT config for ${deviceUuid}:`, error);
        }
    }

    async updateSftpConfig(deviceUuid, sftpData) {
        try {
            console.log(`📁 SFTP config updated for ${deviceUuid}:`, sftpData);

            await Sftp.findOneAndUpdate(
                { device_uuid: deviceUuid },
                sftpData,
                { upsert: true, new: true }
            );

            console.log(`✅ SFTP config saved to database: ${deviceUuid}`);
        } catch (error) {
            console.error(`❌ Error saving SFTP config for ${deviceUuid}:`, error);
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
                device_pass: info.device_pass,
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

            const existingDashboard = await Dashboard.findOne({ device_id: deviceUuid });

            if (!existingDashboard) {
                const dashboardData = {
                    title: `Dashboard for ${deviceUuid}`,
                    description: `Auto-generated dashboard for device ${deviceUuid}`,
                    owner: 'system',
                    device_id: deviceUuid,
                    groups: [],
                    mobile_application_setting: false,
                    dashboard_order_in_mobile_application: 0
                };

                const dashboard = new Dashboard(dashboardData);
                await dashboard.save();

                console.log(`✅ Dashboard automatically created for device: ${deviceUuid}`);
            }

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