const Sftp = require('../models/Sftp');
const SftpClient = require('ssh2-sftp-client');
const path = require('path');
const fleetConnect = require('../fleetConnect');
const Versions = require('../models/Versions');

const getVersionList = async (req, res) => {
    const client = new SftpClient();
    try {
        const sftp = await Sftp.findOne({});
        if (!sftp) {
            return res.status(404).json({
                status: false,
                message: 'SFTP credentials not found'
            });
        }

        const { server_ip, server_port, username, password } = sftp;

        await client.connect({ host: server_ip, port: server_port, username, password });
        await client.end(); 

        const versionsDocs = await Versions.find({}, { version: 1, _id: 0 }).lean();
        const versions = versionsDocs.map(v => v.version);

        res.status(200).json({
            status: true,
            message: 'versions fetched successfully',
            data: versions
        });

    } catch (error) {
        if (client) await client.end();
        res.status(500).json({
            status: false,
            message: 'SFTP connection failed or database fetch failed',
            error: error.message
        });
    }
};


const checkUpdates = async (req, res) => {
    const client = new SftpClient();
    try {
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
        const sftpVersions = list.map(file => path.parse(file.name).name);

        const dbVersionsDocs = await Versions.find({}, { version: 1, _id: 0 }).lean();
        const dbVersions = dbVersionsDocs.map(v => v.version);

        const newVersions = sftpVersions.filter(v => !dbVersions.includes(v));

        await client.end();

        if (newVersions.length > 0) {
            const insertData = newVersions.map(v => ({ version: v }));
            await Versions.insertMany(insertData);

            await  socketService.emitToClients('new_versions', newVersions);
            
            res.status(200).json({
                status: true,
                message: 'New versions fetched successfully',
                data: newVersions
            });
        }else{

            await  socketService.emitToClients('new_versions', 'No New Versions Found');

            res.status(200).json({
                status: false,
                message: 'No new versions found'
            });
        }

    } catch (error) {
        if (client) await client.end();
        res.status(500).json({
            status: false,
            message: 'Failed to check updates',
            error: error.message
        });
    }
};

const deleteVersion = async (req, res) => {
    try {
        const { version } = req.params; 

        if (!version) {
            return res.status(400).json({
                status: false,
                message: 'Version parameter is required'
            });
        }

        const result = await Versions.deleteOne({ version });

        if (result.deletedCount === 0) {
            return res.status(404).json({
                status: false,
                message: `Version "${version}" not found`
            });
        }

        res.status(200).json({
            status: true,
            message: `Version "${version}" deleted successfully`
        });

    } catch (error) {
        console.error('Error deleting version:', error);
        res.status(500).json({
            status: false,
            message: 'Failed to delete version',
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

const exportAllVersionList = async (req , res) => {
    try{

    }catch(error){
        res.status(500).json({
            ststus:false,
            message: "Internal Server Error"
        })
    }
}

const uploadFileToSftp = async (req , res) => {
    try{

    }catch(error){
        res.status(500).json({
            ststus:false,
            message: "Internal Server Error"
        })
    }
}


module.exports = {
    getVersionList,
    updateVersionList,
    exportAllVersionList,
    uploadFileToSftp,
    checkUpdates,
    deleteVersion
};
