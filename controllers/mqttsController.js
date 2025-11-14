const Mqtts = require('../models/Mqtts');
const verifyToken = require('../middleware/verifyToken');
const fleetConnect = require('../fleetConnect');

const getSingleMqttsByDeviceUuid = async (req, res) => {
    try {
        const deviceUuid = req.params.device_uuid;
        const mqtts = await Mqtts.findOne({ device_uuid: deviceUuid });
        if (!mqtts) {
            return res.status(404).json({
                status: false,
                message: 'Mqtts not found'
            });
        }
        res.status(200).json({
            status: true,
            message: 'Mqtts found successfully',
            data: mqtts
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed to get mqtts',
            error: error.message
        });
    }
};

const updateMqttsByDeviceUuid = async (req, res) => {
    try {
        const deviceUuid = req.params.device_uuid;
        const mqtts = await Mqtts.findOneAndUpdate({ device_uuid: deviceUuid }, req.body, { new: true });
        if (!mqtts) {
            return res.status(404).json({
                status: false,
                message: 'Mqtts not found'
            });
        }

        fleetConnect.sendMqttsConfig(deviceUuid , req.body);

        res.status(200).json({
            status: true,
            message: 'Mqtts Updated successfully',
            data: mqtts
        });

    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed to update mqtts',
            error: error.message
        });
    }
};

module.exports = {
    getSingleMqttsByDeviceUuid,
    updateMqttsByDeviceUuid
};

