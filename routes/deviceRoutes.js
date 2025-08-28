const express = require('express');
const router = express.Router();
const mqttClient = require('../connect');

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

    const topic = `msm/${deviceId}/reboot`;
    const message = JSON.stringify({
      device_uuid: deviceId,
      data: [{
        command: true
      }]
    });

    // Publish the reboot command
    mqttClient.publish(topic, message, { qos: 1 }, (err) => {
      if (err) {
        console.error('Error publishing message:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to send reboot command',
          error: err.message 
        });
      }
      
      console.log(`Reboot command sent to device: ${deviceId}`);
      res.json({ 
        success: true, 
        message: 'Reboot command sent successfully',
        deviceId,
        topic
      });
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

module.exports = router;
