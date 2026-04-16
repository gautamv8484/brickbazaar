const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const createAdmin = async () => {
  try {
    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@brickbazaar.com' });

    if (existingAdmin) {
      console.log('⚠️ Admin already exists!');
      console.log('Email: admin@brickbazaar.com');
      console.log('Password: Admin@123');
      process.exit(0);
    }

    // Create admin
    const admin = await User.create({
      name: 'BrickBazaar Admin',
      email: 'admin@brickbazaar.com',
      phone: '9999999999',
      password: 'Admin@123',
      role: 'admin',
      city: 'Ahmedabad',
      address: 'BrickBazaar HQ',
      pincode: '380001'
    });

    console.log('✅ Admin created successfully!');
    console.log('================================');
    console.log('Email:    admin@brickbazaar.com');
    console.log('Password: Admin@123');
    console.log('Role:     admin');
    console.log('================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createAdmin();