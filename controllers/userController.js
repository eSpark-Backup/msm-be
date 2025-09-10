const User = require('../models/User');

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().populate('role');
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// Get single user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate('role');
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
        const populatedUser = await User.findById(user._id).populate('role');
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
        ).populate('role');
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