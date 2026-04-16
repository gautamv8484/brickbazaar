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

    const { 
      name, email, phone, password, role,
      // ========== NEW: Location Fields ==========
      address, city, pincode, lat, lng
      // ==========================================
    } = req.body;

    // Validate required input
    if (!name || !email || !phone || !password || !role) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }

    // Check location data
    const hasLocation = !!(lat && lng);

    console.log('🔄 Creating user...');
    console.log('📍 Location:', hasLocation ? `${lat}, ${lng}` : 'Not provided');

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      password,
      role,
      // ========== NEW: Save Location ==========
      address: address || '',
      city: city || '',
      pincode: pincode || '',
      lat: lat || null,
      lng: lng || null,
      hasLocation
      // ========================================
    });

    console.log('✅ User created successfully!');

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
        role: user.role,
        // ========== NEW: Return Location ==========
        address: user.address,
        city: user.city,
        pincode: user.pincode,
        lat: user.lat,
        lng: user.lng,
        hasLocation: user.hasLocation
        // ==========================================
      },
      token
    });
  } catch (error) {
    console.error('❌ Registration error:', error.message);
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
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide email, password, and role' 
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    if (user.role !== role) {
      return res.status(403).json({ 
        success: false,
        message: `This account is registered as a ${user.role}. Please select the correct role.` 
      });
    }

    console.log('✅ Login successful for:', user.email);

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        // ========== NEW: Return Location ==========
        address: user.address,
        city: user.city,
        pincode: user.pincode,
        lat: user.lat,
        lng: user.lng,
        hasLocation: user.hasLocation
        // ==========================================
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