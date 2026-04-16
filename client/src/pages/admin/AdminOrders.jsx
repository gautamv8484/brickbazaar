import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import {
  FiShoppingCart, FiSearch, FiXCircle,
  FiChevronLeft, FiChevronRight, FiTruck, FiMapPin
} from 'react-icons/fi';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15, status: statusFilter };
      if (search) params.search = search;

      const response = await adminAPI.getOrders(params);
      setOrders(response.data.orders);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm(`Cancel order #${order._id.slice(-6).toUpperCase()}? Stock will be restored.`)) return;

    try {
      await adminAPI.cancelOrder(order._id);
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const getStatusClass = (status) => {
    const classes = { pending: 'status-pending', confirmed: 'status-confirmed', completed: 'status-completed', cancelled: 'status-cancelled' };
    return classes[status] || '';
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1><FiShoppingCart /> Order Management</h1>
        <p>{total} total orders</p>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <form className="admin-search" onSubmit={handleSearch}>
          <FiSearch />
          <input
            type="text"
            placeholder="Search by product, buyer, seller..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div className="admin-filter-tabs">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(s => (
            <button
              key={s}
              className={`admin-filter-tab ${statusFilter === s ? 'active' : ''}`}
              onClick={() => { setStatusFilter(s); setPage(1); }}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="loader"></div><p>Loading orders...</p></div>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Product</th>
                  <th>Buyer</th>
                  <th>Seller</th>
                  <th>Qty</th>
                  <th>Amount</th>
                  <th>Transport</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td><span className="order-id-small">#{order._id.slice(-6).toUpperCase()}</span></td>
                    <td className="td-product">{order.productName}</td>
                    <td>{order.buyerName}</td>
                    <td>{order.sellerName}</td>
                    <td>{order.quantity?.toLocaleString()}</td>
                    <td className="td-amount">₹{order.totalPrice?.toLocaleString()}</td>
                    <td>
                      {order.transportRequired ? (
                        <span className="transport-badge">
                          <FiTruck size={12} /> {order.vehicleName?.split('(')[0]}
                        </span>
                      ) : (
                        <span className="self-pickup-badge">Self Pickup</span>
                      )}
                    </td>
                    <td><span className={`admin-status ${getStatusClass(order.status)}`}>{order.status}</span></td>
                    <td className="td-date">{formatDate(order.createdAt)}</td>
                    <td>
                      <div className="admin-actions">
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <button
                            className="admin-action-btn delete"
                            onClick={() => handleCancelOrder(order)}
                            title="Cancel Order"
                          >
                            <FiXCircle />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                <FiChevronLeft /> Prev
              </button>
              <span>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminOrders;