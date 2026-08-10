const Notification = require('../models/Notification');
const NotificationRead = require('../models/NotificationRead');
const Device = require('../models/Device');
const socketService = require('../sockets/socket');

const getNotifications = async (req, res) => {
    try {
        const { _id, role } = req.user;
        const { page = 1, limit = 10, unread_only = false } = req.query;

        // Get devices based on user role (lean for faster query)
        let deviceUuids;
        if (role.name === 'admin' || role.name === 'super_admin') {
            const allDevices = await Device.find({}).select('device_uuid').lean();
            deviceUuids = allDevices.map(device => device.device_uuid);
        } else {
            const userDevices = await Device.find({}).select('device_uuid').lean();
            deviceUuids = userDevices.map(device => device.device_uuid);
        }

        // Get read notification IDs for this user (lean for faster query)
        const readNotifications = await NotificationRead.find({ 
            user_id: _id 
        }).select('notification_id').lean();

        const readNotificationIds = readNotifications.map(rn => rn.notification_id.toString());

        // Build query based on unread_only filter
        let query = { device_uuid: { $in: deviceUuids } };
        if (unread_only === 'true') {
            query._id = { $nin: readNotificationIds };
        }

        // Get notifications with pagination (lean for faster query)
        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        // Mark notifications as read/unread for this user
        const notificationsWithReadStatus = notifications.map(notification => ({
            ...notification,
            is_read: readNotificationIds.includes(notification._id.toString())
        }));

        // Get total count and unread count efficiently
        const [total, unread_count] = await Promise.all([
            Notification.countDocuments({ device_uuid: { $in: deviceUuids } }),
            Notification.countDocuments({ 
                device_uuid: { $in: deviceUuids }, 
                _id: { $nin: readNotificationIds } 
            })
        ]);

        let filteredNotifications = notificationsWithReadStatus;
        if (unread_only === 'true') {
            filteredNotifications = notificationsWithReadStatus.filter(n => !n.is_read);
        }

        if(total == 0){
            return res.status(404).json({
                success: false,
                message: 'No notifications found',
            })
        }

        res.status(200).json({
            success: true,
            count: total,
            unread_count,
            message: 'Notifications retrieved successfully',
            data: filteredNotifications
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

const markAllNotificationsAsRead = async (req, res) => {
    try {
        const { _id, role } = req.user;

        // Get devices based on user role
        let deviceUuids;
        if (role.name === 'admin' || role.name === 'super_admin') {
            const allDevices = await Device.find({}).select('device_uuid').lean();
            deviceUuids = allDevices.map(device => device.device_uuid);
        } else {
            const userDevices = await Device.find().select('device_uuid').lean();
            deviceUuids = userDevices.map(device => device.device_uuid);
        }

        // Get already read notification IDs for this user (lean for faster query)
        const existingReads = await NotificationRead.find({ 
            user_id: _id 
        }).select('notification_id').lean();

        const readNotificationIds = existingReads.map(rn => rn.notification_id.toString());

        // Get unread notifications for user's devices (lean for faster query)
        const unreadNotifications = await Notification.find({ 
            device_uuid: { $in: deviceUuids },
            _id: { $nin: readNotificationIds }
        }).select('_id').lean();

        // Prepare bulk insert operations
        const readOperations = unreadNotifications.map(notification => ({
            notification_id: notification._id,
            user_id: _id
        }));

        // Bulk insert if there are operations
        if (readOperations.length > 0) {
            await NotificationRead.insertMany(readOperations, { ordered: false });            
        }

        res.status(200).json({
            success: true,
            count: readOperations.length,
            message: `${readOperations.length} notifications marked as read`
        });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const createNotification = async (device_uuid, message) => {
    try {
        // Include device UUID in the message
        const messageWithUuid = `[Device: ${device_uuid}] ${message}`;
        
        const notification = await Notification.create({
            device_uuid,
            message: messageWithUuid,
        });

        // Emit notification to all connected clients
        socketService.emitToClients('new_notification', {
            _id: notification._id,
            device_uuid: notification.device_uuid,
            message: notification.message,
            createdAt: notification.createdAt,
            is_read: false // New notifications are unread by default
        });

        console.log(`🔔 Notification sent via socket: ${messageWithUuid}`);
        
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
};

module.exports = {
    getNotifications,
    markAllNotificationsAsRead,
    createNotification,
};
