const Order = require('../models/Order');
const Product = require('../models/Product');

// @route   POST /api/orders
// @desc    Create new order (buyer only)
// @access  Private (Buyer)
exports.createOrder = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide product ID and quantity' 
      });
    }

    // Get product details
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    // Check stock
    if (product.quantity < quantity) {
      return res.status(400).json({ 
        success: false,
        message: `Only ${product.quantity} ${product.unit}s available` 
      });
    }

    // Calculate total price
    const totalPrice = product.price * quantity;

    // Create order
    const order = await Order.create({
      product: productId,
      productName: product.name,
      seller: product.seller,
      sellerName: product.sellerName,
      buyer: req.user.id,
      buyerName: req.user.name,
      buyerEmail: req.user.email,
      buyerPhone: req.user.phone,
      quantity,
      totalPrice
    });

    // Update product quantity
    product.quantity -= quantity;
    await product.save();

    res.status(201).json({
      success: true,
      message: 'Order placed successfully! Seller has been notified.',
      order
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @route   GET /api/orders/buyer/me
// @desc    Get buyer's orders
// @access  Private (Buyer)
exports.getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.id })
      .populate('product', 'name image category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @route   GET /api/orders/seller/me
// @desc    Get seller's received orders
// @access  Private (Seller)
exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user.id })
      .populate('product', 'name image category')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @route   PUT /api/orders/:id/status
// @desc    Update order status (seller only)
// @access  Private (Seller)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid status' 
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Check if seller owns this order
    if (order.seller.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized' 
      });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};