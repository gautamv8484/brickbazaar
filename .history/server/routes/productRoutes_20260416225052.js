const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  getMyProducts
} = require('../controllers/productController');
const { protect, isSeller } = require('../middleware/authMiddleware');
const {
  addProductValidator,
  updateProductValidator,
  productQueryValidator,
  mongoIdValidator
} = require('../middleware/validators');

// Public routes
router.get('/', productQueryValidator, getAllProducts);
router.get('/seller/me', protect, isSeller, getMyProducts);
router.get('/:id', mongoIdValidator, getProduct);

// Seller routes
router.post('/', protect, isSeller, addProductValidator, addProduct);
router.put('/:id', protect, isSeller, updateProductValidator, updateProduct);
router.delete('/:id', protect, isSeller, mongoIdValidator, deleteProduct);

module.exports = router;