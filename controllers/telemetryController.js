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

// Get telemetry by device
const getTelemetryByDevice = async (req, res) => {
    try {
        const page = req.query.page;
        const limit = req.query.limit;
        const skip = (page - 1) * limit;

        const telemetry = await Telemetry.find({ device_uuid: req.params.device_uuid }).populate('device').skip(skip).limit(limit);
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

// Get telemetry by device and channel
const getTelemetryByDeviceAndChannel = async (req, res) => {
    try {
        const telemetry = await Telemetry.find({ device_uuid: req.params.device_uuid, channel_id: req.params.channel_id }).populate('device');
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

module.exports = {
    getAllTelemetry,
    getSingleTelemetry,
    getTelemetryByDevice,
    getTelemetryByDeviceAndChannel
};