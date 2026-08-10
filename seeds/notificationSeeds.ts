require('dotenv').config();
const mongoose = require('mongoose');
const Device = require('../models/Device');
const Notification = require('../models/Notification');
const NotificationRead = require('../models/NotificationRead');

const createDummyNotifications = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Get specific device for seeding
        const device = await Device.findOne({ device_uuid: 'ESP90000005' });
        
        if (!device) {
            console.log('Device ESP90000005 not found. Please create this device first.');
            return;
        }

        console.log(`Found device: ${device.device_uuid} for seeding notifications`);

        // Delete existing notifications
        // const deleteResult = await Notification.deleteMany({});
        // console.log(`Deleted ${deleteResult.deletedCount} existing notifications`);

        // Delete existing notification reads
        // const deleteReadsResult = await NotificationRead.deleteMany({});
        // console.log(`Deleted ${deleteReadsResult.deletedCount} existing notification reads`);

        // Create 10 dummy notifications for ESP90000005 (matching FleetConnect format)
        const dummyMessages = [
            "GSM Status: connected",
            "GSM Status: disconnected",
            "GSM Status: weak_signal",
            "MQTT Status: connected",
            "MQTT Status: disconnected",
            "GSM Status: no_signal",
            "MQTT Status: connection_lost",
            "GSM Status: roaming",
            "MQTT Status: authentication_successful",
            "GSM Status: network_timeout"
        ];

        const notifications = [];
        
        for (let i = 0; i < dummyMessages.length; i++) {
            const notification = await Notification.create({
                device_uuid: device.device_uuid,
                message: dummyMessages[i]
            });
            notifications.push(notification);
        }

        console.log(`Created ${notifications.length} dummy notifications for device ESP90000005`);
        
        // Count created notifications
        const totalNotifications = await Notification.countDocuments();
        console.log(`Total notifications: ${totalNotifications}`);
        console.log(`All notifications are unread - ready for testing`);

    } catch (error) {
        console.error('Error creating dummy notifications:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

// Run the seed function
createDummyNotifications();
