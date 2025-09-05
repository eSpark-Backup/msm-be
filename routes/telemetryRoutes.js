const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetryController');

// Get telemetry data with filters
router.get('/', telemetryController.getAllTelemetry);

// Submit telemetry data (for testing)
router.post('/', telemetryController.createTelemetry);

router.get('/:id', telemetryController.getSingleTelemetry);


module.exports = router;
