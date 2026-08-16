const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');

const check = async () => {
  const connUri = process.env.MONGO_URI;
  if (!connUri) {
    console.error('MONGO_URI is missing from server/.env');
    process.exit(1);
  }
  
  try {
    await mongoose.connect(connUri);
    console.log('Connected to DB');
    const users = await User.find({});
    console.log('--- USERS IN DATABASE ---');
    users.forEach(u => {
      console.log(`ID: ${u._id} | Name: ${u.name} | Phone: ${u.phone} | Role: ${u.role}`);
    });
    console.log('-------------------------');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

check();
