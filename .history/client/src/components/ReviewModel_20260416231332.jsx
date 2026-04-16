import React, { useState } from 'react';
import Modal from './Modal';
import StarRating from './StarRating';
import { reviewAPI } from '../services/api';
import { toast } from 'react-toastify';
import { FiSend } from 'react-icons/fi';

const ReviewModal = ({ isOpen, onClose, order, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setSubmitting(true);

    try {
      const response = await reviewAPI.create({
        orderId: order._id,
        productId: order.product?._id || order.product,
        rating,
        reviewText: reviewText.trim()
      });

      toast.success('Review submitted successfully! ⭐');
      
      // Reset form
      setRating(0);
      setReviewText('');
      
      // Callback
      if (onReviewSubmitted) {
        onReviewSubmitted(response.data.review);
      }
      
      onClose();
    } catch (error) {
      console.error('❌ Review error:', error);
      const message = error.response?.data?.message || 'Failed to submit review';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setReviewText('');
    onClose();
  };

  if (!order) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="⭐ Write a Review">
      <div className="review-modal">
        {/* Product Info */}
        <div className="review-modal-product">
          <div className="review-product-info">
            <h3>{order.productName}</h3>
            <p>Order #{order._id?.slice(-6).toUpperCase()}</p>
            <p>Qty: {order.quantity?.toLocaleString()} • ₹{order.totalPrice?.toLocaleString()}</p>
          </div>
        </div>

        {/* Star Rating */}
        <div className="review-rating-section">
          <h4>How would you rate this product?</h4>
          <StarRating
            rating={rating}
            onRate={setRating}
            size={36}
            showText
          />
        </div>

        {/* Review Text */}
        <div className="review-text-section">
          <h4>Write your review (optional)</h4>
          <textarea
            placeholder="Share your experience with this product... quality, delivery, packaging etc."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            maxLength={500}
            rows={4}
          />
          <small className="char-count">{reviewText.length}/500</small>
        </div>

        {/* Submit Button */}
        <button
          className="btn btn-primary btn-lg btn-block"
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
        >
          <FiSend />
          {submitting ? 'Submitting...' : `Submit Review (${rating} Star${rating !== 1 ? 's' : ''})`}
        </button>
      </div>
    </Modal>
  );
};

export default ReviewModal;