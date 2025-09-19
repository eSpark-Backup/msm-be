const User = require('../models/User');


// Get all users
const getAllUsers = async (req, res) => {
    try {
      const { search, page, limit } = req.query;
  
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 0;
      const skip = limitNum ? (pageNum - 1) * limitNum : 0;
  
      const users = await User.aggregate([
        // Exclude current user
        {
          $match: {
            _id: { $ne: req.user._id }
          }
        },
        // Populate role
        {
          $lookup: {
            from: "roles", // collection name for Role
            localField: "role_id",
            foreignField: "_id",
            as: "role"
          }
        },
        { $unwind: "$role" },
        // Exclude super_admin role
        {
          $match: {
            "role.name": { $ne: "super_admin" }
          }
        },
        // Populate groups
        {
          $lookup: {
            from: "groups", // collection name for Groups
            localField: "_id",
            foreignField: "user_id",
            as: "groupsData"
          }
        },
        // Populate devices
        {
          $lookup: {
            from: "devices", // collection name for Devices
            localField: "_id",
            foreignField: "user_id",
            as: "devicesData"
          }
        },
        // Add total_devices_count field
        {
          $addFields: {
            total_devices_count: { $size: "$devicesData" }
          }
        },
        // Search filter
        ...(search
          ? [
              {
                $match: {
                  name: { $regex: search, $options: "i" }
                }
              }
            ]
          : []),
        // Pagination
        { $skip: skip },
        ...(limitNum ? [{ $limit: limitNum }] : [])
      ]);
  
      res.status(200).json({
        success: true,
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
        const user = await User.findById(req.params.id).populate('role').populate('groupsData').populate('devicesData');
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

// Create new user
const createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const populatedUser = await User.findById(user._id).populate('role').populate('groupsData').populate('devicesData');
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
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('role').populate('groupsData').populate('devicesData');
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
    deleteUser
};