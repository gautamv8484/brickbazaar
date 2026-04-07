import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiHeart, FiMapPin, FiStar, FiShoppingCart } from 'react-icons/fi';

const ProductCard = ({ product }) => {
  const { user, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleBuy = (e) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.warning('Please login first to buy!');
      navigate('/login');
      return;
    }

    if (user.role === 'seller') {
      toast.error('Sellers cannot buy products!');
      return;
    }

    navigate(`/product/${product._id || product.id}`);
  };

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product._id || product.id}`)}>
      <div className="product-image">
        <img src={product.image || 'https://via.placeholder.com/400x300?text=No+Image'} alt={product.name} />
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <div className="product-wishlist" onClick={(e) => e.stopPropagation()}>
          <FiHeart />
        </div>
      </div>

      <div className="product-content">
        <div className="product-category">{product.category}</div>
        <h3>{product.name}</h3>

        <div className="product-seller">
          <div className="product-seller-avatar">
            {product.sellerName?.charAt(0) || 'S'}
          </div>
          <div className="product-seller-info">
            <h4>{product.sellerName || 'Seller'}</h4>
            <span>Verified Seller</span>
          </div>
          <div className="product-seller-rating">
            <FiStar fill="#FFC107" stroke="#FFC107" /> {product.rating || '4.5'}
          </div>
        </div>

        <div className="product-quantity">
          Stock: {product.quantity > 0 ? (
            <span style={{ color: product.quantity < 10 ? 'var(--error)' : 'var(--success)' }}>
              {product.quantity} {product.unit || 'units'}
            </span>
          ) : (
            <span style={{ color: 'var(--error)' }}>Out of Stock</span>
          )}
        </div>

        <div className="product-meta">
          <div className="product-price">
            ₹{product.price} <span>/ {product.unit || 'unit'}</span>
          </div>
          <div className="product-location">
            <FiMapPin size={14} /> {product.location || 'India'}
          </div>
        </div>

        <div className="product-actions">
          <button className="btn-buy" onClick={handleBuy} disabled={product.quantity <= 0}>
            <FiShoppingCart /> Buy Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;