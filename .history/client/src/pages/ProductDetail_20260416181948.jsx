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
  FiPlus,
  FiTruck,
  FiPackage,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';

// ========== Vehicle Data ==========
const VEHICLES = {
  mini: {
    name: '🛺 Mini Vehicle (Tempo)',
    capacity: 'Up to 1 Ton',
    baseCost: 300,
    perKmRate: 15,
    icon: '🛺'
  },
  medium: {
    name: '🚛 Medium Truck',
    capacity: '1-5 Tons',
    baseCost: 600,
    perKmRate: 25,
    icon: '🚛'
  },
  large: {
    name: '🚚 Large Truck',
    capacity: '5-15 Tons',
    baseCost: 1000,
    perKmRate: 40,
    icon: '🚚'
  },
  heavy: {
    name: '🏗️ Heavy Vehicle (Trailer)',
    capacity: '15+ Tons',
    baseCost: 2000,
    perKmRate: 60,
    icon: '🏗️'
  }
};

// ========== Minimum Order Quantities ==========
const MIN_ORDER_QTY = {
  'Bricks': 1000,
  'Cement': 50,
  'Sand': 5,
  'Steel': 500,
  'Other': 100
};

// ========== Auto Suggest Vehicle ==========
const suggestVehicle = (category, quantity) => {
  switch (category) {
    case 'Bricks':
      if (quantity <= 3000) return 'mini';
      if (quantity <= 10000) return 'medium';
      if (quantity <= 30000) return 'large';
      return 'heavy';
    case 'Cement':
      if (quantity <= 200) return 'mini';
      if (quantity <= 500) return 'medium';
      if (quantity <= 1000) return 'large';
      return 'heavy';
    case 'Sand':
      if (quantity <= 2) return 'mini';
      if (quantity <= 10) return 'medium';
      if (quantity <= 25) return 'large';
      return 'heavy';
    case 'Steel':
      if (quantity <= 2000) return 'mini';
      if (quantity <= 5000) return 'medium';
      if (quantity <= 10000) return 'large';
      return 'heavy';
    default:
      if (quantity <= 1000) return 'mini';
      if (quantity <= 5000) return 'medium';
      if (quantity <= 15000) return 'large';
      return 'heavy';
  }
};

// ========== Calculate Transport Cost ==========
const calculateTransportCost = (vehicleType, distance) => {
  const vehicle = VEHICLES[vehicleType];
  if (!vehicle) return 0;
  return Math.round(vehicle.baseCost + (distance * vehicle.perKmRate));
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isBuyer } = useContext(AuthContext);

  // Product states
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Order states
  const [qty, setQty] = useState(1000);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [orderPlacing, setOrderPlacing] = useState(false);

  // Transportation states
  const [needTransport, setNeedTransport] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [distance, setDistance] = useState(10);
  const [transportCost, setTransportCost] = useState(0);

  // Fetch product on mount
  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Set minimum quantity when product loads
  useEffect(() => {
    if (product) {
      const minQty = product.minOrderQty || MIN_ORDER_QTY[product.category] || 100;
      setQty(minQty);
    }
  }, [product]);

  // Auto suggest vehicle when quantity changes
  useEffect(() => {
    if (product && needTransport) {
      const suggested = suggestVehicle(product.category, qty);
      setSelectedVehicle(suggested);
    }
  }, [qty, product, needTransport]);

  // Calculate transport cost when vehicle or distance changes
  useEffect(() => {
    if (needTransport && selectedVehicle) {
      const cost = calculateTransportCost(selectedVehicle, distance);
      setTransportCost(cost);
    } else {
      setTransportCost(0);
    }
  }, [needTransport, selectedVehicle, distance]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getOne(id);
      setProduct(response.data.product);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching product:', err);
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum order quantity
  const getMinQty = () => {
    if (!product) return 1;
    return product.minOrderQty || MIN_ORDER_QTY[product.category] || 100;
  };

  // Handle quantity change
  const handleQtyChange = (newQty) => {
    const minQty = getMinQty();
    const maxQty = product?.quantity || 0;
    const validQty = Math.max(minQty, Math.min(maxQty, newQty));
    setQty(validQty);
  };

  // Calculate costs
  const productCost = product ? product.price * qty : 0;
  const totalCost = productCost + transportCost;

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

    const minQty = getMinQty();
    if (qty < minQty) {
      toast.error(`Minimum order is ${minQty} ${product.unit}s`);
      return;
    }

    setShowBuyModal(true);
  };

  const handleConfirmOrder = async () => {
    try {
      // Validate transport
      if (needTransport && !deliveryAddress.trim()) {
        toast.error('Please enter delivery address!');
        return;
      }

      setOrderPlacing(true);

      const orderData = {
        productId: product._id,
        quantity: qty,
        transportRequired: needTransport,
        vehicleType: needTransport ? selectedVehicle : 'none',
        deliveryAddress: needTransport ? deliveryAddress : '',
        estimatedDistance: needTransport ? distance : 0
      };

      console.log('📦 Placing order:', orderData);

      const response = await orderAPI.create(orderData);
      console.log('✅ Order placed:', response.data);
      
      toast.success('Order placed successfully! Seller has been notified. 🎉');
      setShowBuyModal(false);
      
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
      if (needTransport && !deliveryAddress.trim()) {
      toast.error('Please enter delivery address!');
      return;;
    }
    toast.info(`📞 Seller Phone: ${product.sellerPhone}`);
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
          <p>The product you're looking for doesn't exist.</p>
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
                if (e.target.src !== defaultImage) e.target.src = defaultImage;
              }}
            />
          </div>
        </div>

        {/* Right - Info */}
        <div className="product-info-section">
          <div className="product-category-badge">{product.category}</div>
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
              {product.quantity > 100 ? `✅ In Stock (${product.quantity.toLocaleString()} ${product.unit}s)` :
               product.quantity > 0 ? `⚠️ Low Stock (${product.quantity} left)` :
               '❌ Out of Stock'}
            </div>
          </div>

          {/* Minimum Order Notice */}
          <div className="moq-notice">
            <FiAlertCircle />
            <span>Minimum Order: <strong>{getMinQty().toLocaleString()} {product.unit}s</strong></span>
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

          {/* ========== Quantity Selector (Updated with MOQ) ========== */}
          <div className="quantity-selector">
            <h4>Select Quantity ({product.unit}s)</h4>
            <div className="quantity-input">
              <button 
                onClick={() => handleQtyChange(qty - 100)} 
                disabled={qty <= getMinQty()}
              >
                <FiMinus />
              </button>
              <input 
                type="number" 
                value={qty} 
                onChange={(e) => handleQtyChange(Number(e.target.value))}
                min={getMinQty()}
                max={product.quantity}
              />
              <button 
                onClick={() => handleQtyChange(qty + 100)} 
                disabled={qty >= product.quantity}
              >
                <FiPlus />
              </button>
            </div>
            {qty < getMinQty() && (
              <p className="moq-warning">
                ⚠️ Minimum order quantity is {getMinQty().toLocaleString()} {product.unit}s
              </p>
            )}
            <p className="product-subtotal">
              Product Cost: <span>₹{productCost.toLocaleString()}</span>
            </p>
          </div>

          {/* ========== Transportation Section ========== */}
          <div className="transport-section">
            <h4><FiTruck /> Need Transportation?</h4>
            
            <div className="transport-toggle">
              <button 
                className={`transport-btn ${!needTransport ? 'active' : ''}`}
                onClick={() => setNeedTransport(false)}
              >
                <FiPackage /> Self Pickup (Free)
              </button>
              <button 
                className={`transport-btn ${needTransport ? 'active' : ''}`}
                onClick={() => setNeedTransport(true)}
              >
                <FiTruck /> Need Delivery
              </button>
            </div>

            {needTransport && (
              <div className="transport-details">
                {/* Delivery Address */}
                <div className="transport-field">
                  <label><FiMapPin /> Delivery Address</label>
                  <input
                    type="text"
                    placeholder="Enter your delivery address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                  />
                </div>

                {/* Distance */}
                <div className="transport-field">
                  <label>Estimated Distance (km)</label>
                  <div className="distance-input">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={distance}
                      onChange={(e) => setDistance(Number(e.target.value))}
                    />
                    <span className="distance-value">{distance} km</span>
                  </div>
                </div>

                {/* Vehicle Selection */}
                <div className="vehicle-selection">
                  <label>Select Vehicle</label>
                  <div className="vehicle-grid">
                    {Object.entries(VEHICLES).map(([key, vehicle]) => {
                      const cost = calculateTransportCost(key, distance);
                      const isRecommended = key === suggestVehicle(product.category, qty);
                      
                      return (
                        <div 
                          key={key}
                          className={`vehicle-card ${selectedVehicle === key ? 'selected' : ''} ${isRecommended ? 'recommended' : ''}`}
                          onClick={() => setSelectedVehicle(key)}
                        >
                          {isRecommended && <span className="recommended-badge">Recommended</span>}
                          <div className="vehicle-icon">{vehicle.icon}</div>
                          <h5>{vehicle.name.replace(vehicle.icon, '').trim()}</h5>
                          <p className="vehicle-capacity">{vehicle.capacity}</p>
                          <p className="vehicle-cost">₹{cost.toLocaleString()}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Transport Cost Summary */}
                <div className="transport-cost-box">
                  <div className="cost-row">
                    <span>Vehicle:</span>
                    <strong>{VEHICLES[selectedVehicle]?.name}</strong>
                  </div>
                  <div className="cost-row">
                    <span>Base Cost:</span>
                    <strong>₹{VEHICLES[selectedVehicle]?.baseCost}</strong>
                  </div>
                  <div className="cost-row">
                    <span>Distance ({distance} km × ₹{VEHICLES[selectedVehicle]?.perKmRate}/km):</span>
                    <strong>₹{(distance * (VEHICLES[selectedVehicle]?.perKmRate || 0)).toLocaleString()}</strong>
                  </div>
                  <div className="cost-row total">
                    <span>Transport Cost:</span>
                    <strong>₹{transportCost.toLocaleString()}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========== Total Price ========== */}
          <div className="total-price-box">
            <div className="price-breakdown">
              <div className="breakdown-row">
                <span>Product Cost ({qty.toLocaleString()} × ₹{product.price})</span>
                <strong>₹{productCost.toLocaleString()}</strong>
              </div>
              {needTransport && (
                <div className="breakdown-row">
                  <span>Transportation ({VEHICLES[selectedVehicle]?.name})</span>
                  <strong>₹{transportCost.toLocaleString()}</strong>
                </div>
              )}
              {!needTransport && (
                <div className="breakdown-row free">
                  <span>Transportation</span>
                  <strong>Free (Self Pickup)</strong>
                </div>
              )}
              <div className="breakdown-row grand-total">
                <span>Total Amount</span>
                <strong>₹{totalCost.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Buy Buttons */}
          <div className="buy-actions">
            <button 
              className="btn btn-primary btn-lg" 
              onClick={handleBuyClick} 
              disabled={product.quantity <= 0 || qty < getMinQty()} 
              style={{ flex: 1 }}
            >
              <FiShoppingCart /> Buy Now - ₹{totalCost.toLocaleString()}
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

      {/* ========== Buy Confirmation Modal (Updated) ========== */}
      <Modal isOpen={showBuyModal} onClose={() => setShowBuyModal(false)} title="📦 Confirm Your Order">
        <div className="order-modal">
          {/* Product Summary */}
          <div className="modal-section">
            <h3>🧱 Product Details</h3>
            <div className="modal-row">
              <span>Product</span>
              <strong>{product.name}</strong>
            </div>
            <div className="modal-row">
              <span>Unit Price</span>
              <strong>₹{product.price} / {product.unit}</strong>
            </div>
            <div className="modal-row">
              <span>Quantity</span>
              <strong>{qty.toLocaleString()} {product.unit}s</strong>
            </div>
            <div className="modal-row highlight">
              <span>Product Cost</span>
              <strong>₹{productCost.toLocaleString()}</strong>
            </div>
          </div>

          {/* Transportation Summary */}
          <div className="modal-section">
            <h3>🚛 Transportation</h3>
            {needTransport ? (
              <>
                <div className="modal-row">
                  <span>Vehicle</span>
                  <strong>{VEHICLES[selectedVehicle]?.name}</strong>
                </div>
                <div className="modal-row">
                  <span>Delivery Address</span>
                  <strong>{deliveryAddress}</strong>
                </div>
                <div className="modal-row">
                  <span>Distance</span>
                  <strong>{distance} km</strong>
                </div>
                <div className="modal-row highlight">
                  <span>Transport Cost</span>
                  <strong>₹{transportCost.toLocaleString()}</strong>
                </div>
              </>
            ) : (
              <div className="modal-row free">
                <span>Self Pickup</span>
                <strong>Free ✅</strong>
              </div>
            )}
          </div>

          {/* Buyer Details */}
          <div className="modal-section">
            <h3>👤 Your Details (sent to seller)</h3>
            <div className="modal-row">
              <span>Name</span>
              <strong>{user?.name}</strong>
            </div>
            <div className="modal-row">
              <span>Email</span>
              <strong>{user?.email}</strong>
            </div>
            <div className="modal-row">
              <span>Phone</span>
              <strong>{user?.phone}</strong>
            </div>
          </div>

          {/* Grand Total */}
          <div className="modal-total">
            <div className="modal-row">
              <span>Product Cost</span>
              <strong>₹{productCost.toLocaleString()}</strong>
            </div>
            <div className="modal-row">
              <span>Transport Cost</span>
              <strong>{needTransport ? `₹${transportCost.toLocaleString()}` : 'Free'}</strong>
            </div>
            <div className="modal-row grand">
              <span>💰 TOTAL AMOUNT</span>
              <strong>₹{totalCost.toLocaleString()}</strong>
            </div>
          </div>

          <button 
            className="btn btn-primary btn-lg btn-block" 
            onClick={handleConfirmOrder}
            disabled={orderPlacing}
          >
            {orderPlacing ? 'Placing Order...' : `✅ Confirm Order - ₹${totalCost.toLocaleString()}`}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProductDetail;