const Telemetry = require('../models/Telemetry');

// Get all telemetry data
const getAllTelemetry = async (req, res) => {
    try {
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;
        const telemetryData = await Telemetry.find().populate('device').skip(skip).limit(limit);

        res.status(200).json({
            success: true,
            data: telemetryData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching telemetry data',
            error: error.message
        });
    }
};

// Get single telemetry record by ID
const getSingleTelemetry = async (req, res) => {
    try {
        const telemetry = await Telemetry.find({ _id: req.params.id }).populate('device');
        if (!telemetry) {
            return res.status(404).json({
                success: false,
                message: 'Telemetry record not found'
            });
        }
        res.status(200).json({
            success: true,
            data: telemetry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching telemetry record',
            error: error.message
        });
    }
};

// Get latest telemetry by device (channel + phase wise)
const getTelemetryByDevice = async (req, res) => {
    try {
      const device_uuid = req.params.device_uuid;
  
      const telemetry = await Telemetry.aggregate([
        { $match: { device_uuid } },
        { $sort: { timestamp: -1 } }, // latest first
        {
          $group: {
            _id: {
              device_uuid: "$device_uuid",
              channel_id: "$channel_id",
              phase: "$phase"
            },
            latest: { $first: "$$ROOT" } // pick the first (latest) doc
          }
        },
        { $replaceRoot: { newRoot: "$latest" } }
      ]);
  
      res.status(200).json({
        success: true,
        data: telemetry
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching latest telemetry",
        error: error.message
      });
    }
  };
  
// Get latest telemetry by device and channel (phase wise)
const getTelemetryByDeviceAndChannel = async (req, res) => {
    try {
      const { device_uuid, channel_id } = req.params;
  
      const telemetry = await Telemetry.aggregate([
        {
          $match: {
            device_uuid,
            channel_id: Number(channel_id) // agar channel_id number hai
          }
        },
        { $sort: { timestamp: -1 } }, // latest pehle
        {
          $group: {
            _id: {
              device_uuid: "$device_uuid",
              channel_id: "$channel_id",
              phase: "$phase"
            },
            latest: { $first: "$$ROOT" } // har phase ka sirf latest
          }
        },
        { $replaceRoot: { newRoot: "$latest" } },
        {
          $lookup: {
            from: "devices", // collection name jo aapke Device model ka hai
            localField: "device_uuid",
            foreignField: "device_uuid",
            as: "device"
          }
        },
        { $unwind: "$device" }
      ]);
  
      if (!telemetry || telemetry.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Telemetry record not found"
        });
      }
  
      res.status(200).json({
        success: true,
        data: telemetry
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching telemetry record",
        error: error.message
      });
    }
  };

  const getTelemetryByDeviceAndChannelLatestTen = async (req, res) => {
    try {
      const { device_uuid, channel_id } = req.params;
  
      const telemetry = await Telemetry.aggregate([
        {
          $match: {
            device_uuid,
            channel_id: Number(channel_id)
          }
        },
        { $sort: { timestamp: -1 } }, // latest pehle
        {
          $group: {
            _id: "$phase", // phase-wise group
            latestRecords: { $push: "$$ROOT" } // sab record ek array me
          }
        },
        {
          $project: {
            _id: 1,
            latestRecords: { $slice: ["$latestRecords", 10] } // sirf latest 10 per phase
          }
        },
        { $unwind: "$latestRecords" },
        { $replaceRoot: { newRoot: "$latestRecords" } },
        {
          $lookup: {
            from: "devices",
            localField: "device_uuid",
            foreignField: "device_uuid",
            as: "device"
          }
        },
        { $unwind: "$device" }
      ]);
  
      if (!telemetry || telemetry.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Telemetry record not found"
        });
      }
  
      res.status(200).json({
        success: true,
        data: telemetry
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching telemetry record",
        error: error.message
      });
    }
  };
  
  

module.exports = {
    getAllTelemetry,
    getSingleTelemetry,
    getTelemetryByDevice,
    getTelemetryByDeviceAndChannel,
    getTelemetryByDeviceAndChannelLatestTen
};