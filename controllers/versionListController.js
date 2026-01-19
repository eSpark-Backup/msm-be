const Sftp = require('../models/Sftp');
const SftpClient = require('ssh2-sftp-client');
const path = require('path');
const fleetConnect = require('../fleetConnect');
const Versions = require('../models/Versions');
const socketService = require('../sockets/socket');
const archiver = require("archiver");

const getVersionList = async (req, res) => {
    const client = new SftpClient();
    try {
        const sftp = await Sftp.findOne({}).sort({ createdAt: -1 });
        console.log(sftp)
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
        const sftp = await Sftp.findOne({}).sort({ createdAt: -1 });
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
        const toDeleteVersions = dbVersions.filter(v => !sftpVersions.includes(v));


        await client.end();

        if (toDeleteVersions.length > 0) {
            await Versions.deleteMany({ version: { $in: toDeleteVersions } });
        }

        if (newVersions.length > 0) {
            const insertData = newVersions.map(v => ({ version: v }));

            await Versions.insertMany(insertData);

            await  socketService.emitToClients('new_versions', newVersions);
            
            res.status(200).json({
                status: true,
                message: 'New versions fetched successfully',
                data: newVersions,
            });
        }else{

            await  socketService.emitToClients('new_versions', 'No New Versions Found');

            res.status(200).json({
                status: false,
                message: 'No new versions found',
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

const exportAllVersionList = async (req, res) => {
  const client = new SftpClient({ debug: () => {} });

  try {
    const sftp = await Sftp.findOne({}).sort({ createdAt: -1 });
    // Connect using your original SFTP credentials
    await client.connect({
      host: sftp.server_ip,
      port: sftp.server_port,
      username: sftp.username,
      password: sftp.password,
    });

    const remoteDir = "/ota-test";

    // Set headers so browser downloads as ZIP
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="ota-test.zip"`
    );

    const archive = archiver("zip", { zlib: {  store: true } });
    archive.pipe(res);

    // Handle archive errors
    archive.on("error", err => {
      console.error("Archive Error:", err);
      try { res.status(500).send({ status: false, message: "Archive failed", error: err.message }); } catch {}
    });

    // List all files in SFTP folder
    const files = await client.list(remoteDir);

    // Stream all files into the ZIP
    for (const file of files) {
      if (file.type === "-") { // Only regular files
        const remotePath = `${remoteDir}/${file.name}`;
        const fileStream = await client.get(remotePath); // Stream file from SFTP
        archive.append(fileStream, { name: file.name }); // Add to ZIP
      }
    }

    // Finalize archive and close SFTP when done
    await archive.finalize();
    await client.end();
    console.log("All files streamed and SFTP connection closed");

  } catch (err) {
    console.error("Download Error:", err);
    try { await client.end(); } catch (e) {}
    if (!res.headersSent) {
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
        error: err.message
      });
    }
  }
};

const exportSelectedVersionList = async (req, res) => {
  const client = new SftpClient({ debug: () => {} });

  try {
    const sftp = await Sftp.findOne({}).sort({ createdAt: -1 });
    // Connect using your original SFTP credentials
    await client.connect({
      host: sftp.server_ip,
      port: sftp.server_port,
      username: sftp.username,
      password: sftp.password,
    });

    const { names } = req.body;

    const remoteDir = "/ota-test";

    // Set headers so browser downloads as ZIP
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="ota-test.zip"`
    );

    const archive = archiver("zip", { zlib: {  store: true } });
    archive.pipe(res);

    // Handle archive errors
    archive.on("error", err => {
      console.error("Archive Error:", err);
      try { res.status(500).send({ status: false, message: "Archive failed", error: err.message }); } catch {}
    });

    // List all files in SFTP folder
    // const sftp_files = await client.list(remoteDir);
    const db_files = await Versions.find({});

    // Stream all files into the ZIP
    for (const fileName of names) {
      const file = db_files.find(f => f.version === fileName);

      if (file) { // Only regular files that exist
        const remotePath = `${remoteDir}/${file.version}.zip`;
        const fileStream = await client.get(remotePath); // Stream file from SFTP
        archive.append(fileStream, { name: file.version }); // Add to ZIP
        console.log(`Added to ZIP: ${file.version}`);
      } else {
        console.warn(`File not found or not a regular file: ${fileName}`);
      }
    }

    // Finalize archive and close SFTP when done
    await archive.finalize();
    await client.end();
    console.log("All files streamed and SFTP connection closed");

  } catch (err) {
    console.error("Download Error:", err);
    try { await client.end(); } catch (e) {}
    if (!res.headersSent) {
      res.status(500).json({
        status: false,
        message: "Internal Server Error",
        error: err.message, 
      });
    }
  }
};

const importVersionList = async (req, res) => {
  const client = new SftpClient();

  try {
    if (!req.file) {
      return res.status(400).json({ status: false, message: "No file uploaded" });
    }

    const sftp = await Sftp.findOne({}).sort({ createdAt: -1 });

    await client.connect({
      host: sftp.server_ip,
      port: sftp.server_port,
      username: sftp.username,
      password: sftp.password
    });

    const remotePath = `/ota-test/${req.file.originalname}`;

    await client.put(req.file.buffer, remotePath);

    res.json({ status: true, message: "File uploaded successfully", remotePath });

  } catch (error) {
    console.error("SFTP Upload Error:", error);
    res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error.message
    });
  } finally {
    try { await client.end(); } catch(e) {}
  }
};


module.exports = {
    getVersionList,
    updateVersionList,
    exportAllVersionList,
    exportSelectedVersionList,
    importVersionList,
    checkUpdates,
    deleteVersion
};
