const express = require('express');
const router = express.Router();
const mqttClient = require('../fleetConnect');

// ===== DEVICE REBOOT API =====
/**
 * @route POST /api/devices/:deviceId/reboot
 * @description Send reboot command to a device
 * @access Public
 */
router.post('/:deviceId/reboot', async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Device ID is required' });
    }

    // Use the FleetConnect method
    mqttClient.sendRebootCommand(deviceId);
    
    res.json({ 
      success: true, 
      message: 'Reboot command sent successfully',
      deviceId,
      topic: `msm/${deviceId}/reboot`
    });

  } catch (error) {
    console.error('Error in reboot endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// ===== NTP CONFIGURATION API =====
/**
 * @route POST /api/devices/:deviceId/ntp
 * @description Send NTP server configuration to a device
 * @access Public
 */
router.post('/:deviceId/ntp', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { server_1, server_2, server_3 } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Device ID is required' });
    }
    
    if (!server_1) {
      return res.status(400).json({ success: false, message: 'At least server_1 is required' });
    }

    const ntpConfig = {
      server_1,
      server_2: server_2 || '',
      server_3: server_3 || ''
    };

    mqttClient.sendNtpConfig(deviceId, ntpConfig);
    
    res.json({ 
      success: true, 
      message: 'NTP configuration sent successfully',
      deviceId,
      config: ntpConfig,
      topic: `msm/${deviceId}/ntp`
    });

  } catch (error) {
    console.error('Error in NTP config endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// ===== MQTT CONFIGURATION API =====
/**
 * @route POST /api/devices/:deviceId/mqtt
 * @description Send MQTT broker configuration to a device
 * @access Public
 */
router.post('/:deviceId/mqtt', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { broker_ip, broker_port, broker_user, broker_pass, data_interval, mqtt_topic } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Device ID is required' });
    }
    
    if (!broker_ip || !broker_port) {
      return res.status(400).json({ 
        success: false, 
        message: 'broker_ip and broker_port are required' 
      });
    }

    const mqttConfig = {
      broker_ip,
      broker_port: parseInt(broker_port),
      broker_user: broker_user || '',
      broker_pass: broker_pass || '',
      data_interval: data_interval || 900,
      mqtt_topic: mqtt_topic || 'v1/devices/me/telemetry'
    };

    mqttClient.sendMqttConfig(deviceId, mqttConfig);
    
    res.json({ 
      success: true, 
      message: 'MQTT configuration sent successfully',
      deviceId,
      config: mqttConfig,
      topic: `msm/${deviceId}/mqtt`
    });

  } catch (error) {
    console.error('Error in MQTT config endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// ===== SFTP CONFIGURATION API =====
/**
 * @route POST /api/devices/:deviceId/sftp
 * @description Send SFTP server configuration to a device
 * @access Public
 */
router.post('/:deviceId/sftp', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { server_ip, server_port, username, password, data_interval } = req.body;
    
    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Device ID is required' });
    }
    
    if (!server_ip || !username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'server_ip, username, and password are required' 
      });
    }

    const sftpConfig = {
      server_ip,
      server_port: server_port || 22,
      username,
      password,
      data_interval: data_interval || 900
    };

    mqttClient.sendSftpConfig(deviceId, sftpConfig);
    
    res.json({ 
      success: true, 
      message: 'SFTP configuration sent successfully',
      deviceId,
      config: sftpConfig,
      topic: `msm/${deviceId}/sftp`
    });

  } catch (error) {
    console.error('Error in SFTP config endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// ===== DEVICE STATUS API =====
/**
 * @route GET /api/devices/:deviceId/status
 * @description Get device status and last seen information
 * @access Public
 */
router.get('/:deviceId/status', async (req, res) => {
  try {
    const { deviceId } = req.params;
    
    if (!deviceId) {
      return res.status(400).json({ success: false, message: 'Device ID is required' });
    }

    // Get device status from connected devices map
    const deviceStatus = mqttClient.connectedDevices.get(deviceId) || {
      connected: false,
      last_seen: null,
      status: 'offline'
    };
    
    res.json({ 
      success: true, 
      deviceId,
      status: deviceStatus
    });

  } catch (error) {
    console.error('Error in device status endpoint:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

module.exports = router;
