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