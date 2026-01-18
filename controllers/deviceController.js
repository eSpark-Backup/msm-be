const mqttClient = require('../fleetConnect');
const Device = require('../models/Device');
const Ntp = require('../models/Ntp');
const Sftp = require('../models/Sftp');
const Measurements = require('../models/Measurements');
const AddDevice = require('../models/AddDevice');
const UserDevices = require('../models/UserDevices');
const fleetConnect = require('../fleetConnect');
const { decrypt } = require('../utils/enryption');
const MQTT = require('../models/Mqtt');
const MqttS = require('../models/Mqtts');
const OTA = require('../models/Ota');
const Telemetry = require('../models/Telemetry');

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
        const { search, page, limit, status_sort, created_sort, updated_sort } = req.query;
        const query = {};

        // Restrict to user devices if not super_admin
        if (req.user.role.name !== "super_admin") {
            query.user_id = req.user._id;
        }

        // Search by name
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 0;
        const skip = limitNum ? (pageNum - 1) * limitNum : 0;

        // Determine sort orders (1 or -1)
        let statusOrder;

        if (!status_sort) {
            // Status parameter missing → get ALL
            statusOrder = -2;
        } else if (status_sort === '1') {
            statusOrder = 1;
        } else if (status_sort === '0') {
            statusOrder = 0;
        } else {
            statusOrder = -1;
        }
        const createdOrder = created_sort === '1' ? 1 : -1;
        const updatedOrder = updated_sort === '1' ? 1 : -1;

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

            // Lookup OTA
            {
                $lookup: {
                    from: "otas",
                    localField: "device_data.device_uuid",
                    foreignField: "device_uuid",
                    as: "device_data.ota"
                }
            }
        ];

        switch (statusOrder) {
            case 0:
                pipeline.push({
                    $match: { "device_data.device_imei": "" }
                });
                break;

            case -1:
                pipeline.push({
                    $match: {
                        "device_data.device_status": true,
                        "device_data.device_imei": { $ne: "" }
                    }
                });
                break;

            case 1:
                pipeline.push({
                    $match: {
                        "device_data.device_status": false,
                        "device_data.device_imei": { $ne: "" }
                    }
                });
                break;
        }

        if (req.user.role.name === "super_admin") {
            pipeline.push({
                $group: {
                    _id: "$device_id",
                    doc: { $first: "$$ROOT" }
                }
            });
            pipeline.push({
                $replaceRoot: { newRoot: "$doc" }
            });
        }

        pipeline.push({
            $sort: {
                "device_data.device_status": -1,
                "device_data.device_imei": -1,
                createdAt: createdOrder,
                updatedAt: updatedOrder
            }
        });

        if (limitNum !== 0) {
            pipeline.push({ $skip: skip }, { $limit: limitNum });
        }

        const devices = await AddDevice.aggregate(pipeline);

        const countPipeline = pipeline.filter(stage => !stage.$skip && !stage.$limit);
        countPipeline.push({ $count: "total" });


        const countResult = await AddDevice.aggregate(countPipeline);
        const count = countResult[0] ? countResult[0].total : 0;

        if (devices.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Devices Not Found'
            });
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
};


const getAllAssignDevices = async (req, res) => {
    try {
        const { search, page, limit, status_sort, created_sort, updated_sort } = req.query;

        const query = { user_id: req.user._id };

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 0;
        const skip = limitNum ? (pageNum - 1) * limitNum : 0;

        // Build sort object for aggregation
        let sortObj = {};
        if (status_sort) sortObj['device_data.device_status'] = status_sort === "1" ? 1 : -1;
        if (created_sort) sortObj['createdAt'] = created_sort === "1" ? 1 : -1;
        if (updated_sort) sortObj['updatedAt'] = updated_sort === "1" ? 1 : -1;
        if (Object.keys(sortObj).length === 0) sortObj['createdAt'] = -1;

        // Aggregation pipeline
        const devicesPipeline = [
            { $match: query },
            {
                $lookup: {
                    from: "adddevices",
                    localField: "device_id",
                    foreignField: "_id",
                    as: "device_data"
                }
            },
            { $unwind: { path: "$device_data", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "groups",
                    localField: "device_data.group_id",
                    foreignField: "_id",
                    as: "device_data.groups_data"
                }
            },
            {
                $lookup: {
                    from: "devices",
                    localField: "device_data.device_id",
                    foreignField: "_id",
                    as: "device_data.device_data"
                }
            },
            { $unwind: { path: "$device_data.device_data", preserveNullAndEmptyArrays: true } },
            {
                $match: {
                    "device_data.device_data.device_imei": { $nin: ["", null] }
                }
            }
        ];

        // Add search filter on device_data.name if provided
        if (search) {
            devicesPipeline.push({
                $match: {
                    "device_data.name": { $regex: search, $options: "i" }
                }
            });
        }

        // OTA lookup
        devicesPipeline.push({
            $lookup: {
                from: "otas",
                localField: "device_data.device_data.device_uuid",
                foreignField: "device_uuid",
                as: "device_data.device_data.ota"
            }
        });

        devicesPipeline.push({ $sort: sortObj });

        const countPipeline = devicesPipeline.filter(
            stage => !stage.$skip && !stage.$limit
        );

        countPipeline.push({ $count: "total" });


        const countResult = await UserDevices.aggregate(countPipeline);
        const count = countResult[0] ? countResult[0].total : 0;

        devicesPipeline.push({ $skip: skip });
        if (limitNum) devicesPipeline.push({ $limit: limitNum });

        const devices = await UserDevices.aggregate(devicesPipeline);



        if (!devices.length) {
            return res.status(404).json({
                success: false,
                message: "Devices Not Found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Devices found",
            count,
            data: devices
        });

    } catch (error) {
        console.error("Error in Device Get All endpoint:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};


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

        const userDevice = await AddDevice.findOne(query).populate({ path: "device_data", populate: { path: "ota" } }).populate("groups_data");

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
        const { search, page, limit } = req.query;

        let query = {}

        query.user_id = id;

        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 0;
        const skip = limitNum ? (pageNum - 1) * limitNum : 0;

        const devices = await AddDevice.find(query)
            .skip(skip)
            .limit(limit)
            .populate({
                path: "device_data",
                populate: {
                    path: "ota"
                }
            })
            .populate("groups_data");

        const count = await AddDevice.countDocuments(query);

        if (devices.length > 0) {
            res.status(200).json({
                success: true,
                count: count,
                message: "Devices found",
                data: devices
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
};


const getUserDevicesByUserId = async (req, res) => {
    try {
        const { user_id } = req.params;
        const query = { user_id: user_id };

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const device = await UserDevices.find(query)
            .skip(skip)
            .limit(limit)
            .populate("user_data")
            .populate({
                path: 'device_data', populate:
                    [
                        { path: 'groups_data' },
                        {
                            path: 'device_data', populate:
                                { path: "ota" }
                        }]
            });

        const count = await UserDevices.countDocuments(query);

        if (device && device.length > 0) {
            res.status(200).json({
                success: true,
                message: "Devices found",
                count,
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

const deleteUserDevice = async (req, res) => {
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

const verifyDeviceByDeviceUuid = async (req, res) => {
    try {
        const { device_uuid, device_imei, device_pass } = req.body;

        if (!device_uuid || !device_imei || !device_pass) {
            return res.status(400).json({
                success: false,
                http_code: 400,
                message: "Missing required fields"
            });
        }

        const device = await Device.findOne({ device_uuid })
            .populate('measurements')
            .populate('ntp')
            .populate('sftp')
            .populate('mqtt')
            .populate('mqtts');


        const ct_ratio_measurements = device?.measurements.find(
            (m) => m.command === 'set-ct-ratio'
        );

        const v_offset_measurements = device?.measurements.find(
            (m) => m.command === 'set-v-offset'
        );

        const i_offset_measurements = device?.measurements.find(
            (m) => m.command === 'set-i-offset'
        );

        const data = {
            device_uuid,
            mqtt:{
                    broker_ip: device?.mqtt[0]?.broker_ip,
                    broker_port: device?.mqtt[0]?.broker_port,
                    broker_user: device?.mqtt[0]?.broker_user,
                    broker_pass: device?.mqtt[0]?.broker_pass,
                    data_interval: device?.mqtt[0]?.data_interval,
                    mqtt_topic: device?.mqtt[0]?.mqtt_topic,
                },
            sftp:{
                    server_ip: device?.sftp[0]?.server_ip,
                    server_port: device?.sftp[0]?.server_port,
                    username: device?.sftp[0]?.username,
                    password: device?.sftp[0]?.password,
                    data_interval: device?.sftp[0]?.data_interval,
                },
            ntp:{
                    server_1: device?.ntp[0]?.data?.get('server_1'),
                    server_2: device?.ntp[0]?.data?.get('server_2'),
                    server_3: device?.ntp[0]?.data?.get('server_3'),
                },
            mqtts:{
                    claim_cert: device?.mqtts[0]?.claim_cert,
                    claim_key: device?.mqtts[0]?.claim_key,
                    root_ca: device?.mqtts[0]?.root_ca,
                    data_interval: device?.mqtts[0]?.data_interval,
                    broker_ip: device?.mqtts[0]?.broker_ip,
                    broker_port: device?.mqtts[0]?.broker_port,
                },
            ct_ratio: Object.fromEntries(ct_ratio_measurements?.measurements ?? []),
            v_offset: Object.fromEntries(v_offset_measurements?.measurements ?? []),
            i_offset: Object.fromEntries(i_offset_measurements?.measurements ?? [])
        }

        const default_i_offset_measurements = {
            device_uuid,
            command: 'set-i-offset',
            measurements: {
                'command-1': 0,
                'command-2': 0,
                'command-3': 0,
                'command-4': 0,
                'command-5': 0,
                'command-6': 0,
                'command-7': 0,
                'command-8': 0,
                'command-9': 0,
                'command-10': 0,
                'command-11': 0,
                'command-12': 0
            }
        }

        const default_v_offset_measurements = {
            device_uuid,
            command: 'set-v-offset',
            measurements: {
                'command-1': 0,
                'command-2': 0,
                'command-3': 0,
                'command-4': 0,
                'command-5': 0,
                'command-6': 0,
                'command-7': 0,
                'command-8': 0,
                'command-9': 0,
                'command-10': 0,
                'command-11': 0,
                'command-12': 0
            }
        }

        const default_ct_ratio_measurements = {
            device_uuid,
            command: 'set-ct-ratio',
            measurements: {
                'command-1': 80,
                'command-2': 80,
                'command-3': 80,
                'command-4': 80,
                'command-5': 80,
                'command-6': 80,
                'command-7': 80,
                'command-8': 80,
                'command-9': 80,
                'command-10': 80,
                'command-11': 80,
                'command-12': 80
            }
        }

        const default_sftp = {
            device_uuid,
            server_ip: 'ap-southeast-1.sftpcloud.io',
            server_port: 22,
            username: 'ofp-msm',
            password: 'R0ot1@3456',
            data_interval: 900
        }

        const default_ntp = {
            device_uuid,
            data: {
                'server_1' : "my.pool.ntp.org", 
                'server_2' : "0.asia.pool.ntp.org", 
                'server_3' : "1.asia.pool.ntp.org"
            }
        }

        const default_mqtt = {
            device_uuid,
            broker_ip: "uiot.tnbr.com.my",
            broker_port: 8884,
            data_interval: 60,
            broker_user: "ofp-ein",
            broker_pass: "Ein@123456",
            mqtt_topic: "v1/devices/me/telemetry"
        }

        const default_mqtts = {
            device_uuid,
            broker_ip: "a1dxcxg260l7m-ats.iot.eu-north-1.amazonaws.com",
            data_interval: 10,
            broker_port: 8883,
            root_ca: false,
            claim_cert: false,
            claim_key: false
        }

        const removeDeviceUuidFromObject = (obj) => {
            const { device_uuid, ...rest } = obj;
            return rest;
        }

        const structureMeasurements = (data) => {
            let dynamic_field_name;
            switch(data.command){
                case "set-ct-ratio":
                    dynamic_field_name = "ct_ratio";
                    break;
                case "set-v-offset":
                    dynamic_field_name = "v_offset";
                    break;
                case "set-i-offset":
                    dynamic_field_name = "i_offset";
                    break;
                default:
                    dynamic_field_name = "commandIsNotCorrect";
                    break;
            }
            return {
                command: data.command,
                [dynamic_field_name]: data.measurements
            }
        }

        if (!device) {

            await Device.create({ device_uuid, device_imei, device_pass });
            await Ntp.create(default_ntp);
            await Sftp.create(default_sftp);
            await Measurements.create(default_ct_ratio_measurements)
            await Measurements.create(default_v_offset_measurements)
            await Measurements.create(default_i_offset_measurements)
            await MQTT.create(default_mqtt),
            await MqttS.create(default_mqtts)

            return res.status(201).json({
                success: true,
                http_code: 201,
                message: "UUID created Successfully",
                data: {
                    device_uuid,
                    ntp: {
                        "server_1": default_ntp.data.server_1, 
                        "server_2": default_ntp.data.server_2, 
                        "server_3": default_ntp.data.server_3
                    },
                    sftp: removeDeviceUuidFromObject(default_sftp),
                    mqtt: removeDeviceUuidFromObject(default_mqtt),
                    mqtts: removeDeviceUuidFromObject(default_mqtts),
                    ct_ratio : default_ct_ratio_measurements.measurements,
                    v_offset : default_v_offset_measurements.measurements,
                    i_offset : default_i_offset_measurements.measurements,
                }
            });
        }

        if (decrypt(device.device_pass) !== device_pass) {
            return res.status(401).json({
                success: false,
                http_code: 401,
                message: "Unauthorized - Password Is Not Correct"
            });
        }

        if (device.device_imei == device_imei) {
            return res.status(200).json({
                success: true,
                http_code: 200,
                message: "Login Successfully",
                data
            });
        } else {
            if (device.device_imei !== "") {
                return res.status(409).json({
                    success: false,
                    http_code: 409,
                    message: "UUID Have Already Another Device",
                })
            } else {
                device.device_imei = device_imei;
                await device.save();

                return res.status(202).json({
                    success: true,
                    http_code: 202,
                    message: "Device Assigned Successfully",
                    data
                });
            };
        }

    } catch (error) {
        console.error("Error in Device Get endpoint:", error);
        return res.status(500).json({
            success: false,
            http_code: 500,
            message: "Internal Server Error",
            error: error.message,
        });
    }
};

const unasignDevice = async (req, res) => {
    try {

        const device_uuid = req.params.device_uuid;

        const device = await Device.findOne({ device_uuid });

        console.log(device_uuid);

        if (!device) {
            return res.status(404).json({
                success: false,
                message: "Device Not Found",
            })
        }

        if (!device.device_imei) {
            return res.status(409).json({
                success: false,
                message: "Already Unattached"
            })
        }

        device.device_imei = "";

        await device.save();

        return res.status(200).json({
            success: true,
            message: "Imei Unattached"
        })

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: err.message
        })
    }
}

const deleteDevice = async (req, res) => {
  try {
    const { device_uuid } = req.params;

    const device = await Device.findOne({ device_uuid });
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device Not Found'
      });
    }

    const deviceId = device._id;

    // Delete related documents first (sequentially)
    await AddDevice.deleteMany({ device_id: deviceId });
    await UserDevices.deleteMany({ device_id: deviceId });
    await Measurements.deleteMany({ device_uuid });
    await Telemetry.deleteMany({ device_uuid });
    await Ntp.deleteMany({ device_uuid });
    await Sftp.deleteMany({ device_uuid });
    await MQTT.deleteMany({ device_uuid });
    await MqttS.deleteMany({ device_uuid });
    await OTA.deleteMany({ device_uuid });

    // Delete the device itself
    await Device.deleteOne({ _id: deviceId });

    return res.status(200).json({
      success: true,
      message: 'Device and related data deleted successfully'
    });
  } catch (error) {
    console.error('Error in full device delete:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message
    });
  }
};



module.exports = {
    rebootDevice,
    getDeviceById,
    getAllDevices,
    getAllUserDevices,
    getSingleUserDevice,
    createDevice,
    updateDevice,
    deleteUserDevice,
    getSingleUserDeviceById,
    deleteDeviceByUserId,
    getUserDevicesByUserId,
    getAllAssignDevices,
    getSingleAssignDevice,
    verifyDeviceByDeviceUuid,
    unasignDevice,
    deleteDevice
};