const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product is required']
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: [true, 'Order is required']
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Buyer is required']
  },
  buyerName: {
    type: String,
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  reviewText: {
    type: String,
    default: '',
    maxlength: [500, 'Review cannot exceed 500 characters'],
    trim: true
  },
  isVerifiedPurchase: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// One review per order (buyer can't review same order twice)
reviewSchema.index({ order: 1 }, { unique: true });

// One review per product per buyer
reviewSchema.index({ product: 1, buyer: 1 }, { unique: true });

// For fetching product reviews
reviewSchema.index({ product: 1, createdAt: -1 });

// Static method: Calculate average rating for a product
reviewSchema.statics.calculateAverageRating = async function(productId) {
  const result = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    const Product = require('./Product');
    if (result.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        rating: Math.round(result[0].averageRating * 10) / 10,
        numReviews: result[0].totalReviews
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        rating: 0,
        numReviews: 0
      });
    }
  } catch (err) {
    console.error('Error updating product rating:', err);
  }
};

// After save → recalculate
reviewSchema.post('save', function() {
  this.constructor.calculateAverageRating(this.product);
});

// After delete → recalculate
reviewSchema.post('findOneAndDelete', function(doc) {
  if (doc) {
    doc.constructor.calculateAverageRating(doc.product);
  }
});

module.exports = mongoose.model('Review', reviewSchema);