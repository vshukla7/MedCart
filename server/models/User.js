const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: 'User'
  },
  role: {
    type: String,
    enum: ['admin', 'staff', 'user'],
    default: 'user'
  },
  address: {
    type: String,
    default: '123 Healthcare Way, Sector 4, Mumbai, 400001'
  },
  latitude: {
    type: Number,
    default: 19.0760
  },
  longitude: {
    type: Number,
    default: 72.8777
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
