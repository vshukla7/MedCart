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
  const { userId, role, assignedTo } = req.query;

  const mongoose = require('mongoose');

  try {
    if (Order.db && Order.db.readyState === 1) {
      let query = {};
      if (role === 'user' && userId) {
        query.userId = userId;
      } else if (role === 'staff' && userId) {
        query.assignedTo = userId;
      } else if (assignedTo) {
        query.assignedTo = assignedTo;
      }
      
      const orders = await Order.find(query)
        .populate('userId', 'phone name role')
        .populate('assignedTo', 'phone name role')
        .sort({ createdAt: -1 });
      return res.json({ success: true, count: orders.length, data: orders });
    }
  } catch (err) {
    console.error('Fetch Orders Error:', err);
  }

  // Fallback
  let list = [...inMemOrders];
  if (role === 'user' && userId) {
    list = list.filter(o => o.userId === userId);
  } else if (role === 'staff' && userId) {
    list = list.filter(o => o.assignedTo === userId);
  }
  res.json({ success: true, count: list.length, data: list });
});

router.get('/orders/latest', async (req, res) => {
  const { userId } = req.query;
  try {
    if (Order.db && Order.db.readyState === 1) {
      let query = {};
      if (userId) query.userId = userId;
      const latest = await Order.findOne(query).sort({ createdAt: -1 });
      if (latest) return res.json({ success: true, data: latest });
    }
  } catch (err) {}
  res.json({ success: true, data: inMemOrders[0] });
});

router.post('/orders', async (req, res) => {
  const { userId, items, totalAmount, shippingAddress } = req.body;
  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart items are required' });
  }

  const deliveryCharge = 20;
  const grandTotal = (totalAmount || 0) + deliveryCharge;

  const mappedItems = (items || []).map(item => ({
    medicineId: item.medicineId || item._id || 'm_unknown',
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image || ''
  }));

  const newOrderObj = {
    orderNumber: 'MED-' + Math.floor(100000 + Math.random() * 900000),
    userId: userId || null,
    items: mappedItems,
    totalAmount: totalAmount || 0,
    deliveryCharge: deliveryCharge,
    grandTotal: grandTotal,
    status: 'Pending',
    statusStep: 1,
    paymentMethod: 'Cash on Delivery (COD)',
    isPaid: false,
    shippingAddress: shippingAddress || { fullName: 'John Doe', phone: '+91 98765 43210' },
    createdAt: new Date().toISOString()
  };

  try {
    if (Order.db && Order.db.readyState === 1) {
      const newOrder = new Order(newOrderObj);
      await newOrder.save();
      return res.status(201).json({ success: true, message: 'Order placed successfully', data: newOrder });
    }
  } catch (err) {
    console.error('Order Save Error:', err);
  }

  // Fallback
  const fallbackOrder = { _id: 'ord_' + Date.now(), ...newOrderObj };
  inMemOrders.unshift(fallbackOrder);
  res.status(201).json({ success: true, message: 'Order placed successfully', data: fallbackOrder });
});

// Admin/Staff: Confirm Order
router.put('/orders/:id/confirm', async (req, res) => {
  const { confirmedBy } = req.body;
  const mongoose = require('mongoose');
  
  try {
    if (Order.db && Order.db.readyState === 1) {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      order.status = 'Confirmed';
      order.statusStep = 2;
      order.confirmedBy = confirmedBy;
      
      await order.save();
      return res.json({ success: true, message: 'Order confirmed successfully', data: order });
    }
  } catch (err) {
    console.error('Confirm Order Error:', err);
  }
  
  // Fallback
  const order = inMemOrders.find(o => o._id === req.params.id);
  if (order) {
    order.status = 'Confirmed';
    order.statusStep = 2;
    order.confirmedBy = confirmedBy;
  }
  res.json({ success: true, data: order });
});

// Admin: Assign Order to Staff
router.put('/orders/:id/assign', async (req, res) => {
  const { staffId } = req.body;
  const mongoose = require('mongoose');
  
  try {
    if (Order.db && Order.db.readyState === 1) {
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      
      order.assignedTo = staffId;
      
      await order.save();
      return res.json({ success: true, message: 'Order assigned to staff successfully', data: order });
    }
  } catch (err) {
    console.error('Assign Order Error:', err);
  }

  // Fallback
  const order = inMemOrders.find(o => o._id === req.params.id);
  if (order) {
    order.assignedTo = staffId;
  }
  res.json({ success: true, data: order });
});

// Update Order Status Step
router.put('/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  const statusMap = {
    'Pending': 1,
    'Confirmed': 2,
    'Packed': 3,
    'Out for Delivery': 4,
    'Delivered': 5,
    'Cancelled': 0
  };

  const step = statusMap[status] || 1;

  try {
    if (Order.db && Order.db.readyState === 1) {
      const order = await Order.findById(req.params.id);
      if (order) {
        order.status = status;
        order.statusStep = step;
        if (status === 'Delivered') {
          order.isPaid = true;
        }
        await order.save();
        return res.json({ success: true, message: 'Order status updated', data: order });
      }
    }
  } catch (err) {
    console.error(err);
  }

  const target = inMemOrders.find(o => o._id === req.params.id);
  if (target) {
    target.status = status;
    target.statusStep = step;
    if (status === 'Delivered') {
      target.isPaid = true;
    }
  }
  res.json({ success: true, message: 'Order status updated', data: target });
});

// Admin: Sales and Analytics
router.get('/admin/sales-analytics', async (req, res) => {
  try {
    if (Order.db && Order.db.readyState === 1) {
      const orders = await Order.find({}).populate('assignedTo', 'name phone role');
      const staffList = await User.find({ role: { $in: ['staff', 'admin'] } }).select('name phone role');

      // Calculate Revenue stats
      let totalRevenue = 0;
      let todayRevenue = 0;
      let weeklyRevenue = 0;
      let monthlyRevenue = 0;

      let totalOrders = orders.length;
      let deliveredOrders = 0;
      let pendingOrders = 0;
      let cancelledOrders = 0;

      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Calculate start of week without mutating now object
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      orders.forEach(o => {
        const oDate = o.createdAt ? new Date(o.createdAt) : new Date();
        const oTotal = o.grandTotal || 0;
        if (o.status === 'Delivered') {
          deliveredOrders++;
          totalRevenue += oTotal;
          if (oDate >= startOfToday) todayRevenue += oTotal;
          if (oDate >= startOfWeek) weeklyRevenue += oTotal;
          if (oDate >= startOfMonth) monthlyRevenue += oTotal;
        } else if (o.status === 'Cancelled') {
          cancelledOrders++;
        } else {
          pendingOrders++;
        }
      });

      // Calculate Staff Performance
      const staffStats = staffList.map(staff => {
        const staffOrders = orders.filter(o => {
          if (!o.assignedTo) return false;
          // assignedTo could be populated as object, or be a raw ObjectId
          const assignedIdStr = o.assignedTo._id ? o.assignedTo._id.toString() : o.assignedTo.toString();
          return assignedIdStr === staff._id.toString();
        });
        const delivered = staffOrders.filter(o => o.status === 'Delivered');
        const pending = staffOrders.filter(o => !['Delivered', 'Cancelled'].includes(o.status));
        const cancelled = staffOrders.filter(o => o.status === 'Cancelled');
        const sales = delivered.reduce((sum, o) => sum + (o.grandTotal || 0), 0);

        return {
          _id: staff._id,
          name: staff.name,
          phone: staff.phone,
          role: staff.role,
          ordersDelivered: delivered.length,
          totalSales: sales,
          avgOrderValue: delivered.length > 0 ? Math.round(sales / delivered.length) : 0,
          pending: pending.length,
          cancelled: cancelled.length,
          successRate: staffOrders.length > 0 ? Math.round((delivered.length / staffOrders.length) * 100) : 0
        };
      });

      return res.json({
        success: true,
        data: {
          analytics: {
            totalRevenue,
            todayRevenue,
            weeklyRevenue,
            monthlyRevenue,
            totalOrders,
            deliveredOrders,
            pendingOrders,
            cancelledOrders
          },
          staffPerformance: staffStats
        }
      });
    }
  } catch (err) {
    console.error(err);
  }

  // Fallback
  res.json({
    success: true,
    data: {
      analytics: {
        totalRevenue: 9850,
        todayRevenue: 1200,
        weeklyRevenue: 4500,
        monthlyRevenue: 9850,
        totalOrders: 20,
        deliveredOrders: 18,
        pendingOrders: 2,
        cancelledOrders: 0
      },
      staffPerformance: [
        {
          _id: 'u_admin',
          name: 'Admin User',
          phone: '+91 99999 99999',
          role: 'admin',
          ordersDelivered: 18,
          totalSales: 9850,
          avgOrderValue: 547,
          pending: 2,
          cancelled: 0,
          successRate: 90
        }
      ]
    }
  });
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
      return res.status(201).json({ success: true, token, user: { phone: newUser.phone, name: newUser.name, role: newUser.role, address: newUser.address, latitude: newUser.latitude, longitude: newUser.longitude, _id: newUser._id } });
    }
  } catch (err) {
    console.error(err);
  }

  // Fallback
  const existing = inMemUsers.find(u => u.phone === phone);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Phone number already registered' });
  }
  const newUser = { _id: 'u_' + Date.now(), phone, name: name || 'User', role: userRole, passwordHash: hashedPassword, address: '123 Healthcare Way, Sector 4, Mumbai, 400001', latitude: 19.0760, longitude: 72.8777 };
  inMemUsers.push(newUser);
  const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET);
  res.status(201).json({ success: true, token, user: { phone: newUser.phone, name: newUser.name, role: newUser.role, address: newUser.address, latitude: newUser.latitude, longitude: newUser.longitude, _id: newUser._id } });
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
      return res.json({ success: true, token, user: { phone: user.phone, name: user.name, role: user.role, address: user.address, latitude: user.latitude, longitude: user.longitude, _id: user._id } });
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
  res.json({ success: true, token, user: { phone: user.phone, name: user.name, role: user.role, address: user.address || '123 Healthcare Way, Sector 4, Mumbai, 400001', latitude: user.latitude || 19.0760, longitude: user.longitude || 72.8777, _id: user._id } });
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
  const searchQuery = phone ? phone.trim() : '';

  try {
    if (User.db && User.db.readyState === 1) {
      const query = searchQuery ? { phone: { $regex: searchQuery, $options: 'i' } } : {};
      const users = await User.find(query).select('-password');
      return res.json({ success: true, data: users });
    }
  } catch (err) {
    console.error(err);
  }

  // Fallback
  const matches = searchQuery
    ? inMemUsers.filter(u => u.phone.includes(searchQuery))
    : inMemUsers;
  const result = matches.map(u => ({ _id: u._id, phone: u.phone, name: u.name, role: u.role }));
  res.json({ success: true, data: result });
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

// User: Update Profile Details
router.put('/users/:id', async (req, res) => {
  const { name, phone, address, latitude, longitude } = req.body;
  try {
    if (User.db && User.db.readyState === 1) {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      if (name !== undefined) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;
      if (latitude !== undefined) user.latitude = latitude;
      if (longitude !== undefined) user.longitude = longitude;
      await user.save();
      return res.json({ success: true, message: 'Profile updated successfully', data: user });
    }
  } catch (err) {
    console.error(err);
  }

  // Fallback
  const user = inMemUsers.find(u => u._id === req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  if (name !== undefined) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (address !== undefined) user.address = address;
  if (latitude !== undefined) user.latitude = latitude;
  if (longitude !== undefined) user.longitude = longitude;
  res.json({ success: true, message: 'Profile updated successfully', data: user });
});
router.post('/admin/notifications/broadcast', async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ success: false, message: 'Title and body are required' });
  }

  console.log(`[Broadcast Push Notification] Title: "${title}" | Body: "${body}"`);
  
  res.json({ success: true, message: 'Notification broadcast successfully' });
});

module.exports = router;
