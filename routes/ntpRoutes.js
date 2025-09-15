const express = require('express');
const router = express.Router();
const ntpController = require('../controllers/ntpController');

router.get('/', (req, res) => {
    ntpController.getAllNtp(req, res);
});

router.get('/device/:device_uuid', (req, res) => {
    ntpController.getSingleNtpByDeviceUuid(req, res);
});

router.get('/:id', (req, res) => {
    ntpController.getSingleNtp(req, res);
});

router.post('/', (req, res) => {
    ntpController.createNtp(req, res);
});

router.delete('/:id', (req, res) => {
    ntpController.deleteNtp(req, res);
});

router.put('/:id', (req, res) => {
    ntpController.updateNtp(req, res);
});

module.exports = router;
