import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import { FiPackage, FiPlusCircle, FiDollarSign, FiClock, FiUser } from 'react-icons/fi';

const SellerDashboard = () => {
  const { user, isAuthenticated, isSeller } = useContext(AuthContext);

  if (!isAuthenticated || !isSeller) return <Navigate to="/login" />;

  // Mock data (later from API)
  const products = [
    { id: 1, name: 'Red Clay Bricks', price: 8, unit: 'piece', quantity: 50000, orders: 12 },
    { id: 2, name: 'Fly Ash Bricks', price: 6, unit: 'piece', quantity: 30000, orders: 8 },
  ];

  const orders = [
    { id: 101, product: 'Red Clay Bricks', buyerName: 'Amit Patel', buyerPhone: '9898989898', buyerEmail: 'amit@gmail.com', qty: 5000, total: 40000, status: 'pending', date: '2024-01-15' },
    { id: 102, product: 'Fly Ash Bricks', buyerName: 'Ravi Shah', buyerPhone: '9797979797', buyerEmail: 'ravi@gmail.com', qty: 3000, total: 18000, status: 'completed', date: '2024-01-12' },
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-welcome">
            <h1>Hello, {user.name}! 🏪</h1>
            <p>Manage your products and orders</p>
          </div>
          <Link to="/seller/add-product" className="btn btn-primary">
            <FiPlusCircle /> Add Product
          </Link>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon seller"><FiPackage /></div>
            <div className="stat-info">
              <h3>{products.length}</h3>
              <p>My Products</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon primary"><FiDollarSign /></div>
            <div className="stat-info">
              <h3>{orders.length}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning"><FiClock /></div>
            <div className="stat-info">
              <h3>{orders.filter(o => o.status === 'pending').length}</h3>
              <p>Pending Orders</p>
            </div>
          </div>
        </div>

        {/* Received Orders - Shows Buyer Details */}
        <div className="dashboard-section">
          <div className="section-title">
            <h2>📋 Received Orders (Buyer Details)</h2>
          </div>
          <div className="section-body">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Buyer Name</th>
                  <th>Buyer Phone</th>
                  <th>Buyer Email</th>
                  <th>Qty</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>#{order.id}</td>
                    <td>{order.product}</td>
                    <td><strong><FiUser size={14} /> {order.buyerName}</strong></td>
                    <td>📞 {order.buyerPhone}</td>
                    <td>✉️ {order.buyerEmail}</td>
                    <td>{order.qty}</td>
                    <td>₹{order.total.toLocaleString()}</td>
                    <td><span className={`order-status ${order.status}`}>{order.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* My Products */}
        <div className="dashboard-section">
          <div className="section-title">
            <h2>📦 My Products</h2>
            <Link to="/seller/add-product" className="btn btn-primary" style={{ padding: '8px 20px' }}>
              <FiPlusCircle /> Add New
            </Link>
          </div>
          <div className="section-body">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Orders</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.name}</strong></td>
                    <td>₹{p.price} / {p.unit}</td>
                    <td>{p.quantity.toLocaleString()}</td>
                    <td>{p.orders}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;