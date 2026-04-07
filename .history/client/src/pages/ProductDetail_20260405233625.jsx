import React, { useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Modal from '../components/Modal';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiStar, FiMapPin, FiShoppingCart, FiPhone, FiMinus, FiPlus } from 'react-icons/fi';

// Mock data (later from API)
const mockProducts = {
  1: { id: 1, name: 'Premium Red Clay Bricks', category: 'Bricks', price: 8, unit: 'piece', quantity: 50000, location: 'Ahmedabad, Gujarat', sellerName: 'Sharma Brick Works', sellerPhone: '9876543210', sellerEmail: 'sharma@bricks.com', rating: 4.8, description: 'High-quality red clay bricks for all construction needs. Durable, weather-resistant, eco-friendly.', image: 'https://images.unsplash.com/photo-1590075865003-e48277faa558?w=800' },
  2: { id: 2, name: 'UltraTech OPC 53 Grade Cement', category: 'Cement', price: 380, unit: 'bag', quantity: 500, location: 'Surat, Gujarat', sellerName: 'Rajesh Builders', sellerPhone: '9876543211', sellerEmail: 'rajesh@builders.com', rating: 4.6, description: 'Premium OPC cement for strong and durable construction.', image: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800' },
  3: { id: 3, name: 'River Sand Premium Quality', category: 'Sand', price: 1200, unit: 'ton', quantity: 100, location: 'Vadodara, Gujarat', sellerName: 'Krishna Traders', sellerPhone: '9876543212', sellerEmail: 'krishna@sand.com', rating: 4.9, description: 'Finest quality river sand for construction.', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800' },
  4: { id: 4, name: 'TATA TMT 500D Steel Bars', category: 'Steel', price: 65, unit: 'kg', quantity: 10000, location: 'Rajkot, Gujarat', sellerName: 'Metro Steel Corp', sellerPhone: '9876543213', sellerEmail: 'metro@steel.com', rating: 4.7, description: 'High-strength TMT bars for reinforced construction.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800' },
  5: { id: 5, name: 'Fly Ash Bricks Eco-Friendly', category: 'Bricks', price: 6, unit: 'piece', quantity: 30000, location: 'Gandhinagar, Gujarat', sellerName: 'Green Bricks Ltd', sellerPhone: '9876543214', sellerEmail: 'green@bricks.com', rating: 4.5, description: 'Eco-friendly fly ash bricks.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800' },
  6: { id: 6, name: 'ACC PPC Cement 50kg', category: 'Cement', price: 360, unit: 'bag', quantity: 800, location: 'Mumbai, Maharashtra', sellerName: 'Amar Building', sellerPhone: '9876543215', sellerEmail: 'amar@building.com', rating: 4.4, description: 'Quality PPC cement for all types of construction.', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800' },
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isBuyer } = useContext(AuthContext);

  const product = mockProducts[id];

  const [qty, setQty] = useState(1);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  if (!product) {
    return (
      <div className="product-detail-page">
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <h2>Product not found</h2>
          <Link to="/products">← Back to Products</Link>
        </div>
      </div>
    );
  }

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

  const handleConfirmOrder = () => {
    // TODO: API call to create order - sends buyer details to seller
    const orderData = {
      productId: product.id,
      productName: product.name,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      buyerId: user.id,
      buyerName: user.name,
      buyerEmail: user.email,
      buyerPhone: user.phone,
      quantity: qty,
      totalPrice: product.price * qty,
      status: 'pending'
    };

    console.log('📦 Order placed:', orderData);

    setOrderPlaced(true);
    toast.success('Order placed! Seller has been notified.');

    setTimeout(() => {
      setShowBuyModal(false);
      setOrderPlaced(false);
      navigate('/buyer/dashboard');
    }, 2000);
  };

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* Left - Image */}
        <div className="product-gallery">
          <Link to="/products" className="auth-back" style={{ marginBottom: 20, display: 'inline-flex' }}>
            <FiArrowLeft /> Back to Products
          </Link>
          <div className="product-main-image">
            <img src={product.image} alt={product.name} />
          </div>
        </div>

        {/* Right - Info */}
        <div className="product-info-section">
          <div className="product-category">{product.category}</div>
          <h1>{product.name}</h1>

          <div className="product-rating">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <FiStar key={i} fill={i < Math.floor(product.rating) ? '#FFC107' : 'none'} stroke="#FFC107" />
              ))}
            </div>
            <span>{product.rating} rating</span>
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
              <div className="seller-avatar">{product.sellerName.charAt(0)}</div>
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
              <button onClick={() => setQty(Math.max(1, qty - 1))}><FiMinus /></button>
              <input type="number" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} />
              <button onClick={() => setQty(qty + 1)}><FiPlus /></button>
            </div>
            <p style={{ marginTop: 10, fontWeight: 600, fontSize: '1.2rem' }}>
              Total: <span style={{ color: 'var(--primary)' }}>₹{(product.price * qty).toLocaleString()}</span>
            </p>
          </div>

          {/* Buy Button */}
          <div className="buy-actions">
            <button className="btn btn-primary btn-lg" onClick={handleBuyClick} disabled={product.quantity <= 0} style={{ flex: 1 }}>
              <FiShoppingCart /> Buy Now
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => {
              if (!isAuthenticated) { toast.warning('Login to contact seller'); navigate('/login'); return; }
              toast.success(`Seller Phone: ${product.sellerPhone}`);
            }} style={{ flex: 1 }}>
              <FiPhone /> Contact Seller
            </button>
          </div>
        </div>
      </div>

      {/* Buy Confirmation Modal */}
      <Modal isOpen={showBuyModal} onClose={() => setShowBuyModal(false)} title={orderPlaced ? '✅ Order Confirmed!' : '📦 Confirm Your Order'}>
        {orderPlaced ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>🎉</div>
            <h3>Order Placed Successfully!</h3>
            <p style={{ color: 'var(--gray-600)', marginTop: 10 }}>
              Seller <strong>{product.sellerName}</strong> has received your order details.
            </p>
          </div>
        ) : (
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
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, borderTop: '2px solid var(--gray-200)', paddingTop: 10, fontSize: '1.2rem' }}>
                <span>Total:</span><strong style={{ color: 'var(--primary)' }}>₹{(product.price * qty).toLocaleString()}</strong>
              </div>
            </div>

            <div style={{ background: 'var(--gray-50)', padding: 20, borderRadius: 12, marginBottom: 20 }}>
              <h4 style={{ marginBottom: 10 }}>Your Details (sent to seller)</h4>
              <p><strong>Name:</strong> {user?.name}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Phone:</strong> {user?.phone}</p>
            </div>

            <button className="btn btn-primary btn-lg btn-block" onClick={handleConfirmOrder}>
              ✅ Confirm Order
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ProductDetail;