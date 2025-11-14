const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const measurementController = require('../controllers/measurementController');

router.get('/:device_uuid', verifyToken , measurementController.getMeasurement);

module.exports = router;