const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  productName: {
    type: String,
    required: [true, 'Product name is required']
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller is required']
  },
  sellerName: String,
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer is required']
  },
  buyerName: String,
  buyerEmail: String,
  buyerPhone: String,
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    max: [10000000, 'Quantity is too large']
  },
  productCost: {
    type: Number,
    required: [true, 'Product cost is required'],
    min: [0, 'Product cost cannot be negative']
  },
  transportRequired: {
    type: Boolean,
    default: false
  },
  vehicleType: {
    type: String,
    enum: {
      values: ['none', 'mini', 'medium', 'large', 'heavy'],
      message: '{VALUE} is not a valid vehicle type'
    },
    default: 'none'
  },
  vehicleName: {
    type: String,
    default: 'Self Pickup'
  },
  transportCost: {
    type: Number,
    default: 0,
    min: [0, 'Transport cost cannot be negative']
  },
  deliveryAddress: {
    type: String,
    default: '',
    maxlength: [300, 'Delivery address cannot exceed 300 characters']
  },
  estimatedDistance: {
    type: Number,
    default: 0,
    min: [0, 'Distance cannot be negative'],
    max: [500, 'Distance cannot exceed 500 km']
  },
  totalPrice: {
    type: Number,
    required: [true, 'Total price is required'],
    min: [0, 'Total price cannot be negative']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'completed', 'cancelled'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  }
}, { 
  timestamps: true 
});

// Validate that total = productCost + transportCost
orderSchema.pre('save', function(next) {
  if (this.isNew) {
    const expectedTotal = this.productCost + this.transportCost;
    if (Math.abs(this.totalPrice - expectedTotal) > 1) {
      return next(new Error('Total price mismatch. Please try again.'));
    }
  }
  next();
});

// Indexes
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ seller: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model('Order', orderSchema);