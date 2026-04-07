import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { orderAPI } from '../services/api';
import { Link, Navigate } from 'react-router-dom';
import { FiShoppingCart, FiPackage, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const BuyerDashboard = () => {
  const { user, isAuthenticated, isBuyer } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect if not buyer
  if (!isAuthenticated || !isBuyer) {
    return <Navigate to="/login" />;
  }

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      console.log('📦 Fetching buyer orders...');
      
      const response = await orderAPI.getBuyerOrders();
      console.log('✅ Orders fetched:', response.data);
      
      setOrders(response.data.orders || []);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Get order stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock />;
      case 'confirmed': return <FiPackage />;
      case 'completed': return <FiCheckCircle />;
      case 'cancelled': return <FiXCircle />;
      default: return <FiClock />;
    }
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
            <div className="stat-info">
              <h3>{totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning"><FiClock /></div>
            <div className="stat-info">
              <h3>{pendingOrders}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success"><FiCheckCircle /></div>
            <div className="stat-info">
              <h3>{completedOrders}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="dashboard-section">
          <div className="section-title">
            <h2>📦 My Orders</h2>
            <button className="btn btn-outline btn-sm" onClick={fetchOrders}>
              Refresh
            </button>
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
            ) : orders.length > 0 ? (
              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Product</th>
                      <th>Seller</th>
                      <th>Qty</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order._id}>
                        <td>
                          <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                        </td>
                        <td>
                          <div className="order-product">
                            <span>{order.productName}</span>
                          </div>
                        </td>
                        <td>{order.sellerName}</td>
                        <td>{order.quantity}</td>
                        <td>
                          <span className="order-total">₹{order.totalPrice?.toLocaleString()}</span>
                        </td>
                        <td>
                          <span className={`order-status ${getStatusClass(order.status)}`}>
                            {getStatusIcon(order.status)} {order.status}
                          </span>
                        </td>
                        <td>{formatDate(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <FiShoppingCart size={50} />
                <h3>No orders yet</h3>
                <p>Start shopping to see your orders here!</p>
                <Link to="/products" className="btn btn-primary">
                  Browse Products
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;