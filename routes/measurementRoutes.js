const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const measurementController = require('../controllers/measurementController');

router.get('/:device_uuid/:command', verifyToken , measurementController.getMeasurement);

router.put('/:device_uuid/:command', verifyToken , measurementController.updateMeasurement);

module.exports = router;