const mongoose = require('mongoose');
const User = require('../models/User');
const Role = require('../models/Role');
require('dotenv').config();

const seedUsers = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find the super_admin role
        const superAdminRole = await Role.findOne({ name: 'super_admin' });
        if (!superAdminRole) {
            throw new Error('Super admin role not found. Please run role seeds first.');
        }

        // Clear existing users (optional - remove if you want to keep existing users)
        await User.deleteMany({});
        console.log('Cleared existing users');

        // Create super admin user
        const superAdminUser = {
            name: 'Super Admin',
            email: 'superadmin@msm.com',
            password: 'SuperAdmin123!', // This will be hashed by the pre-save hook
            role_id: superAdminRole._id,
            description: 'System Super Administrator',
            method: 'manual',
            owner: 'system'
        };

        const createdUser = await User.create(superAdminUser);
        console.log('Super admin user created successfully:', {
            id: createdUser._id,
            name: createdUser.name,
            email: createdUser.email,
            role: superAdminRole.name
        });

        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding users:', error);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    seedUsers();
}

module.exports = { seedUsers };
