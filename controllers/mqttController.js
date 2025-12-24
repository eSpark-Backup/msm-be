const Mqtt = require('../models/Mqtt');
const socketService = require('../sockets/socket');
const fleetConnect = require('../fleetConnect');

const getAllMqtt = async (req, res) => {
    try {
        const mqttConfigs = await Mqtt.find();
        res.status(200).json({
            success: true,
            data: mqttConfigs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching MQTT configurations',
            error: error.message
        });
    }
};

// Get single MQTT configuration by ID
const getSingleMqtt = async (req, res) => {
    try {
        const mqttConfig = await Mqtt.findOne({ device_uuid: req.params.device_uuid });
        if (!mqttConfig) {
            return res.status(404).json({
                success: false,
                message: 'MQTT configuration not found'
            });
        }
        res.status(200).json({
            success: true,
            data: mqttConfig
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching MQTT configuration',
            error: error.message
        });
    }
};

// Get single MQTT configuration by device_uuid
const getSingleMqttByDeviceUuid = async (req, res) => {
    try {
        const mqttConfig = await Mqtt.find({ device_uuid: req.params.device_uuid });
        if (!mqttConfig) {
            return res.status(404).json({
                success: false,
                message: 'MQTT configuration not found'
            });
        }
        res.status(200).json({
            success: true,
            data: mqttConfig
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching MQTT configuration',
            error: error.message
        });
    }
};

// Corrected createMqtt function
const createMqtt = async (req, res) => {
    try {
        const { device_uuid } = req.params;

        // Upsert MQTT config by device_uuid
        const mqttConfig = await Mqtt.findOneAndUpdate(
            { device_uuid },  // filter
            req.body,                                // data to update
            { upsert: true, new: true }             // create if not exists & return new doc
        );

        res.status(201).json({
            success: true,
            message: 'MQTT configuration created successfully',
            data: mqttConfig
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating MQTT configuration',
            error: error.message
        });
    }
};

// Update MQTT configuration
const updateMqtt = async (req, res) => {
    try {

        const { device_uuid } = req.params;

        const mqttConfig = await Mqtt.findOneAndUpdate(
            { device_uuid },
            req.body,
            { new: true, runValidators: true , upsert: true }
        );

        fleetConnect.sendMqttConfig(mqttConfig.device_uuid , req.body);

        res.status(200).json({
            success: true,
            message: 'MQTT configuration updated successfully',
            data: mqttConfig
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating MQTT configuration',
            error: error.message
        });
    }
};

// Delete MQTT configuration
const deleteMqtt = async (req, res) => {
    try {
        const { device_uuid } = req.params;
        const mqttConfig = await Mqtt.findOneAndDelete({ device_uuid });
        if (!mqttConfig) {
            return res.status(404).json({
                success: false,
                message: 'MQTT configuration not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'MQTT configuration deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting MQTT configuration',
            error: error.message
        });
    }
};

module.exports = {
    getAllMqtt,
    getSingleMqtt,
    createMqtt,
    updateMqtt,
    deleteMqtt,
    getSingleMqttByDeviceUuid
};