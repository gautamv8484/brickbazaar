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
      toast.warning('Please login to contact seller');
      navigate('/login');
      return;
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

          