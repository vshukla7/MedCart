const mongoose = require('mongoose');

const connectDB = async () => {
  const connUri = process.env.MONGO_URI || 'mongodb+srv://medicalbhawani77_db_user:pSP5dtQ3V71OPjBa@medcart.1rnjcrd.mongodb.net/?appName=MedCart';
  
  // Non-blocking connection attempt
  mongoose.connect(connUri, { serverSelectionTimeoutMS: 2000 })
    .then(() => {
      console.log(`[MongoDB] Connected to local/remote MongoDB at ${mongoose.connection.host}`);
    })
    .catch((err) => {
      console.log('[MongoDB] Local database not found (ECONNREFUSED). Enabling fast memory mode.');
      
      // Try memory server non-blocking
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        MongoMemoryServer.create({ instance: { dbName: 'medcart' } })
          .then(mem => {
            const uri = mem.getUri();
            return mongoose.connect(uri);
          })
          .then(() => console.log('[MongoDB Memory Server] Connected!'))
          .catch(() => console.log('[MongoDB Memory] Memory server download skipped. Using API memory fallback mode.'));
      } catch (e) {
        console.log('[MongoDB] Memory server module optional. Using API memory fallback mode.');
      }
    });
};

module.exports = connectDB;
