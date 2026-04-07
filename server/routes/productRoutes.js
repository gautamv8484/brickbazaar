const express = require('express');
const {
  getAllProducts,
  getProduct,
  addProduct,
  updateProduct,
  deleteProduct,
  getMyProducts
} = require('../controllers/productController');
const { protect, isSeller } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getAllProducts);
router.get('/seller/me', protect, isSeller, getMyProducts);
router.get('/:id', getProduct);
router.post('/', protect, isSeller, addProduct);
router.put('/:id', protect, isSeller, updateProduct);
router.delete('/:id', protect, isSeller, deleteProduct);

module.exports = router;