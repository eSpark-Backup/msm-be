const Telemetry = require('../models/Telemetry');

// Get all telemetry data
const getAllTelemetry = async (req, res) => {
    try {
        const telemetryData = await Telemetry.find().populate('device');
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
        const telemetry = await Telemetry.find({ device_uuid: req.params.id }).populate('device');
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

// Create new telemetry record
const createTelemetry = async (req, res) => {
    try {
        const telemetry = new Telemetry(req.body);
        await telemetry.save();
        const populatedTelemetry = await Telemetry.find({ device_uuid: req.params.id }).populate('device');
        res.status(201).json({
            success: true,
            message: 'Telemetry record created successfully',
            data: populatedTelemetry
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating telemetry record',
            error: error.message
        });
    }
};

// Update telemetry record
const updateTelemetry = async (req, res) => {
    try {
        const telemetry = await Telemetry.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('device');
        if (!telemetry) {
            return res.status(404).json({
                success: false,
                message: 'Telemetry record not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Telemetry record updated successfully',
            data: telemetry
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating telemetry record',
            error: error.message
        });
    }
};

// Delete telemetry record
const deleteTelemetry = async (req, res) => {
    try {
        const telemetry = await Telemetry.findByIdAndDelete(req.params.id);
        if (!telemetry) {
            return res.status(404).json({
                success: false,
                message: 'Telemetry record not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Telemetry record deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting telemetry record',
            error: error.message
        });
    }
};

module.exports = {
    getAllTelemetry,
    getSingleTelemetry,
    createTelemetry,
    updateTelemetry,
    deleteTelemetry
};