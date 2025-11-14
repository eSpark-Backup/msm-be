const OTA = require('../models/Ota');
const fleetConnect = require('../fleetConnect');

const getSingleOtaByDeviceUuid = async (req, res) => {
    try {
        const ota = await OTA.findOne({ device_uuid: req.params.device_uuid });
        res.status(200).json({
            status: true,
            message: 'Ota found successfully',
            data: ota
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed to get ota',
            error  :error.message
        });
    }
};

const updateOtaByDeviceUuid = async (req, res) => {
    try {
        const ota = await OTA.findOneAndUpdate({ device_uuid: req.params.device_uuid }, req.body, { new: true });

        fleetConnect.sendOtaConfig(req.params.device_uuid , req.body);

        res.status(200).json({
            status: true,
            message: 'Ota updated successfully',
            data: ota
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed to update ota',
            error  :error.message
        });
    }
};


module.exports = {
    getSingleOtaByDeviceUuid,
    updateOtaByDeviceUuid
};