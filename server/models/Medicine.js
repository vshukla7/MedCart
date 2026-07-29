const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genericName: { type: String },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  discount: { type: String }, // e.g. "20% OFF"
  isTodayOffer: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 124 },
  image: { type: String, required: true },
  description: { type: String },
  dosage: { type: String },
  requiresPrescription: { type: Boolean, default: false },
  inStock: { type: Boolean, default: true },
  manufacturer: { type: String, default: 'MedCart Labs' }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
