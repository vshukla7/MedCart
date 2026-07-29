const Category = require('./models/Category');
const Medicine = require('./models/Medicine');
const Order = require('./models/Order');
const Reminder = require('./models/Reminder');
const ChatMessage = require('./models/ChatMessage');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const categories = [
  { name: 'Tablets', slug: 'tablets', icon: 'pill', color: '#E8F5E9', itemCount: 42 },
  { name: 'Baby Care', slug: 'baby-care', icon: 'baby-carriage', color: '#FFF3E0', itemCount: 28 },
  { name: 'Diabetes', slug: 'diabetes', icon: 'heart-pulse', color: '#FFEBEE', itemCount: 35 },
  { name: 'Personal Care', slug: 'personal-care', icon: 'sparkles', color: '#E3F2FD', itemCount: 50 }
];

const medicines = [
  {
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
  },
  {
    name: 'Amoxicillin 500mg Antibiotic',
    genericName: 'Amoxicillin Trihydrate',
    category: 'tablets',
    price: 110,
    originalPrice: 140,
    discount: '21% OFF',
    isTodayOffer: false,
    isPopular: true,
    rating: 4.6,
    reviewsCount: 165,
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=500&auto=format&fit=crop&q=60',
    description: 'Broad-spectrum antibiotic used to treat bacterial infections.',
    dosage: '1 capsule every 8 hours as prescribed by doctor.',
    requiresPrescription: true,
    inStock: true,
    manufacturer: 'MediCure Labs'
  }
];

const seedData = async () => {
  try {
    if (Category.db && Category.db.readyState === 1) {
      await Category.deleteMany({});
      await Category.insertMany(categories);

      await Medicine.deleteMany({});
      await Medicine.insertMany(medicines);

      // Clear all transactional logs to deliver a completely clean database
      await Order.deleteMany({});
      console.log('[Seed] Orders collection cleared completely.');

      await Reminder.deleteMany({});
      console.log('[Seed] Reminders collection cleared completely.');

      await ChatMessage.deleteMany({});
      console.log('[Seed] ChatMessages collection cleared completely.');

      // Clear custom/test users and reset to baseline developer roles
      await User.deleteMany({});
      const adminHash = await bcrypt.hash('admin123', 10);
      const staffHash = await bcrypt.hash('staff123', 10);
      const userHash = await bcrypt.hash('user123', 10);

      await User.insertMany([
        { phone: '+91 99999 99999', name: 'Admin User', role: 'admin', password: adminHash },
        { phone: '+91 88888 88888', name: 'Staff User', role: 'staff', password: staffHash },
        { phone: '+91 77777 77777', name: 'Standard User', role: 'user', password: userHash }
      ]);
      console.log('[Seed] Baseline users reset and seeded successfully.');

      console.log('[Seed] Database seeded successfully with MedCart pharmacy data!');
    } else {
      console.log('[Seed] Database connection not active yet, skipping seed execution.');
    }
  } catch (err) {
    console.error('[Seed Error]', err.message);
  }
};

module.exports = seedData;
