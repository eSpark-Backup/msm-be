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
        { $sort: { timestamp: -1 } },
        {
          $group: {
            _id: {
              device_uuid: "$device_uuid",
              channel_id: "$channel_id",
              phase: "$phase"
            },
            latest: { $first: "$$ROOT" }
          }
        },
        { $replaceRoot: { newRoot: "$latest" } },
        { $sort: { channel_id: 1, phase: 1 } }
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

    const latestRecord = await Telemetry.findOne({
      device_uuid,
      channel_id: Number(channel_id),
    })
      .sort({ timestamp: -1 })
      .lean();

    if (!latestRecord) {
      return res.status(404).json({
        success: false,
        message: "No telemetry found",
      });
    }

    const windowStart = new Date(latestRecord.timestamp);
    windowStart.setMinutes(windowStart.getMinutes() - 30);

    const telemetry = await Telemetry.aggregate([
      {
        $match: {
          device_uuid,
          channel_id: Number(channel_id),
          timestamp: { $gte: windowStart, $lte: latestRecord.timestamp },
        },
      },
      {
        $group: {
          _id: {
            device_uuid: "$device_uuid",
            channel_id: "$channel_id",
            phase: "$phase",
          },
          id: { $last: "$_id" },
          latest: { $last: "$$ROOT" },
          avg_power_factor: { $avg: "$power_factor" },
          avg_active_power: { $avg: "$active_power" },
          avg_reactive_power: { $avg: "$reactive_power" },
          avg_apparent_power: { $avg: "$apparent_power" },
          avg_active_energy_positive: { $avg: "$active_energy_positive" },
          avg_active_energy_negative: { $avg: "$active_energy_negative" },
          avg_reactive_energy_positive: { $avg: "$reactive_energy_positive" },
          avg_reactive_energy_negative: { $avg: "$reactive_energy_negative" },
        },
      },
      {
        $project: {
          latest: 1,
          avg_power_factor: { $round: ["$avg_power_factor", 0] },
          avg_active_power: { $round: ["$avg_active_power", 0] },
          avg_reactive_power: { $round: ["$avg_reactive_power", 0] },
          avg_apparent_power: { $round: ["$avg_apparent_power", 0] },
          avg_active_energy_positive: { $round: ["$avg_active_energy_positive", 0] },
          avg_active_energy_negative: { $round: ["$avg_active_energy_negative", 0] },
          avg_reactive_energy_positive: { $round: ["$avg_reactive_energy_positive", 0] },
          avg_reactive_energy_negative: { $round: ["$avg_reactive_energy_negative", 0] },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$latest", "$$ROOT"],
          },
        },
      },
      {
        $project: {
          latest: 0,
        },
      },
      {
        $lookup: {
          from: "devices",
          localField: "device_uuid",
          foreignField: "device_uuid",
          as: "device",
        },
      },
      { $unwind: "$device" },
      { $sort: { phase: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: telemetry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching telemetry record",
      error: error.message,
    });
  }
};

  


  const getTelemetryByDeviceAndChannelLatestTen = async (req, res) => {
    try {
      const { device_uuid, channel_id } = req.params;
  
      const telemetry = await Telemetry.aggregate([
        { $match: { device_uuid, channel_id: Number(channel_id) } },
        {
          $group: {
            _id: "$phase",
            latestRecords: {
              $topN: {
                output: "$$ROOT",
                sortBy: { timestamp: -1 },
                n: 10
              }
            }
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