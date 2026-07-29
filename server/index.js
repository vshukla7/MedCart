const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const seedData = require('./seed');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'MedCart Pharmacy Backend API', timestamp: new Date() });
});

// API Endpoints
app.use('/api', apiRoutes);

// Connect DB & start server
const startServer = async () => {
  await connectDB();
  await seedData();
  
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 MedCart Backend Server is running on port ${PORT}`);
    console.log(`📡 API Health Check: http://localhost:${PORT}/health`);
    console.log(`💊 Categories API: http://localhost:${PORT}/api/categories`);
    console.log(`📦 Medicines API:  http://localhost:${PORT}/api/medicines`);
    console.log(`====================================================`);
  });
};

startServer();
