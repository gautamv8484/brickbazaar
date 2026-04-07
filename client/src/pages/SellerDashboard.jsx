import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { productAPI, orderAPI } from '../services/api';
import { Link, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiPackage, 
  FiShoppingCart, 
  FiDollarSign, 
  FiPlusCircle,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiEdit
} from 'react-icons/fi';

const SellerDashboard = () => {
  const { user, isAuthenticated, isSeller } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  // Redirect if not seller
  if (!isAuthenticated || !isSeller) {
    return <Navigate to="/login" />;
  }

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('📦 Fetching seller data...');
      
      const [productsRes, ordersRes] = await Promise.all([
        productAPI.getMyProducts(),
        orderAPI.getSellerOrders()
      ]);
      
      console.log('✅ Products:', productsRes.data);
      console.log('✅ Orders:', ordersRes.data);
      
      setProducts(productsRes.data.products || []);
      setOrders(ordersRes.data.orders || []);
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      toast.success(`Order ${newStatus}!`);
      fetchData(); // Refresh data
    } catch (err) {
      console.error('❌ Error updating status:', err);
      toast.error('Failed to update status');
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await productAPI.delete(productId);
      toast.success('Product deleted!');
      fetchData(); // Refresh data
    } catch (err) {
      console.error('❌ Error deleting product:', err);
      toast.error('Failed to delete product');
    }
  };

  // Stats
  const totalProducts = products.length;
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get status class
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'completed': return 'status-completed';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header seller">
        <div className="dashboard-header-content">
          <div className="dashboard-welcome">
            <h1>Hello, {user?.name}! 👋</h1>
            <p>Welcome to your seller dashboard</p>
          </div>
          <Link to="/seller/add-product" className="btn btn-primary">
            <FiPlusCircle /> Add Product
          </Link>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon seller"><FiPackage /></div>
            <div className="stat-info">
              <h3>{totalProducts}</h3>
              <p>Products</p>
            </div>
          </div>
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
            <div className="stat-icon success"><FiDollarSign /></div>
            <div className="stat-info">
              <h3>₹{totalRevenue.toLocaleString()}</h3>
              <p>Revenue</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <FiShoppingCart /> Orders ({totalOrders})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <FiPackage /> My Products ({totalProducts})
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading...</p>
          </div>
        ) : (
          <>
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="dashboard-section">
                <div className="section-title">
                  <h2>📥 Received Orders</h2>
                  <button className="btn btn-outline btn-sm" onClick={fetchData}>
                    Refresh
                  </button>
                </div>
                
                <div className="section-body">
                  {orders.length > 0 ? (
                    <div className="orders-table-wrapper">
                      <table className="orders-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Product</th>
                            <th>Buyer</th>
                            <th>Contact</th>
                            <th>Qty</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map(order => (
                            <tr key={order._id}>
                              <td>
                                <span className="order-id">#{order._id.slice(-6).toUpperCase()}</span>
                              </td>
                              <td>{order.productName}</td>
                              <td>
                                <strong>{order.buyerName}</strong>
                              </td>
                              <td>
                                <div className="buyer-contact">
                                  <small>{order.buyerEmail}</small>
                                  <small>{order.buyerPhone}</small>
                                </div>
                              </td>
                              <td>{order.quantity}</td>
                              <td>
                                <span className="order-total">₹{order.totalPrice?.toLocaleString()}</span>
                              </td>
                              <td>
                                <span className={`order-status ${getStatusClass(order.status)}`}>
                                  {order.status}
                                </span>
                              </td>
                              <td>{formatDate(order.createdAt)}</td>
                              <td>
                                <div className="action-buttons">
                                  {order.status === 'pending' && (
                                    <>
                                      <button 
                                        className="btn btn-sm btn-success"
                                        onClick={() => handleUpdateStatus(order._id, 'confirmed')}
                                        title="Confirm"
                                      >
                                        <FiCheckCircle />
                                      </button>
                                      <button 
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleUpdateStatus(order._id, 'cancelled')}
                                        title="Cancel"
                                      >
                                        <FiXCircle />
                                      </button>
                                    </>
                                  )}
                                  {order.status === 'confirmed' && (
                                    <button 
                                      className="btn btn-sm btn-success"
                                      onClick={() => handleUpdateStatus(order._id, 'completed')}
                                      title="Mark Complete"
                                    >
                                      <FiCheckCircle /> Complete
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <FiShoppingCart size={50} />
                      <h3>No orders yet</h3>
                      <p>When buyers order your products, they'll appear here.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="dashboard-section">
                <div className="section-title">
                  <h2>📦 My Products</h2>
                  <Link to="/seller/add-product" className="btn btn-primary btn-sm">
                    <FiPlusCircle /> Add New
                  </Link>
                </div>
                
                <div className="section-body">
                  {products.length > 0 ? (
                    <div className="products-table-wrapper">
                      <table className="orders-table">
                        <thead>
                          <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map(product => (
                            <tr key={product._id}>
                              <td>
                                <img 
                                  src={product.image || 'https://via.placeholder.com/50'} 
                                  alt={product.name}
                                  className="product-thumb"
                                  onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1590075865003-e48277faa558?w=50';
                                  }}
                                />
                              </td>
                              <td><strong>{product.name}</strong></td>
                              <td>{product.category}</td>
                              <td>₹{product.price}/{product.unit}</td>
                              <td>
                                <span className={product.quantity > 0 ? 'text-success' : 'text-danger'}>
                                  {product.quantity} {product.unit}s
                                </span>
                              </td>
                              <td>
                                <div className="action-buttons">
                                  <Link 
                                    to={`/product/${product._id}`} 
                                    className="btn btn-sm btn-outline"
                                    title="View"
                                  >
                                    View
                                  </Link>
                                  <button 
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDeleteProduct(product._id)}
                                    title="Delete"
                                  >
                                    <FiTrash2 />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <FiPackage size={50} />
                      <h3>No products yet</h3>
                      <p>Start adding products to sell!</p>
                      <Link to="/seller/add-product" className="btn btn-primary">
                        <FiPlusCircle /> Add Product
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;