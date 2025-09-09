const express = require('express');
const router = express.Router();
const mqttController = require('../controllers/mqttController');

router.get('/', (req, res) => {
    mqttController.getAllMqtt(req, res);
});

router.get('/device/:device_uuid', (req, res) => {
    mqttController.getSingleMqttByDeviceUuid(req, res);
});

router.get('/:id', (req, res) => {
    mqttController.getSingleMqtt(req, res);
});


router.post('/', (req, res) => {
    mqttController.createMqtt(req, res);
});

router.delete('/:id', (req, res) => {
    mqttController.deleteMqtt(req, res);
});

router.put('/:id', (req, res) => {
    mqttController.updateMqtt(req, res);
});

module.exports = router;
