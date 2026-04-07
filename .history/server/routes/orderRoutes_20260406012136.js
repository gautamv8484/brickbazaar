const express = require('express');
const {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, isBuyer, isSeller } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, isBuyer, createOrder);
router.get('/buyer/me', protect, isBuyer, getBuyerOrders);
router.get('/seller/me', protect, isSeller, getSellerOrders);
router.put('/:id/status', protect, isSeller, updateOrderStatus);

module.exports = router;