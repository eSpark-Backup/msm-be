const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
    try {
        const { user_id } = req.user;
        const { page = 1, limit = 10, unread_only = false } = req.query;

        const query = { user_id };
        if (unread_only === 'true') {
            query.is_read = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Notification.countDocuments(query);
        const unread_count = await Notification.countDocuments({ 
            user_id, 
            is_read: false 
        });

        if(total == 0){
            res.status(404).json({
                success: false,
                message: 'No notifications found',
            })
        }

        res.status(200).json({
            success: true,
            count: total,
            unread_count,
            message: 'Notifications retrieved successfully',
            data: notifications
        });
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const readAllNotifications = async (req, res) => {
    try {
        const { user_id } = req.params;

        const result = await Notification.updateMany(
            { user_id, is_read: false },
            { is_read: true }
        );

        res.status(200).json({
            success: true,
            count: result.modifiedCount,
            message: 'All notifications marked as read',
        });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const createNotification = async (user_id, message) => {
    try {
        const notification = await Notification.create({
            user_id,
            message,
        });
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

module.exports = {
    getNotifications,
    readAllNotifications,
    createNotification,
};
