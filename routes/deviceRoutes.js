const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/deviceController');
const verifyToken = require('../middleware/verifyToken');
// ===== DEVICE REBOOT API =====
/**
 * @route POST /api/devices/:deviceId/reboot
 * @description Send reboot command to a device
 * @access Public
 */
router.post('/:deviceId/reboot', deviceController.rebootDevice);

router.get('/:deviceId', deviceController.getDeviceById);

router.get('/', deviceController.getAllDevices);

router.post("/user", verifyToken, deviceController.createDevice);

module.exports = router;
