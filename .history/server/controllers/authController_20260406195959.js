const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
exports.register = async (req, res) => {
  try {
    console.log('📝 Registration request received');
    console.log('Body:', req.body);
    
    const { name, email, phone, password, role } = req.body;

    // Validate input
    if (!name || !email || !phone || !password || !role) {
      console.log('❌ Missing fields');
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Email already registered:', email);
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }

    console.log('🔄 Creating user...');
    
    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role
    });

    console.log('✅ User created successfully!');
    console.log('User ID:', user._id);
    console.log('User Email:', user.email);

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('❌ Registration error:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
exports.login = async (req, res) => {
  try {
    console.log('🔐 Login attempt');
    console.log('Body:', req.body);
    
    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email, password, and role' 
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Password incorrect');
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    // Check role match
    if (user.role !== role) {
      console.log('❌ Role mismatch');
      return res.status(403).json({ 
        success: false,
        message: `This account is registered as a ${user.role}. Please select the correct role.` 
      });
    }

    console.log('✅ Login successful for:', user.email);

    // Generate token
    const token = generateToken(user._id);

    // Send response
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};