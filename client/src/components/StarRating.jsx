import React, { useState } from 'react';
import { FiStar } from 'react-icons/fi';

const StarRating = ({ 
  rating = 0, 
  onRate = null, 
  size = 20, 
  readonly = false,
  showText = false 
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const ratingTexts = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent'
  };

  const ratingColors = {
    1: '#ef4444',
    2: '#f97316',
    3: '#f59e0b',
    4: '#22c55e',
    5: '#10b981'
  };

  const activeRating = hoverRating || rating;

  return (
    <div className="star-rating-component">
      <div className="star-rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn ${star <= activeRating ? 'active' : ''} ${readonly ? 'readonly' : ''}`}
            onClick={() => !readonly && onRate && onRate(star)}
            onMouseEnter={() => !readonly && setHoverRating(star)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            disabled={readonly}
            style={{ cursor: readonly ? 'default' : 'pointer' }}
          >
            <FiStar
              size={size}
              fill={star <= activeRating ? ratingColors[activeRating] || '#FFC107' : 'none'}
              stroke={star <= activeRating ? ratingColors[activeRating] || '#FFC107' : '#d1d5db'}
              strokeWidth={2}
            />
          </button>
        ))}
      </div>
      {showText && activeRating > 0 && (
        <span
          className="star-rating-text"
          style={{ color: ratingColors[activeRating] }}
        >
          {ratingTexts[activeRating]}
        </span>
      )}
    </div>
  );
};

export default StarRating;