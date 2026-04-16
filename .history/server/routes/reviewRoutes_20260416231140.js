const express = require('express');
const router = express.Router();
const {
  createReview,
  getProductReviews,
  checkReviewExists,
  getSellerReviews,
  deleteReview
} = require('../controllers/reviewController');
const { protect, isBuyer, isSeller } = require('../middleware/authMiddleware');

// Public
router.get('/product/:productId', getProductReviews);

// Buyer routes
router.post('/', protect, isBuyer, createReview);
router.get('/check/:orderId', protect, isBuyer, checkReviewExists);
router.delete('/:id', protect, isBuyer, deleteReview);

// Seller routes
router.get('/seller/me', protect, isSeller, getSellerReviews);

module.exports = router;