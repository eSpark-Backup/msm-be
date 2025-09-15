const Sftp = require('../models/Sftp');

// Get all SFTP configurations
const getAllSftp = async (req, res) => {
    try {
        const sftpConfigs = await Sftp.find();
        res.status(200).json({
            success: true,
            data: sftpConfigs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching SFTP configurations',
            error: error.message
        });
    }
};

// Get single SFTP configuration by ID
const getSingleSftp = async (req, res) => {
    try {
        const sftpConfig = await Sftp.findById(req.params.id);
        if (!sftpConfig) {
            return res.status(404).json({
                success: false,
                message: 'SFTP configuration not found'
            });
        }
        res.status(200).json({
            success: true,
            data: sftpConfig
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching SFTP configuration',
            error: error.message
        });
    }
};

// Create new SFTP configuration
const createSftp = async (req, res) => {
    try {
        const sftpConfig = await Sftp.findOneAndUpdate(
            { device_uuid: req.body.device_uuid },
            req.body,
            { upsert: true, new: true }
        );
        res.status(201).json({
            success: true,
            message: 'SFTP configuration created successfully',
            data: sftpConfig
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating SFTP configuration',
            error: error.message
        });
    }
};

// Update SFTP configuration
const updateSftp = async (req, res) => {
    try {
        const sftpConfig = await Sftp.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!sftpConfig) {
            return res.status(404).json({
                success: false,
                message: 'SFTP configuration not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'SFTP configuration updated successfully',
            data: sftpConfig
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating SFTP configuration',
            error: error.message
        });
    }
};

// Delete SFTP configuration
const deleteSftp = async (req, res) => {
    try {
        const sftpConfig = await Sftp.findByIdAndDelete(req.params.id);
        if (!sftpConfig) {
            return res.status(404).json({
                success: false,
                message: 'SFTP configuration not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'SFTP configuration deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting SFTP configuration',
            error: error.message
        });
    }
};

// Get SFTP configuration by device UUID
const getSingleSftpByDeviceUuid = async (req, res) => {
    try {
        const sftpConfig = await Sftp.findOne({ device_uuid: req.params.device_uuid });
        if (!sftpConfig) {
            return res.status(404).json({
                success: false,
                message: 'SFTP configuration not found'
            });
        }
        res.status(200).json({
            success: true,
            data: sftpConfig
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching SFTP configuration',
            error: error.message
        });
    }
};

module.exports = {
    getAllSftp,
    getSingleSftp,
    getSingleSftpByDeviceUuid,
    createSftp,
    updateSftp,
    deleteSftp
};