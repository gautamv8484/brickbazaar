const express = require('express');
const router = express.Router();
const {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  updateOrderStatus,
  getVehicleSuggestion
} = require('../controllers/orderController');
const { protect, isBuyer, isSeller } = require('../middleware/authMiddleware');
const {
  createOrderValidator,
  updateOrderStatusValidator,
  vehicleSuggestValidator
} = require('../middleware/validators');

router.post('/', protect, isBuyer, createOrderValidator, createOrder);
router.get('/buyer/me', protect, isBuyer, getBuyerOrders);
router.get('/seller/me', protect, isSeller, getSellerOrders);
router.put('/:id/status', protect, isSeller, updateOrderStatusValidator, updateOrderStatus);
router.get('/vehicle-suggest', vehicleSuggestValidator, getVehicleSuggestion);

module.exports = router;