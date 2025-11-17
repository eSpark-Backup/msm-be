const User = require('../models/User');
const UserDevices = require('../models/UserDevices');
const crypto = require('crypto');
const { sendWelcomeEmail } = require('../emailService');
const Role = require('../models/Role');

const getAllUsers = async (req, res) => {
  try {
    const { search, page, limit } = req.query;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const super_admin_role = await Role.findOne({ name: "super_admin" });

    const query = {
        role_id: { $ne: super_admin_role._id },
        _id: { $ne: req.user._id },
    };

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const count = await User.countDocuments(query);

    const users = await User.find(query)
      .populate("role")
      .populate("groupsData")
      .populate("devicesData")
      .populate({
        path: "userDevicesData",
        populate: {
          path: "device_data",
          populate: [
            { path: "groups_data" },
            { path: "device_data" }
          ]
        }
      })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count,              
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};


// Get single user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('role').populate('groupsData').populate('devicesData').populate({
            path: 'userDevicesData',
            populate: {
                path: 'device_data',
                populate: [{
                    path: 'groups_data',
                }, {
                    path: 'device_data',
                }]
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
};

// Get single user by ID
const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('role').populate('groupsData').populate('devicesData').populate({
            path: 'userDevicesData',
            populate: {
                path: 'device_data',
                populate: [{
                    path: 'groups_data',
                }, {
                    path: 'device_data',
                }]
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error.message
        });
    }
};

// Generate random password
const generateRandomPassword = () => {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, charset.length);
        password += charset[randomIndex];
    }
    return password;
};


// Create new user
const createUser = async (req, res) => {
    try {
        const password = generateRandomPassword();
        req.body.password = password;

        let userDevices = req.body.userDevices || [];

        const user = new User(req.body);
        await user.save();

        if(userDevices.length > 0){
            userDevices = userDevices.map(deviceId => ({
                user_id: user._id,
                device_id: deviceId,
              }));
            await UserDevices.insertMany(userDevices);
        }

        const populatedUser = await User.findById(user._id).populate('role').populate('groupsData').populate('devicesData').populate({
            path: 'userDevicesData',
            populate: {
                path: 'device_data',
                populate: [{
                    path: 'groups_data',
                }, {
                    path: 'device_data',
                }]
            }
        });
        await sendWelcomeEmail({
            to: user.email,
            name: user.name,
            password,
            loginUrl: process.env.FRONTEND_URL,
        });
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: populatedUser
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating user',
            error: error.message
        });
    }
};

// Update user
const updateUser = async (req, res) => {
    try {
        if (req.files) {
            if (req.files.profile_image?.[0]) {
                req.body.profile_image = req.files.profile_image[0].filename;
            }
            if (req.files.logo?.[0]) {
                req.body.logo = req.files.logo[0].filename;
            }
        }

        let userDevices = req.body?.userDevices || [];

        if(userDevices.length > 0){

            await UserDevices.deleteMany({ user_id: req.params.id });

            userDevices = userDevices.map(deviceId => ({
                user_id: req.params.id,
                device_id: deviceId,
              }));
            await UserDevices.insertMany(userDevices);
        }else{
            await UserDevices.deleteMany({ user_id: req.params.id });
        }
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('role').populate('groupsData').populate('devicesData').populate({
            path: 'userDevicesData',
            populate: {
                path: 'device_data',
                populate: [{
                    path: 'groups_data',
                }, {
                    path: 'device_data',
                }]
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
};

// Update user
const updateMe = async (req, res) => {
    try {
        if (req.files) {
            if (req.files.profile_image?.[0]) {
                req.body.profile_image = req.files.profile_image[0].filename;
            }
            if (req.files.logo?.[0]) {
                req.body.logo = req.files.logo[0].filename;
            }
        }

        let userDevices = req.body?.userDevices || [];

        if(userDevices.length > 0){

            await UserDevices.deleteMany({ user_id: req.user._id });

            userDevices = userDevices.map(deviceId => ({
                user_id: req.user._id,
                device_id: deviceId,
              }));
            await UserDevices.insertMany(userDevices);
        }
        
        const user = await User.findByIdAndUpdate(
            req.user._id,
            req.body,
            { new: true, runValidators: true }
        ).populate('role').populate('groupsData').populate('devicesData').populate({
            path: 'userDevicesData',
            populate: {
                path: 'device_data',
                populate: [{
                    path: 'groups_data',
                }, {
                    path: 'device_data',
                }]
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
};



// Delete user
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await UserDevices.deleteMany({ user_id: req.params.id });

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getMe,
    updateMe
};