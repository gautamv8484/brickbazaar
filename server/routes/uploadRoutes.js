const express = require('express');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/upload
// @desc    Upload single image
// @access  Private
router.post('/', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

module.exports = router;