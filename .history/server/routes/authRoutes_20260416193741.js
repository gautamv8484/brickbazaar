const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();
const express = require('express');
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');



router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;