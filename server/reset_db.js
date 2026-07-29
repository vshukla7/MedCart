const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const seedData = require('./seed');

const reset = async () => {
  try {
    console.log('Connecting to database to perform reset...');
    await connectDB();
    console.log('Seeding baseline data and wiping orders/history...');
    await seedData();
    console.log('Database reset completed successfully.');
    await mongoose.disconnect();
    console.log('Disconnected from database.');
    process.exit(0);
  } catch (e) {
    console.error('Error during database reset:', e);
    process.exit(1);
  }
};

reset();
