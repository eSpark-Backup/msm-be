const Sftp = require('../models/Sftp');
const SftpClient = require('ssh2-sftp-client');
const path = require('path');
const Device = require('../models/Device');
const fleetConnect = require('../fleetConnect');

const getVersionList = async (req, res) => {
    const client = new SftpClient();
    try {
        // const device_uuid = req.params.device_uuid;

        const sftp = await Sftp.findOne({});
        
        if (!sftp) {
            return res.status(404).json({
                status: false,
                message: 'SFTP credentials not found'
            });
        }

        const { server_ip, server_port, username, password } = sftp;

        await client.connect({ host: server_ip, port: server_port, username, password });

        const list = await client.list('/ota-test');

        const fileNames = list
            .map(file => path.parse(file.name).name)
            .sort((a, b) => {
                const getParts = (str) => str.replace("MSM_", "").split('.').map(Number);
                const A = getParts(a);
                const B = getParts(b);
                for (let i = 0; i < Math.max(A.length, B.length); i++) {
                    if ((A[i] || 0) !== (B[i] || 0)) {
                        return (A[i] || 0) - (B[i] || 0);
                    }
                }
                return 0;
            });

        await client.end();

        res.status(200).json({
            status: true,
            message: 'Version list found successfully',
            data: fileNames
        });
    } catch (error) {
        if (client) await client.end();
        res.status(500).json({
            status: false,
            message: 'Failed to get version list',
            error: error.message
        });
    }
};

const updateVersionList = async (req, res) => {
    try {
        const devices = req.body.devices;

        for (const device of devices) {
            await fleetConnect.sendVersionCommand(device.device_uuid, device.version);
        }

        res.status(200).json({
            status: true,
            message: 'Version list updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed to update version list',
            error: error.message
        });
    }
};


module.exports = {
    getVersionList,
    updateVersionList
};
