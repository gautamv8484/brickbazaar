const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Bricks', 'Cement', 'Sand', 'Steel', 'Other']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['piece', 'bag', 'ton', 'kg', 'cft']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  // ========== NEW: Minimum Order Quantity ==========
  minOrderQty: {
    type: Number,
    default: function() {
      // Default MOQ based on category
      const defaults = {
        'Bricks': 1000,
        'Cement': 50,
        'Sand': 5,
        'Steel': 500,
        'Other': 100
      };
      return defaults[this.category] || 100;
    }
  },
  // ========== NEW: Transportation Options ==========
  transportAvailable: {
    type: Boolean,
    default: true
  },
  selfPickupAvailable: {
    type: Boolean,
    default: true
  },
  // =================================================
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/400?text=Product+Image'
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerName: String,
  sellerPhone: String,
  sellerEmail: String,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Product', productSchema);