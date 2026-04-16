const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');

// ==========================================
// 📊 DASHBOARD
// ==========================================

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Private (Admin)
exports.getDashboardStats = async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalBuyers = await User.countDocuments({ role: 'buyer' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalReviews = await Review.countDocuments();

    // Order stats
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
    const completedOrders = await Order.countDocuments({ status: 'completed' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    // Revenue
    const revenueResult = await Order.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Monthly revenue (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          status: 'completed',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Category distribution
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$quantity' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Recent orders (last 10)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('productName buyerName sellerName totalPrice status createdAt');

    // Recent users (last 5)
    const recentUsers = await User.find({ role: { $ne: 'admin' } })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role city createdAt isBanned');

    // Top sellers by revenue
    const topSellers = await Order.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$seller',
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
          sellerName: { $first: '$sellerName' }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      stats: {
        users: { total: totalUsers, buyers: totalBuyers, sellers: totalSellers, banned: bannedUsers },
        products: { total: totalProducts },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          confirmed: confirmedOrders,
          completed: completedOrders,
          cancelled: cancelledOrders
        },
        reviews: { total: totalReviews },
        revenue: { total: totalRevenue },
        monthlyRevenue,
        categoryStats,
        recentOrders,
        recentUsers,
        topSellers
      }
    });
  } catch (error) {
    console.error('❌ Dashboard error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 👥 USER MANAGEMENT
// ==========================================

// @route   GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;

    let query = { role: { $ne: 'admin' } };

    if (role && role !== 'all') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } }
      ];
      // Remove the admin filter from $or conflict
      if (role && role !== 'all') {
        query.role = role;
      } else {
        // Keep excluding admin
        query.$and = [{ role: { $ne: 'admin' } }];
        delete query.role;
      }
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      users
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/admin/users/:id/ban
exports.toggleBanUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot ban an admin' });
    }

    user.isBanned = !user.isBanned;
    user.banReason = user.isBanned ? (reason || 'Violated terms of service') : '';
    await user.save();

    console.log(`${user.isBanned ? '🚫' : '✅'} User ${user.email} ${user.isBanned ? 'banned' : 'unbanned'}`);

    res.json({
      success: true,
      message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBanned: user.isBanned,
        banReason: user.banReason
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete an admin' });
    }

    // Delete user's products if seller
    if (user.role === 'seller') {
      await Product.deleteMany({ seller: user._id });
      console.log(`🗑️ Deleted all products for seller: ${user.email}`);
    }

    // Delete user's reviews
    await Review.deleteMany({ buyer: user._id });

    await User.findByIdAndDelete(req.params.id);

    console.log(`🗑️ User deleted: ${user.email}`);

    res.json({
      success: true,
      message: `User ${user.name} deleted successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   GET /api/admin/users/:id
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get user's orders
    let orders = [];
    if (user.role === 'buyer') {
      orders = await Order.find({ buyer: user._id }).sort({ createdAt: -1 }).limit(20);
    } else if (user.role === 'seller') {
      orders = await Order.find({ seller: user._id }).sort({ createdAt: -1 }).limit(20);
    }

    // Get user's products (if seller)
    let products = [];
    if (user.role === 'seller') {
      products = await Product.find({ seller: user._id }).sort({ createdAt: -1 });
    }

    // Get user's reviews
    const reviews = await Review.find({ buyer: user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      user,
      orders,
      products,
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 📦 PRODUCT MANAGEMENT
// ==========================================

// @route   GET /api/admin/products
exports.getAllProducts = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;

    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sellerName: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: products.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      products
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/admin/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete product reviews
    await Review.deleteMany({ product: product._id });

    await Product.findByIdAndDelete(req.params.id);

    console.log(`🗑️ Product deleted by admin: ${product.name}`);

    res.json({
      success: true,
      message: `Product "${product.name}" deleted successfully`
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 🛒 ORDER MANAGEMENT
// ==========================================

// @route   GET /api/admin/orders
exports.getAllOrders = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;

    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { buyerName: { $regex: search, $options: 'i' } },
        { sellerName: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      orders
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   PUT /api/admin/orders/:id/cancel
exports.adminCancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Order is already cancelled' });
    }

    if (order.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed order' });
    }

    // Restore stock
    const product = await Product.findById(order.product);
    if (product) {
      product.quantity += order.quantity;
      await product.save();
    }

    order.status = 'cancelled';
    await order.save();

    console.log(`🚫 Order cancelled by admin: ${order._id}`);

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// ⭐ REVIEW MANAGEMENT
// ==========================================

// @route   GET /api/admin/reviews
exports.getAllReviews = async (req, res) => {
  try {
    const { search, rating, page = 1, limit = 20 } = req.query;

    let query = {};

    if (rating) {
      query.rating = parseInt(rating);
    }

    if (search) {
      query.$or = [
        { buyerName: { $regex: search, $options: 'i' } },
        { reviewText: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Review.countDocuments(query);
    const reviews = await Review.find(query)
      .populate('product', 'name image category')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @route   DELETE /api/admin/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate product rating
    await Review.calculateAverageRating(productId);

    console.log(`🗑️ Review deleted by admin: ${req.params.id}`);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};