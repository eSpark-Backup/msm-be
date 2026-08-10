const { seedRoles } = require('./roleSeeds');
const { seedUsers } = require('./userSeeds');

const runAllSeeds = async () => {
    try {
        console.log('Starting database seeding...');
        
        // First seed roles
        console.log('\n--- Seeding Roles ---');
        await seedRoles();
        
        // Then seed users (depends on roles)
        console.log('\n--- Seeding Users ---');
        await seedUsers();
        
        console.log('\n✅ All seeds completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

// Run if called directly
if (require.main === module) {
    runAllSeeds();
}

module.exports = { runAllSeeds };
