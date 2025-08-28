const express = require('express');
const router = express.Router();
const Telemetry = require('../models/Telemetry');
const mongoose = require('mongoose');

// Get telemetry data with filters
router.get('/', async (req, res) => {
  try {
    const { 
      device_id, 
      start, 
      end, 
      limit = 100, 
      offset = 0,
      sort = '-timestamp'
    } = req.query;

    const query = {};
    
    if (device_id) query.deviceId = device_id;
    
    if (start && end) {
      query.timestamp = { $gte: new Date(start), $lte: new Date(end) };
    } else if (start) {
      query.timestamp = { $gte: new Date(start) };
    } else if (end) {
      query.timestamp = { $lte: new Date(end) };
    }

    const [telemetry, total] = await Promise.all([
      Telemetry.find(query)
        .sort(sort)
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .lean(),
      Telemetry.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: telemetry,
      meta: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching telemetry:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Submit telemetry data (for testing)
router.post('/', async (req, res) => {
  try {
    const { deviceId, topic, data, timestamp } = req.body;
    
    if (!deviceId || !topic || !data) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: deviceId, topic, data' 
      });
    }

    // Save telemetry
    const telemetry = new Telemetry({
      deviceId,
      topic,
      data,
      timestamp: timestamp || new Date()
    });

    await telemetry.save();

    res.status(201).json({ 
      success: true, 
      data: telemetry 
    });
  } catch (error) {
    console.error('Error saving telemetry:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});


module.exports = router;
