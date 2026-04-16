const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerName: String,
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  buyerName: String,
  buyerEmail: String,
  buyerPhone: String,
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  // ========== NEW: Price Breakdown ==========
  productCost: {
    type: Number,
    required: true
  },
  // ========== NEW: Transportation Details ==========
  transportRequired: {
    type: Boolean,
    default: false
  },
  vehicleType: {
    type: String,
    enum: ['none', 'mini', 'medium', 'large', 'heavy'],
    default: 'none'
  },
  vehicleName: {
    type: String,
    default: 'Self Pickup'
  },
  transportCost: {
    type: Number,
    default: 0
  },
  deliveryAddress: {
    type: String,
    default: ''
  },
  estimatedDistance: {
    type: Number,
    default: 0
  },
  // ========== Total = Product Cost + Transport Cost ==========
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Order', orderSchema);
