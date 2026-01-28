require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Notification = require('../models/Notification');

const createDummyNotifications = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get user by email
        const user = await User.findOne({ email: 'eintechnologylabs@gmail.com' });
        
        if (!user) {
            console.log('User not found with email: eintechnologylabs@gmail.com');
            return;
        }

        console.log(`Found user: ${user.name} (${user._id})`);

        // Delete existing notifications for this user
        const deleteResult = await Notification.deleteMany({ user_id: user._id });
        console.log(`Deleted ${deleteResult.deletedCount} existing notifications`);

        // Create dummy notifications
        const dummyMessages = [
            "Welcome to MSM Dashboard! Your account has been successfully created.",
            "New device added to your network. Please check your devices list.",
            "System maintenance scheduled for tonight at 2:00 AM.",
            "Your monthly report is ready for download.",
            "Security alert: New login detected from your account.",
            "Device 'Sensor-001' is offline and needs attention.",
            "New firmware update available for your devices.",
            "Your subscription will expire in 7 days. Please renew.",
            "Congratulations! You've reached 100 active devices.",
            "System backup completed successfully.",
            "New user invitation sent to your team members.",
            "Device 'Gateway-002' battery is running low.",
            "Weekly analytics report is now available.",
            "Security scan completed - no threats detected.",
            "New feature released: Real-time monitoring dashboard."
        ];

        const notifications = [];
        
        for (let i = 0; i < dummyMessages.length; i++) {
            const notification = await Notification.create({
                user_id: user._id,
                message: dummyMessages[i],
                is_read: Math.random() > 0.7 // Randomly mark some as read (30% chance)
            });
            notifications.push(notification);
        }

        console.log(`Created ${notifications.length} dummy notifications for user ${user.email}`);
        
        // Count created notifications
        const totalNotifications = await Notification.countDocuments({ user_id: user._id });
        const unreadNotifications = await Notification.countDocuments({ user_id: user._id, is_read: false });
        
        console.log(`Total notifications: ${totalNotifications}`);
        console.log(`Unread notifications: ${unreadNotifications}`);
        console.log(`Read notifications: ${totalNotifications - unreadNotifications}`);

    } catch (error) {
        console.error('Error creating dummy notifications:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the seed function
createDummyNotifications();
