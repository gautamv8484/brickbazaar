const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [3, 'Product name must be at least 3 characters'],
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Bricks', 'Cement', 'Sand', 'Steel', 'Other'],
      message: '{VALUE} is not a valid category'
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0.01, 'Price must be greater than 0'],
    max: [10000000, 'Price cannot exceed ₹1,00,00,000']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: {
      values: ['piece', 'bag', 'ton', 'kg', 'cft'],
      message: '{VALUE} is not a valid unit'
    }
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    max: [10000000, 'Quantity is too large'],
    validate: {
      validator: Number.isInteger,
      message: 'Quantity must be a whole number'
    }
  },
  minOrderQty: {
    type: Number,
    default: function() {
      const defaults = {
        'Bricks': 1000,
        'Cement': 50,
        'Sand': 5,
        'Steel': 500,
        'Other': 100
      };
      return defaults[this.category] || 100;
    },
    min: [1, 'Minimum order quantity must be at least 1']
  },
  transportAvailable: {
    type: Boolean,
    default: true
  },
  selfPickupAvailable: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/400?text=Product+Image'
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    minlength: [2, 'Location must be at least 2 characters'],
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerName: String,
  sellerPhone: String,
  sellerEmail: String,
  sellerCity: String,
  sellerLat: {
    type: Number,
    default: null
  },
  sellerLng: {
    type: Number,
    default: null
  },
  hasSellerLocation: {
    type: Boolean,
    default: false
  },
    rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5']
  },
  numReviews: {
    type: Number,
    default: 0,
    min: 0
  }
}, { 
  timestamps: true 
});

// Index for search performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });

module.exports = mongoose.model('Product', productSchema);