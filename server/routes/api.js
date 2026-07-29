const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Medicine = require('../models/Medicine');
const Order = require('../models/Order');
const Reminder = require('../models/Reminder');
const ChatMessage = require('../models/ChatMessage');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const seedData = require('../seed');

const JWT_SECRET = 'medcart_secret_key_123';

// In-Memory user fallback for instant resilience
let inMemUsers = [
  { _id: 'u1', phone: '+91 99999 99999', name: 'Admin User', role: 'admin', passwordHash: '' }, // populated on start/seed
  { _id: 'u2', phone: '+91 88888 88888', name: 'Staff User', role: 'staff', passwordHash: '' },
  { _id: 'u3', phone: '+91 77777 77777', name: 'Standard User', role: 'user', passwordHash: '' }
];

// Helper to initialize in-mem hashes
(async () => {
  inMemUsers[0].passwordHash = await bcrypt.hash('admin123', 10);
  inMemUsers[1].passwordHash = await bcrypt.hash('staff123', 10);
  inMemUsers[2].passwordHash = await bcrypt.hash('user123', 10);
})();


// Fallback collections for instant resilience
const FALLBACK_CATEGORIES = [
  { _id: 'c1', name: 'Tablets', slug: 'tablets', icon: 'pill', color: '#E8F5E9', itemCount: 42 },
  { _id: 'c2', name: 'Baby Care', slug: 'baby-care', icon: 'baby-carriage', color: '#FFF3E0', itemCount: 28 },
  { _id: 'c3', name: 'Diabetes', slug: 'diabetes', icon: 'heart-pulse', color: '#FFEBEE', itemCount: 35 },
  { _id: 'c4', name: 'Personal Care', slug: 'personal-care', icon: 'sparkles', color: '#E3F2FD', itemCount: 50 }
];

const FALLBACK_MEDICINES = [
  {
    _id: 'm1',
    name: 'Paracetamol 650mg Extra',
    genericName: 'Paracetamol',
    category: 'tablets',
    price: 45,
    originalPrice: 60,
    discount: '25% OFF',
    isTodayOffer: true,
    isPopular: true,
    rating: 4.9,
    reviewsCount: 312,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=60',
    description: 'Fast acting fever reducer and pain reliever for headaches and body aches.',
    dosage: '1 tablet every 6 hours after meals as prescribed.',
    requiresPrescription: false,
    inStock: true,
    manufacturer: 'MedCart Care Ltd'
  },
  {
    _id: 'm2',
    name: 'Glucophage 500mg (Metformin)',
    genericName: 'Metformin Hydrochloride',
    category: 'diabetes',
    price: 120,
    originalPrice: 150,
    discount: '20% OFF',
    isTodayOffer: true,
    isPopular: true,
    rating: 4.8,
    reviewsCount: 198,
    image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&auto=format&fit=crop&q=60',
    description: 'First-line medication for the treatment of type 2 diabetes mellitus.',
    dosage: '1 tablet twice daily with meals.',
    requiresPrescription: true,
    inStock: true,
    manufacturer: 'PharmaPlus'
  },
  {
    _id: 'm3',
    name: 'Gentle Baby Lotion 200ml',
    genericName: 'Moisturizing Cream',
    category: 'baby-care',
    price: 180,
    originalPrice: 220,
    discount: '18% OFF',
    isTodayOffer: true,
    isPopular: false,
    rating: 4.7,
    reviewsCount: 89,
    image: 'https://images.unsplash.com/photo-1512290900673-0eb7cfd515a4?w=500&auto=format&fit=crop&q=60',
    description: 'Nourishing hypoallergenic lotion keeping baby skin soft 24 hours.',
    dosage: 'Apply gently after bath.',
    requiresPrescription: false,
    inStock: true,
    manufacturer: 'Pure Baby Wellness'
  },
  {
    _id: 'm4',
    name: 'Vitamin C 1000mg Chewable',
    genericName: 'Ascorbic Acid',
    category: 'personal-care',
    price: 95,
    originalPrice: 130,
    discount: '27% OFF',
    isTodayOffer: true,
    isPopular: true,
    rating: 4.9,
    reviewsCount: 450,
    image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=500&auto=format&fit=crop&q=60',
    description: 'Immunity booster antioxidants chewable orange-flavored tablets.',
    dosage: '1 chewable tablet daily.',
    requiresPrescription: false,
    inStock: true,
    manufacturer: 'NutriHealth'
  },
  {
    _id: 'm5',
    name: 'Accu-Chek Blood Sugar Test Strips (50s)',
    genericName: 'Glucose Strips',
    category: 'diabetes',
    price: 850,
    originalPrice: 999,
    discount: '15% OFF',
    isTodayOffer: false,
    isPopular: true,
    rating: 4.9,
    reviewsCount: 520,
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=60',
    description: 'Precision blood glucose testing strips for diabetes monitoring.',
    dosage: 'Use with Accu-Chek glucometer.',
    requiresPrescription: false,
    inStock: true,
    manufacturer: 'Roche Diagnostics'
  }
];

let inMemOrders = [
  {
    _id: 'ord_101',
    orderNumber: 'MED-784920',
    items: [{ name: 'Paracetamol 650mg Extra', quantity: 2, price: 45 }],
    totalAmount: 90,
    grandTotal: 90,
    status: 'Out for Delivery',
    statusStep: 3,
    paymentMethod: 'UPI',
    estimatedDelivery: 'Today, by 6:00 PM',
    createdAt: new Date().toISOString()
  }
];

let inMemReminders = [
  { _id: 'r1', medicineName: 'Paracetamol 650mg', dosage: '1 Tablet after meal', time: '08:00 AM', isActive: true },
  { _id: 'r2', medicineName: 'Glucophage 500mg', dosage: '1 Tablet with dinner', time: '08:30 PM', isActive: true }
];

let inMemChat = [
  { _id: 'c1', sender: 'pharmacist', text: 'Hello! I am Dr. Sharma, your MedCart pharmacist. How can I help you today?', timestamp: new Date() }
];

// Categories API
router.get('/categories', async (req, res) => {
  try {
    if (Category.db && Category.db.readyState === 1) {
      const categories = await Category.find({});
      if (categories && categories.length > 0) {
        return res.json({ success: true, count: categories.length, data: categories });
      }
    }
  } catch (err) {}
  res.json({ success: true, count: FALLBACK_CATEGORIES.length, data: FALLBACK_CATEGORIES });
});

// Medicines API
router.get('/medicines', async (req, res) => {
  const { search, category, offer, popular } = req.query;
  try {
    if (Medicine.db && Medicine.db.readyState === 1) {
      let query = {};
      if (category && category !== 'all') query.category = category.toLowerCase();
      if (offer === 'true') query.isTodayOffer = true;
      if (popular === 'true') query.isPopular = true;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { genericName: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ];
      }
      const medicines = await Medicine.find(query).sort({ createdAt: -1 });
      if (medicines && medicines.length > 0) {
        return res.json({ success: true, count: medicines.length, data: medicines });
      }
    }
  } catch (err) {}

  let list = [...FALLBACK_MEDICINES];
  if (category && category !== 'all') {
    list = list.filter(m => m.category === category.toLowerCase());
  }
  if (offer === 'true') {
    list = list.filter(m => m.isTodayOffer);
  }
  if (popular === 'true') {
    list = list.filter(m => m.isPopular);
  }
  if (search) {
    const term = search.toLowerCase();
    list = list.filter(m => 
      m.name.toLowerCase().includes(term) || 
      (m.genericName && m.genericName.toLowerCase().includes(term))
    );
  }
  res.json({ success: true, count: list.length, data: list });
});

// Single Medicine Details
router.get('/medicines/:id', async (req, res) => {
  try {
    if (Medicine.db && Medicine.db.readyState === 1) {
      const medicine = await Medicine.findById(req.params.id);
      if (medicine) return res.json({ success: true, data: medicine });
    }
  } catch (err) {}

  const found = FALLBACK_MEDICINES.find(m => m._id === req.params.id) || FALLBACK_MEDICINES[0];
  res.json({ success: true, data: found });
});

// Orders API
router.get('/orders', async (req, res) => {
  try {
    if (Order.db && Order.db.readyState === 1) {
      const orders = await Order.find({}).sort({ createdAt: -1 });
      if (orders && orders.length > 0) {
        return res.json({ success: true, count: orders.length, data: orders });
      }
    }
  } catch (err) {}
  res.json({ success: true, count: inMemOrders.length, data: inMemOrders });
});

router.get('/orders/latest', async (req, res) => {
  try {
    if (Order.db && Order.db.readyState === 1) {
      const latest = await Order.findOne({ status: { $ne: 'Cancelled' } }).sort({ createdAt: -1 });
      if (latest) return res.json({ success: true, data: latest });
    }
  } catch (err) {}
  res.json({ success: true, data: inMemOrders[0] });
});

router.post('/orders', async (req, res) => {
  const { items, totalAmount, deliveryCharge, grandTotal, paymentMethod, shippingAddress } = req.body;
  const newOrderObj = {
    _id: 'ord_' + Date.now(),
    orderNumber: 'MED-' + Math.floor(100000 + Math.random() * 900000),
    items: items || [],
    totalAmount: totalAmount || 0,
    deliveryCharge: deliveryCharge || 0,
    grandTotal: grandTotal || totalAmount || 0,
    status: 'Preparing',
    statusStep: 1,
    paymentMethod: paymentMethod || 'UPI',
    shippingAddress: shippingAddress || { fullName: 'John Doe', phone: '+91 98765 43210' },
    createdAt: new Date().toISOString()
  };

  try {
    if (Order.db && Order.db.readyState === 1) {
      const newOrder = new Order(newOrderObj);
      await newOrder.save();
      return res.status(201).json({ success: true, message: 'Order placed successfully', data: newOrder });
    }
  } catch (err) {}

  inMemOrders.unshift(newOrderObj);
  res.status(201).json({ success: true, message: 'Order placed successfully', data: newOrderObj });
});

router.put('/orders/:id/step', async (req, res) => {
  const { step } = req.body;
  const stepsMap = { 1: 'Preparing', 2: 'Packed', 3: 'Out for Delivery', 4: 'Delivered' };

  try {
    if (Order.db && Order.db.readyState === 1) {
      const order = await Order.findById(req.params.id);
      if (order) {
        order.statusStep = step;
        order.status = stepsMap[step] || 'Preparing';
        await order.save();
        return res.json({ success: true, message: 'Order status updated', data: order });
      }
    }
  } catch (err) {}

  const target = inMemOrders.find(o => o._id === req.params.id);
  if (target) {
    target.statusStep = step;
    target.status = stepsMap[step] || 'Preparing';
  }
  res.json({ success: true, message: 'Order status updated', data: target || inMemOrders[0] });
});

// Reminders API
router.get('/reminders', async (req, res) => {
  try {
    if (Reminder.db && Reminder.db.readyState === 1) {
      const reminders = await Reminder.find({}).sort({ createdAt: -1 });
      if (reminders && reminders.length > 0) return res.json({ success: true, data: reminders });
    }
  } catch (err) {}
  res.json({ success: true, data: inMemReminders });
});

// Chat API
router.get('/chat', async (req, res) => {
  try {
    if (ChatMessage.db && ChatMessage.db.readyState === 1) {
      const messages = await ChatMessage.find({}).sort({ timestamp: 1 });
      if (messages && messages.length > 0) return res.json({ success: true, data: messages });
    }
  } catch (err) {}
  res.json({ success: true, data: inMemChat });
});

// Seed API
router.post('/seed', async (req, res) => {
  try {
    await seedData();
    res.json({ success: true, message: 'Seeded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AUTHENTICATION ROUTES

// Register
router.post('/auth/register', async (req, res) => {
  const { phone, password, name, role } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ success: false, message: 'Phone and password are required' });
  }

  const userRole = role || 'user';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    if (User.db && User.db.readyState === 1) {
      const existing = await User.findOne({ phone });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Phone number already registered' });
      }
      const newUser = new User({ phone, password: hashedPassword, name: name || 'User', role: userRole });
      await newUser.save();
      const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET);
      return res.status(201).json({ success: true, token, user: { phone: newUser.phone, name: newUser.name, role: newUser.role, _id: newUser._id } });
    }
  } catch (err) {
    console.error(err);
  }

  // Fallback
  const existing = inMemUsers.find(u => u.phone === phone);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Phone number already registered' });
  }
  const newUser = { _id: 'u_' + Date.now(), phone, name: name || 'User', role: userRole, passwordHash: hashedPassword };
  inMemUsers.push(newUser);
  const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET);
  res.status(201).json({ success: true, token, user: { phone: newUser.phone, name: newUser.name, role: newUser.role, _id: newUser._id } });
});

// Login
router.post('/auth/login', async (req, res) => {
  const { phone, password } = req.body;
  if (!phone || !password) {
    return res.status(400).json({ success: false, message: 'Phone and password are required' });
  }

  try {
    if (User.db && User.db.readyState === 1) {
      const user = await User.findOne({ phone });
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }
      const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
      return res.json({ success: true, token, user: { phone: user.phone, name: user.name, role: user.role, _id: user._id } });
    }
  } catch (err) {
    console.error(err);
  }

  // Fallback
  const user = inMemUsers.find(u => u.phone === phone);
  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid credentials' });
  }
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET);
  res.json({ success: true, token, user: { phone: user.phone, name: user.name, role: user.role, _id: user._id } });
});

// Forgot Password
router.post('/auth/forgot-password', async (req, res) => {
  const { phone, newPassword } = req.body;
  if (!phone || !newPassword) {
    return res.status(400).json({ success: false, message: 'Phone and new password are required' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    if (User.db && User.db.readyState === 1) {
      const user = await User.findOne({ phone });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      user.password = hashedPassword;
      await user.save();
      return res.json({ success: true, message: 'Password updated successfully' });
    }
  } catch (err) {
    console.error(err);
  }

  // Fallback
  const user = inMemUsers.find(u => u.phone === phone);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  user.passwordHash = hashedPassword;
  res.json({ success: true, message: 'Password updated successfully' });
});

// Admin: Search Users by Phone
router.get('/admin/users/search', async (req, res) => {
  const { phone } = req.query;
  if (!phone) {
    return res.status(400).json({ success: false, message: 'Phone search query is required' });
  }

  try {
    if (User.db && User.db.readyState === 1) {
      const users = await User.find({ phone: { $regex: phone, $options: 'i' } }).select('-password');
      return res.json({ success: true, data: users });
    }
  } catch (err) {
    console.error(err);
  }

  // Fallback
  const matches = inMemUsers
    .filter(u => u.phone.includes(phone))
    .map(u => ({ _id: u._id, phone: u.phone, name: u.name, role: u.role }));
  res.json({ success: true, data: matches });
});

// Admin: Update User Role
router.put('/admin/users/:id/role', async (req, res) => {
  const { role } = req.body;
  if (!role || !['admin', 'staff', 'user'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }

  try {
    if (User.db && User.db.readyState === 1) {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      user.role = role;
      await user.save();
      return res.json({ success: true, message: 'Role updated successfully', data: { _id: user._id, phone: user.phone, name: user.name, role: user.role } });
    }
  } catch (err) {
    console.error(err);
  }

  // Fallback
  const user = inMemUsers.find(u => u._id === req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  user.role = role;
  res.json({ success: true, message: 'Role updated successfully', data: { _id: user._id, phone: user.phone, name: user.name, role: user.role } });
});

module.exports = router;
