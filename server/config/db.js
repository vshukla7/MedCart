const mongoose = require('mongoose');

const connectDB = async () => {
  const connUri = process.env.MONGO_URI;
  if (!connUri) {
    console.error('[MongoDB Error] MONGO_URI is not defined in the environment variables (.env)');
    process.exit(1);
  }
  
  try {
    await mongoose.connect(connUri);
    console.log(`[MongoDB] Connected successfully to Atlas`);
  } catch (err) {
    console.error('[MongoDB Error] Failed to connect to MongoDB Atlas:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
