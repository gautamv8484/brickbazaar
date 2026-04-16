import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { orderAPI, reviewAPI } from '../services/api';
import { Link, Navigate } from 'react-router-dom';
import OrderTimeline from '../components/OrderTimeline';
import ReviewModal from '../components/ReviewModal';
import { toast } from 'react-toastify';
import { 
  FiShoppingCart, 
  FiPackage, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle,
  FiChevronDown,
  FiChevronUp,
  FiMapPin,
  FiTruck,
  FiStar
} from 'react-icons/fi';

const BuyerDashboard = () => {
  const { user, isAuthenticated, isBuyer } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // ========== NEW: Review States ==========
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [reviewedOrders, setReviewedOrders] = useState(new Set());

  if (!isAuthenticated || !isBuyer) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getBuyerOrders();
      const ordersData = response.data.orders || [];
      setOrders(ordersData);
      setError(null);

      // Check which completed orders are already reviewed
      const completedOrders = ordersData.filter(o => o.status === 'completed');
      const reviewed = new Set();

      for (const order of completedOrders) {
        try {
          const checkRes = await reviewAPI.checkReview(order._id);
          if (checkRes.data.hasReviewed) {
            reviewed.add(order._id);
          }
        } catch (err) {
          // Ignore check errors
        }
      }

      setReviewedOrders(reviewed);
    } catch (err) {
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // ========== NEW: Handle Review ==========
  const handleWriteReview = (order) => {
    setSelectedOrderForReview(order);
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = (review) => {
    setReviewedOrders(prev => new Set([...prev, selectedOrderForReview._id]));
    toast.success('Thank you for your review! ⭐');
  };

  // Stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;
  const confirmedOrders = orders.filter(o => o.status === 'confirmed').length;

  const filteredOrders = activeFilter === 'all'
    ? orders
    : orders.filter(o => o.status === activeFilter);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock />;
      case 'confirmed': return <FiPackage />;
      case 'completed': return <FiCheckCircle />;
      case 'cancelled': return <FiXCircle />;
      default: return <FiClock />;
    }
  };

  const toggleOrder = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-welcome">
            <h1>Hello, {user?.name}! 👋</h1>
            <p>Welcome to your buyer dashboard</p>
          </div>
          <Link to="/products" className="btn btn-primary">
            <FiShoppingCart /> Browse Products
          </Link>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon buyer"><FiShoppingCart /></div>
            <div className="stat-info"><h3>{totalOrders}</h3><p>Total Orders</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning"><FiClock /></div>
            <div className="stat-info"><h3>{pendingOrders}</h3><p>Pending</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
              <FiPackage />
            </div>
            <div className="stat-info"><h3>{confirmedOrders}</h3><p>Confirmed</p></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success"><FiCheckCircle /></div>
            <div className="stat-info"><h3>{completedOrders}</h3><p>Completed</p></div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="dashboard-section">
          <div className="section-title">
            <h2>📦 My Orders</h2>
            <button className="btn btn-outline btn-sm" onClick={fetchOrders}>Refresh</button>
          </div>

          {/* Filter Tabs */}
          <div className="order-filter-tabs">
            {[
              { key: 'all', label: 'All', count: totalOrders },
              { key: 'pending', label: 'Pending', count: pendingOrders },
              { key: 'confirmed', label: 'Confirmed', count: confirmedOrders },
              { key: 'completed', label: 'Completed', count: completedOrders }
            ].map(tab => (
              <button
                key={tab.key}
                className={`order-filter-tab ${activeFilter === tab.key ? 'active' : ''}`}
                onClick={() => setActiveFilter(tab.key)}
              >
                {tab.label}
                <span className="filter-count">{tab.count}</span>
              </button>
            ))}
          </div>

          <div className="section-body">
            {loading ? (
              <div className="loading-state">
                <div className="loader"></div>
                <p>Loading orders...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>❌ {error}</p>
                <button className="btn btn-primary" onClick={fetchOrders}>Try Again</button>
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="orders-card-list">
                {filteredOrders.map(order => (
                  <div key={order._id} className="order-card">
                    {/* Order Card Header */}
                    <div className="order-card-header" onClick={() => toggleOrder(order._id)}>
                      <div className="order-card-left">
                        <span className="order-id-badge">#{order._id.slice(-6).toUpperCase()}</span>
                        <div className="order-card-info">
                          <h4>{order.productName}</h4>
                          <p>Seller: {order.sellerName} • {formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      <div className="order-card-right">
                        <span className={`order-status ${getStatusClass(order.status)}`}>
                          {getStatusIcon(order.status)} {order.status}
                        </span>
                        <span className="order-card-total">₹{order.totalPrice?.toLocaleString()}</span>
                        <button className="expand-btn">
                          {expandedOrder === order._id ? <FiChevronUp /> : <FiChevronDown />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Order Details */}
                    {expandedOrder === order._id && (
                      <div className="order-card-body">
                        <div className="order-card-details">
                          <div className="order-details-grid">
                            <div className="order-detail-item">
                              <span>Quantity</span>
                              <strong>{order.quantity?.toLocaleString()} units</strong>
                            </div>
                            <div className="order-detail-item">
                              <span>Product Cost</span>
                              <strong>₹{order.productCost?.toLocaleString()}</strong>
                            </div>
                            <div className="order-detail-item">
                              <span>Transport</span>
                              <strong>
                                {order.transportRequired
                                  ? `₹${order.transportCost?.toLocaleString()} (${order.vehicleName})`
                                  : 'Self Pickup (Free)'}
                              </strong>
                            </div>
                            <div className="order-detail-item total">
                              <span>Total Amount</span>
                              <strong>₹{order.totalPrice?.toLocaleString()}</strong>
                            </div>
                            {order.deliveryAddress && (
                              <div className="order-detail-item full">
                                <span><FiMapPin /> Delivery Address</span>
                                <strong>{order.deliveryAddress}</strong>
                              </div>
                            )}
                            {order.transportRequired && (
                              <div className="order-detail-item full">
                                <span><FiTruck /> Vehicle</span>
                                <strong>{order.vehicleName}</strong>
                              </div>
                            )}
                          </div>

                          <div className="order-timeline-section">
                            <h4>Order Progress</h4>
                            <OrderTimeline
                              status={order.status}
                              createdAt={order.createdAt}
                              updatedAt={order.updatedAt}
                            />
                          </div>
                        </div>

                        {/* ========== NEW: Review Button ========== */}
                        {order.status === 'completed' && (
                          <div className="order-review-section">
                            {reviewedOrders.has(order._id) ? (
                              <div className="review-done-badge">
                                <FiCheckCircle /> You've reviewed this order ⭐
                              </div>
                            ) : (
                              <button
                                className="btn btn-review"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWriteReview(order);
                                }}
                              >
                                <FiStar /> Write a Review
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FiShoppingCart size={50} />
                <h3>No orders found</h3>
                <p>
                  {activeFilter === 'all'
                    ? 'Start shopping to see your orders here!'
                    : `No ${activeFilter} orders found`}
                </p>
                <Link to="/products" className="btn btn-primary">Browse Products</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== NEW: Review Modal ========== */}
      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedOrderForReview(null);
        }}
        order={selectedOrderForReview}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default BuyerDashboard;