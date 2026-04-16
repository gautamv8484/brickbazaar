import React from 'react';
import StarRating from './StarRating';
import { FiCheckCircle, FiUser, FiCalendar } from 'react-icons/fi';

const ReviewCard = ({ review }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="review-card">
      <div className="review-card-header">
        <div className="review-user-info">
          <div className="review-avatar">
            {review.buyerName?.charAt(0).toUpperCase()}
          </div>
          <div className="review-user-details">
            <h4>{review.buyerName}</h4>
            <div className="review-meta">
              {review.isVerifiedPurchase && (
                <span className="verified-badge">
                  <FiCheckCircle /> Verified Purchase
                </span>
              )}
              <span className="review-date">
                <FiCalendar /> {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <StarRating rating={review.rating} readonly size={16} />
      </div>

      {review.reviewText && (
        <p className="review-text">{review.reviewText}</p>
      )}
    </div>
  );
};

export default ReviewCard;