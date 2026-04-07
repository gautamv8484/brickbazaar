import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { productAPI, orderAPI } from '../services/api';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';
import { 
  FiArrowLeft, 
  FiStar, 
  FiMapPin, 
  FiShoppingCart, 
  FiPhone, 
  FiMinus, 
  FiPlus 
} from 'react-icons/fi';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isBuyer } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [orderPlacing, setOrderPlacing] = useState(false);

  // Fetch product on mount
  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching product:', id);
      
      const response = await productAPI.getOne(id);
      console.log('✅ Product fetched:', response.data);
      
      setProduct(response.data.product);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching product:', err);
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleBuyClick = () => {
    if (!isAuthenticated) {
      toast.warning('Please login to buy!');
      navigate('/login');
      return;
    }

    if (!isBuyer) {
      toast.error('Only buyers can purchase!');
      return;
    }

    setShowBuyModal(true);
  };

  const handleConfirmOrder = async () => {
    try {
      setOrderPlacing(true);

      const response = await orderAPI.create({
        productId: product._id,
        quantity: qty
      });

      console.log('✅ Order placed:', response.data);
      
      toast.success('Order placed successfully! Seller has been notified.');
      setShowBuyModal(false);
      
      // Redirect to buyer dashboard
      setTimeout(() => {
        navigate('/buyer/dashboard');
      }, 1500);
    } catch (error) {
      console.error('❌ Order error:', error);
      const message = error.response?.data?.message || 'Failed to place order';
      toast.error(message);
    } finally {
      setOrderPlacing(false);
    }
  };

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      toast.warning('Please login to contact seller');
      navigate('/login');
      return;
    }
    toast.info(`Seller Phone: ${product.sellerPhone}`);
  };

  // Default image
  const defaultImage = 'https://images.unsplash.com/photo-1590075865003-e48277faa558?w=800';

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="products-loading">
          <div className="loader"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <div className="products-error">
          <h2>❌ {error || 'Product not found'}</h2>
          <p>The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/products" className="btn btn-primary">
            <FiArrowLeft /> Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* Left - Image */}
        <div className="product-gallery">
          <Link to="/products" className="auth-back" style={{ marginBottom: 20, display: 'inline-flex' }}>
            <FiArrowLeft /> Back to Products
          </Link>
          <div className="product-main-image">
            <img 
              src={product.image || defaultImage} 
              alt={product.name}
              onError={(e) => {
                if (e.target.src !== defaultImage) {
                  e.target.src = defaultImage;
                }
              }}
            />
          </div>
        </div>

        {/* Right - Info */}
        <div className="product-info-section">
          <div className="product-category">{product.category}</div>
          <h1>{product.name}</h1>

          <div className="product-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <FiStar 
                  key={i} 
                  fill={i < Math.floor(product.rating || 4.5) ? '#FFC107' : 'none'} 
                  stroke="#FFC107" 
                />
              ))}
            </div>
            <span>{product.rating || 4.5} rating</span>
          </div>

          <div className="product-price-box">
            <div className="price">₹{product.price} <span>/ {product.unit}</span></div>
            <div className={`stock ${product.quantity > 100 ? 'in-stock' : product.quantity > 0 ? 'low-stock' : 'out-of-stock'}`}>
              {product.quantity > 100 ? `✅ In Stock (${product.quantity} ${product.unit}s)` :
               product.quantity > 0 ? `⚠️ Low Stock (${product.quantity} left)` :
               '❌ Out of Stock'}
            </div>
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description}</p>
          </div>

          <div className="product-seller-card">
            <h4>Seller Information</h4>
            <div className="seller-info">
              <div className="seller-avatar">{product.sellerName?.charAt(0)}</div>
              <div className="seller-details">
                <h3>{product.sellerName}</h3>
                <p><FiMapPin size={14} /> {product.location}</p>
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="quantity-selector">
            <h4>Select Quantity ({product.unit}s)</h4>
            <div className="quantity-input">
              <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={qty <= 1}>
                <FiMinus />
              </button>
              <input 
                type="number" 
                value={qty} 
                onChange={(e) => setQty(Math.max(1, Math.min(product.quantity, Number(e.target.value))))} 
                min="1"
                max={product.quantity}
              />
              <button onClick={() => setQty(Math.min(product.quantity, qty + 1))} disabled={qty >= product.quantity}>
                <FiPlus />
              </button>
            </div>
            <p style={{ marginTop: 10, fontWeight: 600, fontSize: '1.2rem' }}>
              Total: <span style={{ color: 'var(--primary)' }}>₹{(product.price * qty).toLocaleString()}</span>
            </p>
          </div>

          {/* Buy Button */}
          <div className="buy-actions">
            <button 
              className="btn btn-primary btn-lg" 
              onClick={handleBuyClick} 
              disabled={product.quantity <= 0} 
              style={{ flex: 1 }}
            >
              <FiShoppingCart /> Buy Now
            </button>
            <button 
              className="btn btn-secondary btn-lg" 
              onClick={handleContactSeller} 
              style={{ flex: 1 }}
            >
              <FiPhone /> Contact Seller
            </button>
          </div>
        </div>
      </div>

      {/* Buy Confirmation Modal */}
      <Modal isOpen={showBuyModal} onClose={() => setShowBuyModal(false)} title="📦 Confirm Your Order">
        <div>
          <div style={{ background: 'var(--gray-50)', padding: 20, borderRadius: 12, marginBottom: 20 }}>
            <h3 style={{ marginBottom: 15 }}>Order Summary</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Product:</span><strong>{product.name}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Price:</span><strong>₹{product.price} / {product.unit}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span>Quantity:</span><strong>{qty} {product.unit}s</strong>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: 8, 
              borderTop: '2px solid var(--gray-200)', 
              paddingTop: 10, 
              fontSize: '1.2rem' 
            }}>
              <span>Total:</span>
              <strong style={{ color: 'var(--primary)' }}>₹{(product.price * qty).toLocaleString()}</strong>
            </div>
          </div>

          <div style={{ background: 'var(--gray-50)', padding: 20, borderRadius: 12, marginBottom: 20 }}>
            <h4 style={{ marginBottom: 10 }}>Your Details (sent to seller)</h4>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Phone:</strong> {user?.phone}</p>
          </div>

          <button 
            className="btn btn-primary btn-lg btn-block" 
            onClick={handleConfirmOrder}
            disabled={orderPlacing}
          >
            {orderPlacing ? 'Placing Order...' : '✅ Confirm Order'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDetail;