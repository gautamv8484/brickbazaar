import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import StarRating from '../../components/StarRating';
import {
  FiStar, FiSearch, FiTrash2,
  FiChevronLeft, FiChevronRight, FiCheckCircle
} from 'react-icons/fi';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [page, ratingFilter]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15 };
      if (ratingFilter) params.rating = ratingFilter;
      if (search) params.search = search;

      const response = await adminAPI.getReviews(params);
      setReviews(response.data.reviews);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReviews();
  };

  const handleDelete = async (review) => {
    if (!window.confirm('Delete this review? Product rating will be recalculated.')) return;

    try {
      await adminAPI.deleteReview(review._id);
      toast.success('Review deleted');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to delete review');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1><FiStar /> Review Management</h1>
        <p>{total} total reviews</p>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <form className="admin-search" onSubmit={handleSearch}>
          <FiSearch />
          <input
            type="text"
            placeholder="Search by reviewer name or review text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div className="admin-filter-tabs">
          <button
            className={`admin-filter-tab ${ratingFilter === '' ? 'active' : ''}`}
            onClick={() => { setRatingFilter(''); setPage(1); }}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map(r => (
            <button
              key={r}
              className={`admin-filter-tab ${ratingFilter === String(r) ? 'active' : ''}`}
              onClick={() => { setRatingFilter(String(r)); setPage(1); }}
            >
              {r} ★
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="loader"></div><p>Loading reviews...</p></div>
      ) : (
        <>
          <div className="admin-reviews-list">
            {reviews.length > 0 ? reviews.map(review => (
              <div key={review._id} className="admin-review-card">
                <div className="admin-review-header">
                  <div className="admin-review-user">
                    <div className="review-avatar">{review.buyerName?.charAt(0).toUpperCase()}</div>
                    <div>
                      <h4>{review.buyerName}</h4>
                      <div className="admin-review-meta">
                        {review.isVerifiedPurchase && (
                          <span className="verified-badge"><FiCheckCircle /> Verified</span>
                        )}
                        <span className="review-date">{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="admin-review-right">
                    <StarRating rating={review.rating} readonly size={16} />
                    <button className="admin-action-btn delete" onClick={() => handleDelete(review)} title="Delete Review">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                {review.product && (
                  <div className="admin-review-product">
                    <strong>Product:</strong> {review.product.name} ({review.product.category})
                  </div>
                )}

                {review.reviewText && (
                  <p className="admin-review-text">"{review.reviewText}"</p>
                )}
              </div>
            )) : (
              <div className="admin-empty">
                <FiStar size={40} />
                <h3>No reviews found</h3>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <FiChevronLeft /> Prev
              </button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminReviews;