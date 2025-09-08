const mongoose = require('mongoose');
const Role = require('../models/Role');
require('dotenv').config();

const roleSeeds = [
    {
        name: 'super_admin'
    },
    {
        name: 'admin'
    }
];

const seedRoles = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing roles
        await Role.deleteMany({});
        console.log('Cleared existing roles');

        // Insert seed roles
        const createdRoles = await Role.insertMany(roleSeeds);
        console.log('Roles seeded successfully:', createdRoles);

        // Close connection
        await mongoose.connection.close();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error seeding roles:', error);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    seedRoles();
}

module.exports = { seedRoles, roleSeeds };
