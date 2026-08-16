const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  medicineId: { type: String },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 1 },
  image: { type: String }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  userId: { type: String, ref: 'User' },
  assignedTo: { type: String, ref: 'User' },
  confirmedBy: { type: String, ref: 'User' },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  deliveryCharge: { type: Number, default: 20 },
  grandTotal: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'], 
    default: 'Pending' 
  },
  statusStep: { type: Number, default: 1 }, // 1: Pending, 2: Confirmed, 3: Packed, 4: Out for Delivery, 5: Delivered
  shippingAddress: {
    fullName: { type: String, default: 'John Doe' },
    phone: { type: String, default: '+91 98765 43210' },
    street: { type: String, default: '123 Healthcare Way, Sector 4' },
    city: { type: String, default: 'Mumbai' },
    pincode: { type: String, default: '400001' }
  },
  paymentMethod: { type: String, enum: ['Cash on Delivery (COD)'], default: 'Cash on Delivery (COD)' },
  isPaid: { type: Boolean, default: false },
  estimatedDelivery: { type: String, default: 'Today, by 6:00 PM' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
