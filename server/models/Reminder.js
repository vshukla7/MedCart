const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  dosage: { type: String, default: '1 Tablet after food' },
  time: { type: String, required: true }, // e.g. "08:00 AM"
  frequency: { type: String, default: 'Daily' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);
