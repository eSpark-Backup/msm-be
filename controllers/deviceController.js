const mqttClient = require('../fleetConnect');
const Device = require('../models/Device');
const AddDevice = require('../models/AddDevice');
const UserDevices = require('../models/UserDevices');

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

        const device = await Device.findById(device_id);

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
  
      const devices = await Device.find(query).skip(skip).limit(limitNum);
  
      res.status(200).json({
        success: true,
        message: "Devices found",
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

        const { search, page, limit } = req.query;
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
    
        const devices = await AddDevice.find(query).skip(skip).limit(limitNum).populate("device_data").populate("groups_data");
        
        if(devices.length == 0){
            return res.status(404).json({
                success: false,
                message: 'Devices Not Found'
            })
        }

        res.status(200).json({
          success: true,
          message: "Devices found",
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
        const query = {user_id: req.user._id};

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
            }]
        });
        
        if(devices.length == 0){
            return res.status(404).json({
                success: false,
                message: 'Devices Not Found'
            })
        }

        res.status(200).json({
          success: true,
          message: "Devices found",
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

        const device = await Device.findOne({device_uuid: device_uuid});


        if(!device){
            return res.status(404).json({
                success: false,
                message: 'Device Not Found'
            })
        }     

        let query = { device_id: device._id };

        if(req.user.role.name !== "super_admin"){
            query.user_id = req.user._id;
        }
    
        const userDevice = await AddDevice.findOne(query).populate("device_data").populate("groups_data");
    
        if(userDevice){
            res.status(200).json({
                success: true,
                message: "User Device found",
                data: userDevice
            });
        }else{
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

        const device = await Device.findOne({device_uuid: device_uuid});


        if(!device){
            return res.status(404).json({
                success: false,
                message: 'Device Not Found'
            })
        }     

        const addDevice = await AddDevice.findOne({device_id: device._id});

        if(!addDevice){
            return res.status(404).json({
                success: false,
                message: 'Device Not Found'
            })
        }

        let query = { user_id: req.user._id , device_id: addDevice._id };

        const userDevice = await UserDevices.findOne(query).populate("user_data").populate({
            path: 'device_data',
            populate: [{
                path: 'groups_data',
            }, {
                path: 'device_data',
            }]
        });

        if(userDevice){
            res.status(200).json({
                success: true,
                message: "User Device found",
                data: userDevice
            });
        }else{
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
    try{
        const { id } = req.params;
        const query = { user_id: id };
    
        const device = await AddDevice.find(query).populate("device_data").populate("groups_data");
    
        if(device && device.length > 0){
            res.status(200).json({
                success: true,
                message: "Devices found",
                data: device
            });
        }else{
            res.status(404).json({
                success: false,
                message: "Devices Not Found"
            });
        }
    }catch(error){
        console.error("Error in Device Get Single endpoint:", error);
        res.status(500).json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
}

const getUserDevicesByUserId = async (req, res) => {
    try{
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
    
        if(device && device.length > 0){
            res.status(200).json({
                success: true,
                message: "Devices found",
                data: device
            });
        }else{
            res.status(404).json({
                success: false,
                message: "Devices Not Found"
            });
        }
    }catch(error){
        console.error("Error in Device Get Single endpoint:", error);
        res.status(500).json({
          success: false,
          message: "Internal Server Error",
          error: error.message,
        });
    }
}

  const createDevice = async (req , res) => {
    try {
        const user_id = req.user._id;
        const device_uuid = req.body.device_uuid;

        const device_data = await Device.findOne({device_uuid: device_uuid});

        if(!device_data){
            return res.status(404).json({
                success: false,
                message: 'Device Not Found'
            })
        }

        if(req.body.mqtt_password !== device_data.device_pass){
            return res.status(400).json({
                success: false,
                message: 'Invalid Credentials'
            })
        }

        const device = await AddDevice.create({...req.body, user_id: user_id , device_id: device_data._id});
        res.status(201).json({
            success: true,
            message: 'Device created successfully',
            data: device
        })
    } catch (error) {
        console.error('Error in Device Create endpoint:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            error: error.message,
        })
    }
  }

  const updateDevice = async (req , res) => {
    try {
        const { device_uuid } = req.params;
        const user_id = req.user._id

        const device_data = await Device.findOne({device_uuid: device_uuid});

        if(!device_data){
            return res.status(404).json({
                success: false,
                message: 'Device Not Found'
            })
        }

        const userDevice = await AddDevice.findOneAndUpdate({device_id: device_data._id , user_id: user_id }, req.body, { new: true }).populate('groups_data').populate('device_data');
        
        if(userDevice){
            res.status(200).json({
                success: true,
                message: 'Device updated successfully',
                data: userDevice
            })
        }else{
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
  
  const deleteDevice = async (req , res) => {
    try {
        const { device_uuid } = req.params;
        const user_id = req.user._id;

        const device_data = await Device.findOne({device_uuid: device_uuid});

        if(!device_data){
            return res.status(404).json({
                success: false,
                message: 'Device Not Found'
            })
        }    

        const userDevice = await AddDevice.findOne({device_id: device_data._id , user_id: user_id});

        if(!userDevice){
            return res.status(404).json({
                success: false,
                message: 'User Device Not Found'
            })
        }    

        await AddDevice.deleteMany({device_id: device_data._id , user_id: user_id});
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

  const deleteDeviceByUserId = async (req , res) => {
    try {
        const { device_uuid , user_id } = req.params;

        const device_data = await Device.findOne({device_uuid: device_uuid});

        if(!device_data){
            return res.status(404).json({
                success: false,
                message: 'Device Not Found'
            })
        }
        
        const userDevice = await AddDevice.findOne({device_id: device_data._id , user_id: user_id});

        if(!userDevice){
            return res.status(404).json({
                success: false,
                message: 'User Device Not Found'
            })
        }    

        await AddDevice.findOneAndDelete({ device_id: device_data._id , user_id: user_id});

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
    getSingleAssignDevice
};