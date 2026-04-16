const Review = require('../models/Review');
const Order = require('../models/Order');
const Product = require('../models/Product');

// @route   POST /api/reviews
// @desc    Create a review (buyer only, after order completed)
// @access  Private (Buyer)
exports.createReview = async (req, res) => {
  try {
    const { orderId, productId, rating, reviewText } = req.body;

    console.log('⭐ Review request:', { orderId, productId, rating });

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5 stars'
      });
    }

    // Check order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check buyer owns this order
    if (order.buyer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own orders'
      });
    }

    // Check order is completed
    if (order.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed orders'
      });
    }

    // Check product matches order
    if (order.product.toString() !== productId) {
      return res.status(400).json({
        success: false,
        message: 'Product does not match this order'
      });
    }

    // Check if already reviewed this order
    const existingReview = await Review.findOne({ order: orderId });
    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this order'
      });
    }

    // Check if already reviewed this product
    const existingProductReview = await Review.findOne({
      product: productId,
      buyer: req.user.id
    });
    if (existingProductReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Create review
    const review = await Review.create({
      product: productId,
      order: orderId,
      buyer: req.user.id,
      buyerName: req.user.name,
      seller: order.seller,
      rating: Number(rating),
      reviewText: reviewText ? reviewText.trim() : '',
      isVerifiedPurchase: true
    });

    console.log('✅ Review created:', review._id);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully! Thank you for your feedback. ⭐',
      review
    });
  } catch (error) {
    console.error('❌ Review error:', error.message);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product/order'
      });
    }

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @route   GET /api/reviews/product/:productId
// @desc    Get all reviews for a product
// @access  Public
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({ product: productId })
      .sort({ createdAt: -1 });

    // Calculate rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    reviews.forEach(review => {
      distribution[review.rating]++;
      totalRating += review.rating;
    });

    const averageRating = reviews.length > 0
      ? Math.round((totalRating / reviews.length) * 10) / 10
      : 0;

    res.json({
      success: true,
      count: reviews.length,
      averageRating,
      distribution,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @route   GET /api/reviews/check/:orderId
// @desc    Check if buyer already reviewed an order
// @access  Private (Buyer)
exports.checkReviewExists = async (req, res) => {
  try {
    const { orderId } = req.params;

    const review = await Review.findOne({
      order: orderId,
      buyer: req.user.id
    });

    res.json({
      success: true,
      hasReviewed: !!review,
      review: review || null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @route   GET /api/reviews/seller/me
// @desc    Get all reviews for seller's products
// @access  Private (Seller)
exports.getSellerReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ seller: req.user.id })
      .populate('product', 'name image category')
      .sort({ createdAt: -1 });

    // Calculate seller's overall rating
    let totalRating = 0;
    reviews.forEach(r => totalRating += r.rating);
    const averageRating = reviews.length > 0
      ? Math.round((totalRating / reviews.length) * 10) / 10
      : 0;

    res.json({
      success: true,
      count: reviews.length,
      averageRating,
      reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @route   DELETE /api/reviews/:id
// @desc    Delete review (only the reviewer can delete)
// @access  Private (Buyer)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (review.buyer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    const productId = review.product;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate rating
    await Review.calculateAverageRating(productId);

    console.log('🗑️ Review deleted:', req.params.id);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};