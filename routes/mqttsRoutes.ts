const express = require('express');
const router = express.Router();
const mqttsController = require('../controllers/mqttsController');


router.get('/:device_uuid', (req, res) => {
    mqttsController.getSingleMqttsByDeviceUuid(req, res);
});

router.put('/:device_uuid', (req, res) => {
    mqttsController.updateMqttsByDeviceUuid(req, res);
});

module.exports = router;
