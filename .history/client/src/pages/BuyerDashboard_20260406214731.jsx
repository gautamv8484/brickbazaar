import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { FiShoppingCart, FiPackage, FiClock } from 'react-icons/fi';

const BuyerDashboard = () => {
  const { user, isAuthenticated, isBuyer } = useContext(AuthContext);

  if (!isAuthenticated || !isBuyer) return <Navigate to="/login" />;

  // Mock orders (later from API)
  const orders = [
    { id: 1, product: 'Red Clay Bricks', seller: 'Sharma Brick Works', qty: 5000, total: 40000, status: 'pending', date: '2024-01-15' },
    { id: 2, product: 'OPC Cement', seller: 'Rajesh Builders', qty: 100, total: 38000, status: 'completed', date: '2024-01-10' },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-welcome">
            <h1>Hello, {user.name}! 👋</h1>
            <p>Welcome to your buyer dashboard</p>
          </div>
          <Link to="/products" className="btn btn-primary">
            <FiShoppingCart /> Browse Products
          </Link>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon buyer"><FiShoppingCart /></div>
            <div className="stat-info">
              <h3>{orders.length}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning"><FiClock /></div>
            <div className="stat-info">
              <h3>{orders.filter(o => o.status === 'pending').length}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success"><FiPackage /></div>
            <div className="stat-info">
              <h3>{orders.filter(o => o.status === 'completed').length}</h3>
              <p>Completed</p>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-title">
            <h2>📦 My Orders</h2>
          </div>
          <div className="section-body">
            {orders.length > 0 ? (
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
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.product}</td>
                      <td>{order.seller}</td>
                      <td>{order.qty}</td>
                      <td>₹{order.total.toLocaleString()}</td>
                      <td><span className={`order-status ${order.status}`}>{order.status}</span></td>
                      <td>{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 40 }}>No orders yet. <Link to="/products">Start shopping!</Link></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;