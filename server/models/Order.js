const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  medicineId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  image: { type: String }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Preparing', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'], 
    default: 'Preparing' 
  },
  statusStep: { type: Number, default: 1 }, // 1: Preparing, 2: Packed, 3: Out for Delivery, 4: Delivered
  shippingAddress: {
    fullName: { type: String, default: 'John Doe' },
    phone: { type: String, default: '+91 98765 43210' },
    street: { type: String, default: '123 Healthcare Way, Sector 4' },
    city: { type: String, default: 'Mumbai' },
    pincode: { type: String, default: '400001' }
  },
  paymentMethod: { type: String, enum: ['UPI', 'Credit/Debit Cards', 'Cash on Delivery (COD)'], default: 'UPI' },
  isPaid: { type: Boolean, default: true },
  estimatedDelivery: { type: String, default: 'Today, by 6:00 PM' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
