import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiDollarSign,
  FiStar,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiArrowRight
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getDashboard();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short'
  });

  const getStatusClass = (status) => {
    const classes = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    };
    return classes[status] || '';
  };

  const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="loader"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>📊 Dashboard</h1>
        <p>Welcome to BrickBazaar Admin Panel</p>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card blue">
          <div className="admin-stat-icon"><FiUsers /></div>
          <div className="admin-stat-info">
            <h3>{stats.users.total}</h3>
            <p>Total Users</p>
            <small>{stats.users.buyers} buyers • {stats.users.sellers} sellers</small>
          </div>
        </div>

        <div className="admin-stat-card orange">
          <div className="admin-stat-icon"><FiPackage /></div>
          <div className="admin-stat-info">
            <h3>{stats.products.total}</h3>
            <p>Products</p>
            <small>Listed on platform</small>
          </div>
        </div>

        <div className="admin-stat-card purple">
          <div className="admin-stat-icon"><FiShoppingCart /></div>
          <div className="admin-stat-info">
            <h3>{stats.orders.total}</h3>
            <p>Total Orders</p>
            <small>{stats.orders.pending} pending</small>
          </div>
        </div>

        <div className="admin-stat-card green">
          <div className="admin-stat-icon"><FiDollarSign /></div>
          <div className="admin-stat-info">
            <h3>₹{stats.revenue.total?.toLocaleString()}</h3>
            <p>Total Revenue</p>
            <small>From completed orders</small>
          </div>
        </div>
      </div>

      {/* Order Status Cards */}
      <div className="admin-order-status-grid">
        <div className="order-status-card pending">
          <FiClock />
          <h4>{stats.orders.pending}</h4>
          <p>Pending</p>
        </div>
        <div className="order-status-card confirmed">
          <FiAlertCircle />
          <h4>{stats.orders.confirmed}</h4>
          <p>Confirmed</p>
        </div>
        <div className="order-status-card completed">
          <FiCheckCircle />
          <h4>{stats.orders.completed}</h4>
          <p>Completed</p>
        </div>
        <div className="order-status-card cancelled">
          <FiXCircle />
          <h4>{stats.orders.cancelled}</h4>
          <p>Cancelled</p>
        </div>
      </div>

      <div className="admin-dashboard-grid">
        {/* Monthly Revenue Chart */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3><FiTrendingUp /> Monthly Revenue</h3>
          </div>
          <div className="admin-chart">
            {stats.monthlyRevenue?.length > 0 ? (
              <div className="bar-chart">
                {stats.monthlyRevenue.map((item, i) => {
                  const maxRevenue = Math.max(...stats.monthlyRevenue.map(m => m.revenue));
                  const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;

                  return (
                    <div key={i} className="bar-item">
                      <div className="bar-value">₹{(item.revenue / 1000).toFixed(0)}K</div>
                      <div className="bar-fill-container">
                        <div className="bar-fill" style={{ height: `${Math.max(height, 5)}%` }} />
                      </div>
                      <div className="bar-label">{monthNames[item._id.month]}</div>
                      <div className="bar-orders">{item.orders} orders</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-data">No revenue data yet</div>
            )}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3><FiPackage /> Products by Category</h3>
          </div>
          <div className="category-list">
            {stats.categoryStats?.map((cat, i) => {
              const total = stats.products.total || 1;
              const percentage = Math.round((cat.count / total) * 100);
              const colors = ['#3b82f6', '#ea580c', '#f59e0b', '#10b981', '#8b5cf6'];

              return (
                <div key={i} className="category-item">
                  <div className="category-info">
                    <span className="category-dot" style={{ background: colors[i % colors.length] }} />
                    <span className="category-name">{cat._id}</span>
                    <span className="category-count">{cat.count} products</span>
                  </div>
                  <div className="category-bar-bg">
                    <div
                      className="category-bar-fill"
                      style={{ width: `${percentage}%`, background: colors[i % colors.length] }}
                    />
                  </div>
                  <span className="category-percent">{percentage}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3><FiShoppingCart /> Recent Orders</h3>
            <Link to="/admin/orders" className="admin-card-link">
              View All <FiArrowRight />
            </Link>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Buyer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders?.map((order) => (
                  <tr key={order._id}>
                    <td className="td-product">{order.productName}</td>
                    <td>{order.buyerName}</td>
                    <td className="td-amount">₹{order.totalPrice?.toLocaleString()}</td>
                    <td>
                      <span className={`admin-status ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="td-date">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Sellers */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h3><FiStar /> Top Sellers</h3>
          </div>
          <div className="top-sellers-list">
            {stats.topSellers?.map((seller, i) => (
              <div key={i} className="top-seller-item">
                <div className="top-seller-rank">#{i + 1}</div>
                <div className="top-seller-info">
                  <h4>{seller.sellerName}</h4>
                  <p>{seller.orders} orders</p>
                </div>
                <div className="top-seller-revenue">
                  ₹{seller.revenue?.toLocaleString()}
                </div>
              </div>
            ))}
            {(!stats.topSellers || stats.topSellers.length === 0) && (
              <div className="no-data">No sellers data yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;