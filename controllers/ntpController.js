const Ntp = require('../models/Ntp');

// Get all NTP configurations
const getAllNtp = async (req, res) => {
    try {
        const ntpConfigs = await Ntp.find();
        res.status(200).json({
            success: true,
            data: ntpConfigs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching NTP configurations',
            error: error.message
        });
    }
};

// Get single NTP configuration by ID
const getSingleNtp = async (req, res) => {
    try {
        const ntpConfig = await Ntp.findById(req.params.id);
        if (!ntpConfig) {
            return res.status(404).json({
                success: false,
                message: 'NTP configuration not found'
            });
        }
        res.status(200).json({
            success: true,
            data: ntpConfig
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching NTP configuration',
            error: error.message
        });
    }
};

// Create new NTP configuration
const createNtp = async (req, res) => {
    try {
        const device_uuid = req.body.device_uuid;
        const ntpConfig = await Ntp.findOneAndUpdate({ device_uuid }, req.body, { new: true, upsert: true });
        res.status(201).json({
            success: true,
            message: 'NTP configuration created successfully',
            data: ntpConfig
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating NTP configuration',
            error: error.message
        });
    }
};

// Update NTP configuration
const updateNtp = async (req, res) => {
    try {
        // Build a $set object dynamically
        const updateData = {};
        for (const key in req.body.data) {
            updateData[`data.${key}`] = req.body.data[key];
        }

        const ntpConfig = await Ntp.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!ntpConfig) {
            return res.status(404).json({
                success: false,
                message: 'NTP configuration not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'NTP configuration updated successfully',
            data: ntpConfig
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating NTP configuration',
            error: error.message
        });
    }
};


// Delete NTP configuration
const deleteNtp = async (req, res) => {
    try {
        const ntpConfig = await Ntp.findByIdAndDelete(req.params.id);
        if (!ntpConfig) {
            return res.status(404).json({
                success: false,
                message: 'NTP configuration not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'NTP configuration deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting NTP configuration',
            error: error.message
        });
    }
};

// Get NTP configuration by device UUID
const getSingleNtpByDeviceUuid = async (req, res) => {
    try {
        const ntpConfig = await Ntp.findOne({ device_uuid: req.params.device_uuid });
        if (!ntpConfig) {
            return res.status(404).json({
                success: false,
                message: 'NTP configuration not found'
            });
        }
        res.status(200).json({
            success: true,
            data: ntpConfig
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching NTP configuration',
            error: error.message
        });
    }
};

module.exports = {
    getAllNtp,
    getSingleNtp,
    getSingleNtpByDeviceUuid,
    createNtp,
    updateNtp,
    deleteNtp
};