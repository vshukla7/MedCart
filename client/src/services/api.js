const API_BASE_URL = 'http://localhost:5000/api';

// Fallback Initial Data for seamless instant preview
const MOCK_CATEGORIES = [
  { _id: '1', name: 'Tablets', slug: 'tablets', icon: 'pill', color: '#E8F5E9', itemCount: 42 },
  { _id: '2', name: 'Baby Care', slug: 'baby-care', icon: 'baby-carriage', color: '#FFF3E0', itemCount: 28 },
  { _id: '3', name: 'Diabetes', slug: 'diabetes', icon: 'heart-pulse', color: '#FFEBEE', itemCount: 35 },
  { _id: '4', name: 'Personal Care', slug: 'personal-care', icon: 'sparkles', color: '#E3F2FD', itemCount: 50 }
];

const MOCK_MEDICINES = [
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
    inStock: true
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
    inStock: true
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
    inStock: true
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
    inStock: true
  },
  {
    _id: 'm5',
    name: 'Accu-Chek Blood Sugar Strips',
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
    inStock: true
  }
];

export const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`);
    const json = await res.json();
    if (json.success && json.data) return json.data;
  } catch (e) {
    console.log('[API Offline] Returning mock categories');
  }
  return MOCK_CATEGORIES;
};

export const fetchMedicines = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/medicines?${query}`);
    const json = await res.json();
    if (json.success && json.data) return json.data;
  } catch (e) {
    console.log('[API Offline] Filtering mock medicines');
  }

  let list = [...MOCK_MEDICINES];
  if (params.category && params.category !== 'all') {
    list = list.filter(m => m.category === params.category.toLowerCase());
  }
  if (params.offer === 'true') {
    list = list.filter(m => m.isTodayOffer);
  }
  if (params.popular === 'true') {
    list = list.filter(m => m.isPopular);
  }
  if (params.search) {
    const term = params.search.toLowerCase();
    list = list.filter(m => 
      m.name.toLowerCase().includes(term) || 
      (m.genericName && m.genericName.toLowerCase().includes(term))
    );
  }
  return list;
};

export const fetchLatestOrder = async (userId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/latest?userId=${userId || ''}`);
    const json = await res.json();
    if (json.success && json.data) return json.data;
  } catch (e) {
    console.log('[API Offline] Using fallback order tracking state');
  }
  return {
    _id: 'ord_101',
    orderNumber: 'MED-784920',
    items: [{ name: 'Paracetamol 650mg Extra', quantity: 2, price: 45 }],
    totalAmount: 90,
    status: 'Out for Delivery',
    statusStep: 3,
    estimatedDelivery: 'Today, by 6:00 PM'
  };
};

let clientInMemOrders = [
  {
    _id: 'ord_101',
    orderNumber: 'MED-784920',
    items: [{ name: 'Paracetamol 650mg Extra', quantity: 2, price: 45 }],
    totalAmount: 90,
    deliveryCharge: 20,
    grandTotal: 110,
    status: 'Out for Delivery',
    statusStep: 3,
    paymentMethod: 'Cash on Delivery (COD)',
    createdAt: new Date().toISOString(),
    shippingAddress: { fullName: 'Standard User', phone: '+91 77777 77777', street: '123 Healthcare Way, Sector 4, Mumbai, 400001' }
  }
];

export const fetchOrders = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/orders?${query}`);
    const json = await res.json();
    if (json.success && json.data) return json.data;
  } catch (e) {
    console.log('[API Offline] Error fetching orders');
  }
  
  // Offline simulation fallback
  let list = [...clientInMemOrders];
  if (params.userId) {
    list = list.filter(o => o.userId === params.userId);
  }
  return list;
};

export const createOrder = async (orderData) => {
  const offlineOrder = {
    _id: 'ord_' + Date.now(),
    orderNumber: 'MED-' + Math.floor(100000 + Math.random() * 900000),
    ...orderData,
    status: 'Pending',
    statusStep: 1,
    createdAt: new Date().toISOString()
  };

  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const json = await res.json();
    if (json.success && json.data) {
      clientInMemOrders.unshift(json.data);
      return json.data;
    }
  } catch (e) {
    console.log('[API Offline] Created offline order record');
  }

  clientInMemOrders.unshift(offlineOrder);
  return offlineOrder;
};

export const confirmOrder = async (orderId, confirmedBy) => {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/confirm`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmedBy })
    });
    const json = await res.json();
    if (json.success && json.data) {
      const idx = clientInMemOrders.findIndex(o => o._id === orderId);
      if (idx > -1) {
        clientInMemOrders[idx] = json.data;
      }
      return json;
    }
  } catch (e) {
    console.log('[API Offline] Error confirming order');
  }

  // Offline fallback
  const idx = clientInMemOrders.findIndex(o => o._id === orderId);
  if (idx > -1) {
    clientInMemOrders[idx] = {
      ...clientInMemOrders[idx],
      status: 'Confirmed',
      statusStep: 2,
      confirmedBy: confirmedBy
    };
    return { success: true, data: clientInMemOrders[idx] };
  }
  return { success: false };
};

export const assignOrder = async (orderId, staffId) => {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffId })
    });
    const json = await res.json();
    if (json.success && json.data) {
      const idx = clientInMemOrders.findIndex(o => o._id === orderId);
      if (idx > -1) {
        clientInMemOrders[idx] = json.data;
      }
      return json;
    }
  } catch (e) {
    console.log('[API Offline] Error assigning order');
  }

  // Offline fallback
  const idx = clientInMemOrders.findIndex(o => o._id === orderId);
  if (idx > -1) {
    clientInMemOrders[idx] = {
      ...clientInMemOrders[idx],
      status: 'Packed',
      statusStep: 3,
      assignedStaff: staffId
    };
    return { success: true, data: clientInMemOrders[idx] };
  }
  return { success: false };
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const json = await res.json();
    if (json.success && json.data) {
      const idx = clientInMemOrders.findIndex(o => o._id === orderId);
      if (idx > -1) {
        clientInMemOrders[idx] = json.data;
      }
      return json;
    }
  } catch (e) {
    console.log('[API Offline] Error updating status');
  }

  // Offline fallback
  const idx = clientInMemOrders.findIndex(o => o._id === orderId);
  if (idx > -1) {
    const statusMap = {
      'Pending': 1,
      'Confirmed': 2,
      'Packed': 3,
      'Out for Delivery': 4,
      'Delivered': 5,
      'Cancelled': 0
    };
    clientInMemOrders[idx] = {
      ...clientInMemOrders[idx],
      status: status,
      statusStep: statusMap[status] || 0,
      isPaid: status === 'Delivered' ? true : clientInMemOrders[idx].isPaid
    };
    return { success: true, data: clientInMemOrders[idx] };
  }
  return { success: false };
};

export const fetchSalesAnalytics = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/sales-analytics`);
    const json = await res.json();
    if (json.success && json.data) return json.data;
  } catch (e) {
    console.log('[API Offline] Error fetching analytics');
  }
  return {
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
  };
};

// Client-Side API handlers for Login, Register, Forgot Password, and Admin Role management

export const loginUser = async (phone, password) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });
    const json = await res.json();
    return json;
  } catch (e) {
    console.log('[API Offline] Simulating offline login');
    // Offline Simulation
    const mockDb = [
      { phone: '+91 99999 99999', name: 'Admin User', role: 'admin', password: 'admin123' },
      { phone: '+91 88888 88888', name: 'Staff User', role: 'staff', password: 'staff123' },
      { phone: '+91 77777 77777', name: 'Standard User', role: 'user', password: 'user123' }
    ];
    const match = mockDb.find(u => u.phone === phone && u.password === password);
    if (match) {
      return { success: true, token: 'mock_token', user: { phone: match.phone, name: match.name, role: match.role, _id: 'u_' + match.role } };
    }
    return { success: false, message: 'Invalid phone or password' };
  }
};

export const registerUser = async (phone, password, name) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password, name, role: 'user' })
    });
    const json = await res.json();
    return json;
  } catch (e) {
    console.log('[API Offline] Simulating offline registration');
    return { success: true, token: 'mock_token', user: { phone, name: name || 'User', role: 'user', _id: 'u_' + Date.now() } };
  }
};

export const forgotPasswordUser = async (phone, newPassword) => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, newPassword })
    });
    const json = await res.json();
    return json;
  } catch (e) {
    console.log('[API Offline] Simulating offline forgot-password');
    return { success: true, message: 'Password updated successfully (offline mode)' };
  }
};

export const searchUsersByPhone = async (phone) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/search?phone=${encodeURIComponent(phone)}`);
    const json = await res.json();
    if (json.success) return json.data;
  } catch (e) {
    console.log('[API Offline] Simulating user role search');
  }
  const mockDb = [
    { _id: 'u_admin', phone: '+91 99999 99999', name: 'Admin User', role: 'admin' },
    { _id: 'u_staff', phone: '+91 88888 88888', name: 'Staff User', role: 'staff' },
    { _id: 'u_user', phone: '+91 77777 77777', name: 'Standard User', role: 'user' }
  ];
  return mockDb.filter(u => u.phone.includes(phone));
};

export const updateUserRole = async (userId, role) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    const json = await res.json();
    return json;
  } catch (e) {
    console.log('[API Offline] Simulating user role update');
    return { success: true, message: 'Role updated successfully (offline mode)' };
  }
};

export const broadcastNotification = async (title, body) => {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/notifications/broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, body })
    });
    const json = await res.json();
    return json;
  } catch (e) {
    console.log('[API Offline] Simulating manual broadcast');
    return { success: true, message: 'Notification broadcast successfully (offline mode)' };
  }
};

export const updateUserProfile = async (userId, payload) => {
  try {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    return json;
  } catch (e) {
    console.log('[API Offline] Simulating profile update');
    return { success: true, message: 'Profile updated successfully (offline mode)', data: payload };
  }
};
