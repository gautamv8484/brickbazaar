const Product = require('../models/Product');
const User = require('../models/User');

// ========== Haversine Formula (Distance in KM) ==========
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null;

  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * 
    Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal
};

// @route   GET /api/products
// @desc    Get all products with distance sorting
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    // Get buyer location from query params
    const { lat, lng, search, category } = req.query;
    const buyerLat = lat ? parseFloat(lat) : null;
    const buyerLng = lng ? parseFloat(lng) : null;

    console.log('🔍 Products request - Buyer location:', buyerLat, buyerLng);

    // Build query
    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Fetch products
    let products = await Product.find(query).sort({ createdAt: -1 });

    // If buyer location available, calculate distances
    if (buyerLat && buyerLng) {
      products = products.map(product => {
        const productObj = product.toObject();
        
        if (product.hasSellerLocation && product.sellerLat && product.sellerLng) {
          const distance = calculateDistance(
            buyerLat, buyerLng,
            product.sellerLat, product.sellerLng
          );
          productObj.distance = distance;
          productObj.distanceText = distance !== null ? `${distance} km` : 'Unknown';
        } else {
          productObj.distance = null;
          productObj.distanceText = 'Location N/A';
        }

        return productObj;
      });

      // Sort: 
      // 1. Products WITH location (nearest first)
      // 2. Products WITHOUT location (last)
      products.sort((a, b) => {
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;  // No location → last
        if (b.distance === null) return -1; // No location → last
        return a.distance - b.distance;     // Nearest first
      });

      // Group products by distance
      const nearYou = products.filter(p => p.distance !== null && p.distance <= 5);
      const nearby = products.filter(p => p.distance !== null && p.distance > 5 && p.distance <= 10);
      const others = products.filter(p => p.distance === null || p.distance > 10);

      console.log(`📍 Near You: ${nearYou.length}, Nearby: ${nearby.length}, Others: ${others.length}`);

      return res.json({
        success: true,
        count: products.length,
        hasLocation: true,
        groups: {
          nearYou,
          nearby,
          others
        },
        products // Also send flat array
      });
    }

    // No buyer location - send all products without distance
    res.json({
      success: true,
      count: products.length,
      hasLocation: false,
      products
    });

  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @route   POST /api/products
// @desc    Add new product (seller only)
// @access  Private (Seller)
exports.addProduct = async (req, res) => {
  try {
    const { 
      name, category, price, unit, 
      quantity, description, image, location 
    } = req.body;

    if (!name || !category || !price || !unit || !quantity || !description || !location) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields' 
      });
    }

    // Get seller's location from User model
    const seller = await User.findById(req.user.id);
    const hasSellerLocation = !!(seller.lat && seller.lng);

    console.log('📍 Seller location:', hasSellerLocation ? `${seller.lat}, ${seller.lng}` : 'Not available');

    // Create product with seller location
    const product = await Product.create({
      name,
      category,
      price,
      unit,
      quantity,
      description,
      image: image || 'https://via.placeholder.com/400?text=Product+Image',
      location,
      seller: req.user.id,
      sellerName: req.user.name,
      sellerPhone: req.user.phone,
      sellerEmail: req.user.email,
      // ========== NEW: Seller Location ==========
      sellerCity: seller.city || '',
      sellerLat: seller.lat || null,
      sellerLng: seller.lng || null,
      hasSellerLocation
      // ==========================================
    });

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @route   PUT /api/products/:id
// @desc    Update product (seller only - own products)
// @access  Private (Seller)
exports.updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to update this product' 
      });
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @route   DELETE /api/products/:id
// @desc    Delete product (seller only - own products)
// @access  Private (Seller)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    if (product.seller.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to delete this product' 
      });
    }

    await product.deleteOne();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @route   GET /api/products/seller/me
// @desc    Get logged in seller's products
// @access  Private (Seller)
exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};