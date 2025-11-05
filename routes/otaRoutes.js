const express = require('express');
const router = express.Router();
const otaController = require('../controllers/otaController');
const verifyToken = require('../middleware/verifyToken')


router.get('/:device_uuid', verifyToken, (req, res) => {
    otaController.getSingleOtaByDeviceUuid(req, res);
});

router.put('/:device_uuid', verifyToken, (req, res) => {
    otaController.updateOtaByDeviceUuid(req, res);
});


module.exports = router;
