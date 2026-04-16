const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getAllUsers,
  toggleBanUser,
  deleteUser,
  getUserDetails,
  getAllProducts,
  deleteProduct,
  getAllOrders,
  adminCancelOrder,
  getAllReviews,
  deleteReview
} = require('../controllers/adminController');

// All routes need admin auth
router.use(protect, isAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/ban', toggleBanUser);
router.delete('/users/:id', deleteUser);

// Products
router.get('/products', getAllProducts);
router.delete('/products/:id', deleteProduct);

// Orders
router.get('/orders', getAllOrders);
router.put('/orders/:id/cancel', adminCancelOrder);

// Reviews
router.get('/reviews', getAllReviews);
router.delete('/reviews/:id', deleteReview);

module.exports = router;