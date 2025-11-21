const mqttClient = require('../fleetConnect');
const Device = require('../models/Device');
const AddDevice = require('../models/AddDevice');
const UserDevices = require('../models/UserDevices');
const fleetConnect = require('../fleetConnect');
const { decrypt } = require('../utils/enryption');

// ===== DEVICE REBOOT CONTROLLER =====
/**
 * @description Send reboot command to a device
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const rebootDevice = async (req, res) => {
    try {
        const { deviceId } = req.params;

        if (!deviceId) {
            return res.status(400).json({ success: false, message: 'Device ID is required' });
        }

        // Use the FleetConnect method
        mqttClient.sendRebootCommand(deviceId);

        res.json({
            success: true,
            message: 'Reboot command sent successfully',
            deviceId,
            topic: `msm/${deviceId}/reboot`
        });
    } catch (error) {
        console.error('Error in reboot endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


const getDeviceById = async (req, res) => {
    try {
        const device_id = req.params.deviceId;

        const device = await Device.findById(device_id).populate('ota');

        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Device found',
            data: device
        })

    } catch (error) {
        console.error('Error in Device Get By id end point : ', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message
        })
    }
}


const getAllDevices = async (req, res) => {
    try {
        const { search, page, limit } = req.query;
        const query = {};

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 0;
        const skip = limitNum ? (pageNum - 1) * limitNum : 0;

        const devices = await Device.find(query).skip(skip).limit(limitNum).populate('ota');

        const count = await Device.countDocuments(query);

        res.status(200).json({
            success: true,
            message: "Devices found",
            count,
            data: devices,
        });
    } catch (error) {
        console.error("Error in Device Get All endpoint:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};


const getAllUserDevices = async (req, res) => {
    try {

        const { search, page, limit , status_sort , created_sort , updated_sort } = req.query;
        const query = {};

        if (req.user.role.name !== "super_admin") {
            query.user_id = req.user._id;
        }

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 0;
        const skip = limitNum ? (pageNum - 1) * limitNum : 0;

        const statusOrder = status_sort ? status_sort === '1' ? 1 : -1 : -1 ;
        const createdOrder = created_sort ? created_sort === '1' ? 1 : -1 : -1 ;
        const updatedOrder = updated_sort ? updated_sort === '1' ? 1 : -1 : -1 ;


        const pipeline = [
            { $match: query },

            // Lookup device_data
            {
                $lookup: {
                    from: "devices",
                    localField: "device_id",
                    foreignField: "_id",
                    as: "device_data"
                }
            },
            { $unwind: { path: "$device_data", preserveNullAndEmptyArrays: true } },

            // Lookup groups_data
            {
                $lookup: {
                    from: "groups",
                    localField: "group_id",
                    foreignField: "_id",
                    as: "groups_data"
                }
            },

            // Lookup OTA (NOW device_data fields are available)
            {
                $lookup: {
                    from: "otas",
                    localField: "device_data.device_uuid",
                    foreignField: "device_uuid",
                    as: "device_data.ota"
                }
            },

            // Sort by device_data.device_status
            { $sort: { "device_data.device_status": statusOrder, "createdAt": createdOrder , "updatedAt": updatedOrder } },
        ];

        if(limitNum != 0){
            pipeline.push({ $skip: skip }, { $limit: limitNum });
        }

        const devices = await AddDevice.aggregate(pipeline);


        const count = await AddDevice.countDocuments(query);

        if (devices.length == 0) {
            return res.status(404).json({
                success: false,
                message: 'Devices Not Found'
            })
        }

        res.status(200).json({
            success: true,
            message: "Devices found",
            count,
            data: devices,
        });
    } catch (error) {
        console.error("Error in Device Get All endpoint:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

const getAllAssignDevices = async (req, res) => {
    try {

        const { search, page, limit } = req.query;
        const query = { user_id: req.user._id };

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 0;
        const skip = limitNum ? (pageNum - 1) * limitNum : 0;

        const devices = await UserDevices.find(query).skip(skip).limit(limitNum).populate("user_data").populate({
            path: 'device_data',
            populate: [{
                path: 'groups_data',
            }, {
                path: 'device_data',
                populate: { path: "ota" }
            }]
        });

        const count = await UserDevices.countDocuments(query);

        if (devices.length == 0) {
            return res.status(404).json({
                success: false,
                message: 'Devices Not Found'
            })
        }

        res.status(200).json({
            success: true,
            message: "Devices found",
            count,
            data: devices,
        });
    } catch (error) {
        console.error("Error in Device Get All endpoint:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

const getSingleUserDevice = async (req, res) => {
    try {
        const { device_uuid } = req.params;

        const device = await Device.findOne({ device_uuid: device_uuid });


        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device Not Found'
            })
        }

        let query = { device_id: device._id };

        if (req.user.role.name !== "super_admin") {
            query.user_id = req.user._id;
        }

        const userDevice = await AddDevice.findOne(query).populate({path:"device_data", populate: { path: "ota" }}).populate("groups_data");

        if (userDevice) {
            res.status(200).json({
                success: true,
                message: "User Device found",
                data: userDevice
            });
        } else {
            res.status(404).json({
                success: false,
                message: "User Device Not Found"
            });
        }
    } catch (error) {
        console.error("Error in Device Get Single endpoint:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

const getSingleAssignDevice = async (req, res) => {
    try {
        const { device_uuid } = req.params;

        const device = await Device.findOne({ device_uuid: device_uuid }).populate('ota');


        if (!device) {
            return res.status(404).json({
                success: false,
                message: 'Device Not Found'
            })
        }

        const addDevice = await AddDevice.findOne({ device_id: device._id });

        if (!addDevice) {
            return res.status(404).json({
                success: false,
                message: 'Device Not Found'
            })
        }

        let query = { user_id: req.user._id, device_id: addDevice._id };

        const userDevice = await UserDevices.findOne(query).populate("user_data").populate({
            path: 'device_data',
            populate: [{
                path: 'groups_data',
            }, {
                path: 'device_data',
            }]
        });

        if (userDevice) {
            res.status(200).json({
                success: true,
                message: "User Device found",
                data: userDevice
            });
        } else {
            res.status(404).json({
                success: false,
                message: "User Device Not Found"
            });
        }
    } catch (error) {
        console.error("Error in Device Get Single endpoint:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

const getSingleUserDeviceById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = { user_id: id };

        const device = await AddDevice.find(query).populate("device_data").populate("groups_data").populate('ota');

        if (device && device.length > 0) {
            res.status(200).json({
                success: true,
                message: "Devices found",
                data: device
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Devices Not Found"
            });
        }
    } catch (error) {
        console.error("Error in Device Get Single endpoint:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

const getUserDevicesByUserId = async (req, res) => {
    try {
        const { user_id } = req.params;
        const query = { user_id: user_id };

        const device = await UserDevices.find(query).populate("user_data").populate({
            path: 'device_data',
            populate: [{
                path: 'groups_data',
            }, {
                path: 'device_data',
            }]
        });

        if (device && device.length > 0) {
            res.status(200).json({
                success: true,
                message: "Devices found",
                data: device
            });
        } else {
            res.status(404).json({
                success: false,
                message: "Devices Not Found"
            });
        }
    } catch (error) {
        console.error("Error in Device Get Single endpoint:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}

const createDevice = async (req, res) => {
    try {
        const user_id = req.user._id;
        const device_uuid = req.body.device_uuid;

        const device_data = await Device.findOne({ device_uuid: device_uuid });

        if (!device_data) {
            return res.status(404).json({
                success: false,
                message: 'Device Not Found'
            })
        }

        if (req.body.mqtt_password !== decrypt(device_data.device_pass)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Credentials'
            })
        }

        const device = await AddDevice.create({ ...req.body, user_id: user_id, device_id: device_data._id });
        res.status(201).json({
            success: true,
            message: 'Device created successfully',
            data: device
        })
    } catch (error) {
        console.error('Error in Device Create endpoint:', error);

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Device already exists for this user',
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

const updateDevice = async (req, res) => {
    try {
        const { device_uuid } = req.params;
        const user_id = req.user._id

        const device_data = await Device.findOne({ device_uuid: device_uuid });

        if (!device_data) {
            return res.status(404).json({
                success: false,
                message: 'Device Not Found'
            })
        }

        const userDevice = await AddDevice.findOneAndUpdate({ device_id: device_data._id, user_id: user_id }, req.body, { new: true }).populate('groups_data').populate('device_data');

        fleetConnect.sendDeviceInfoCommand(device_uuid, req.body.data);

        if (userDevice) {
            res.status(200).json({
                success: true,
                message: 'Device updated successfully',
                data: userDevice
            })
        } else {
            res.status(404).json({
                success: false,
                message: 'User Device Not Found'
            })
        }
    } catch (error) {
        console.error('Error in Device Update endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

const deleteDevice = async (req, res) => {
    try {
        const { device_uuid } = req.params;
        const user_id = req.user._id;

        const device_data = await Device.findOne({ device_uuid: device_uuid });

        if (!device_data) {
            return res.status(404).json({
                success: false,
                message: 'Device Not Found'
            })
        }

        const userDevice = await AddDevice.findOne({ device_id: device_data._id, user_id: user_id });

        if (!userDevice) {
            return res.status(404).json({
                success: false,
                message: 'User Device Not Found'
            })
        }

        await AddDevice.deleteMany({ device_id: device_data._id, user_id: user_id });
        res.status(200).json({
            success: true,
            message: 'Device deleted successfully',
        })
    } catch (error) {
        console.error('Error in Device Delete endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

const deleteDeviceByUserId = async (req, res) => {
    try {
        const { device_uuid, user_id } = req.params;

        const device_data = await Device.findOne({ device_uuid: device_uuid });

        if (!device_data) {
            return res.status(404).json({
                success: false,
                message: 'Device Not Found'
            })
        }

        const userDevice = await AddDevice.findOne({ device_id: device_data._id, user_id: user_id });

        if (!userDevice) {
            return res.status(404).json({
                success: false,
                message: 'User Device Not Found'
            })
        }

        await AddDevice.findOneAndDelete({ device_id: device_data._id, user_id: user_id });

        res.status(200).json({
            success: true,
            message: 'Device deleted successfully',
        })
    } catch (error) {
        console.error('Error in Device Delete endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}

const getPublicDeviceByDeviceUuid = async (req, res) => {
    try {
        const { device_uuid } = req.params;
        const device_data = await Device.findOne({ device_uuid: device_uuid }).populate('mqtt').populate('sftp').populate('ntp').populate('mqtts').populate('ota');
        if (!device_data) {
            return res.status(404).json({
                success: false,
                message: 'Device Not Found'
            })
        }

        res.status(200).json({
            success: true,
            message: 'Device found',
            data: device_data
        })
    } catch (error) {
        console.error('Error in Device Get endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        })
    }
}


module.exports = {
    rebootDevice,
    getDeviceById,
    getAllDevices,
    getAllUserDevices,
    getSingleUserDevice,
    createDevice,
    updateDevice,
    deleteDevice,
    getSingleUserDeviceById,
    deleteDeviceByUserId,
    getUserDevicesByUserId,
    getAllAssignDevices,
    getSingleAssignDevice,
    getPublicDeviceByDeviceUuid
};