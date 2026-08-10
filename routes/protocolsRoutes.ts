const express = require('express');
const router = express.Router();
const protocolController = require('../controllers/protocolController');

router.get('/:device_uuid', protocolController.getAllProtocols);

module.exports = router;
