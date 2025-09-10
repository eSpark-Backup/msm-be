const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');

// ===== DEVICE REBOOT API =====
/**
 * @route POST /api/devices/:deviceId/reboot
 * @description Send reboot command to a device
 * @access Public
 */
router.post('/:deviceId/reboot', deviceController.rebootDevice);

router.get('/:deviceId', deviceController.getDeviceById);

router.get('/', deviceController.getAllDevices);


module.exports = router;
