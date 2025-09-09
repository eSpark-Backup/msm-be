const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');

// Route for getting telemetry with query parameters
router.get('/', telemetryController.getAllTelemetry);

// More specific routes should come first
router.get('/device/:device_uuid/channel/:channel_id', telemetryController.getTelemetryByDeviceAndChannel);

router.get('/device/:device_uuid', telemetryController.getTelemetryByDevice);

// Generic route should come last
router.get('/:id', telemetryController.getSingleTelemetry);

module.exports = router;
