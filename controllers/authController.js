const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const crypto = require('crypto');
const { sendForgetPasswordEmail } = require('../emailService');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).populate('role');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        // Remove password from response
        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error.message
        });
    }
};

// Logout user (client-side token removal)
const logout = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error logging out',
            error: error.message
        });
    }
};

const changePassword = async (req , res) => {
    try {
        const { newPassword , oldPassword } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Old password is incorrect'
            });
        }

        if (oldPassword === newPassword) {
            return res.status(400).json({
                success: false,
                message: 'New password cannot be same as old password'
            });
        }        

        user.password = newPassword;
        user.isPasswordChanged = true;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully',
            user
        });
    }catch(err){
        console.log(err)
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: err.message
        });
    }
}

const forgetPassword = async  (req , res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const resetToken = crypto.randomInt(100000, 999999);
        const expiryTime = Date.now() + 30 * 60 * 1000;
        user.resetToken = resetToken;
        user.resetTokenExpiry = expiryTime;
        
        await user.save();

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        
        await sendForgetPasswordEmail({
            to: user.email,
            name: user.name,
            resetLink,
            expiryTime: 30,
        });
        
        res.status(200).json({
            success: true,
            message: 'Password reset email sent successfully'
        });
    }catch(err){
        console.log(err)
        res.status(500).json({
            success: false,
            message: 'Error sending password reset email',
            error: err.message
        });
    }
}

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const user = await User.findOne({
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

        user.password = newPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Password has been reset successfully"
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Error resetting password",
            error: err.message
        });
    }
};

module.exports = {
    login,
    logout,
    changePassword,
    forgetPassword,
    resetPassword
};