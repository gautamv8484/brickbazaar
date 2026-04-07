const Product = require('../models/Product');

// @route   GET /api/products
// @desc    Get all products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    
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
    const { name, category, price, unit, quantity, description, image, location } = req.body;

    // Validate input
    if (!name || !category || !price || !unit || !quantity || !description || !location) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required fields' 
      });
    }

    // Create product with seller info
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
      sellerEmail: req.user.email
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

    // Check if user owns the product
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

    // Check if user owns the product
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