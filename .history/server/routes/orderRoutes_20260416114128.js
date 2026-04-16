const express = require('express');
const {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  updateOrderStatus,
  getVehicleSuggestion
} = require('../controllers/orderController');
const { protect, isBuyer, isSeller } = require('../middleware/authMiddleware');

const router = express.Router();

// Vehicle suggestion (public)
router.get('/vehicle-suggest', getVehicleSuggestion);

// Order CRUD
router.post('/', protect, isBuyer, createOrder);
router.get('/buyer/me', protect, isBuyer, getBuyerOrders);
router.get('/seller/me', protect, isSeller, getSellerOrders);
router.put('/:id/status', protect, isSeller, updateOrderStatus);

module.exports = router;