const Configration = require('../models/Configration');
const Device = require('../models/Device');

const getConfig = async (req, res) => {
    try {
        const { device_uuid } = req.params;

        if(!device_uuid){
            return res.status(400).json({
                success: false,
                message: 'device_uuid is required'
            });
        }
        
        let config;
        if (device_uuid) {
            config = await Configration.findOne({ device_uuid });
        } else {
            config = await Configration.find();
        }

        if (!config && device_uuid) {
            return res.status(404).json({ 
                success: false, 
                message: 'Configuration not found for this device' 
            });
        }

        res.status(200).json({
            success: true,
            message : 'Configuration retrieved successfully',
            data: config
        });
    } catch (error) {
        console.error('Error getting configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const updateConfig = async (req, res) => {
    try {
        const { device_uuid } = req.params;
        const { voltage_unbalance } = req.body;

        if (!device_uuid || voltage_unbalance === undefined) {
            return res.status(400).json({
                success: false,
                message: 'device_uuid and voltage_unbalance are required'
            });
        }

        // Check if device exists
        const device = await Device.findOne({ device_uuid });
        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }

        const config = await Configration.findOneAndUpdate(
            { device_uuid },
            { voltage_unbalance },
            { upsert: true, new: true }
        );

        res.status(200).json({
            success: true,
            message: 'Configuration updated successfully',
            data: config
        });
    } catch (error) {
        console.error('Error updating configuration:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

module.exports = {
    getConfig,
    updateConfig
};