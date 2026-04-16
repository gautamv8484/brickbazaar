import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import Modal from '../../components/Modal';
import {
  FiUsers, FiSearch, FiShield, FiSlash, FiCheckCircle,
  FiTrash2, FiEye, FiChevronLeft, FiChevronRight,
  FiUser, FiMail, FiPhone, FiMapPin, FiPackage, FiShoppingCart
} from 'react-icons/fi';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // User detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Ban modal
  const [showBanModal, setShowBanModal] = useState(false);
  const [banUser, setBanUser] = useState(null);
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 15, role: roleFilter };
      if (search) params.search = search;

      const response = await adminAPI.getUsers(params);
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
    setDetailLoading(true);

    try {
      const response = await adminAPI.getUserDetails(user._id);
      setUserDetails(response.data);
    } catch (error) {
      toast.error('Failed to load user details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBanClick = (user) => {
    setBanUser(user);
    setBanReason('');
    setShowBanModal(true);
  };

  const handleConfirmBan = async () => {
    try {
      await adminAPI.toggleBanUser(banUser._id, banReason);
      toast.success(`User ${banUser.isBanned ? 'unbanned' : 'banned'} successfully`);
      setShowBanModal(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"? This will also delete their products, orders data cannot be reversed!`)) return;

    try {
      await adminAPI.deleteUser(user._id);
      toast.success(`User "${user.name}" deleted`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1><FiUsers /> User Management</h1>
        <p>{total} total users</p>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <form className="admin-search" onSubmit={handleSearch}>
          <FiSearch />
          <input
            type="text"
            placeholder="Search by name, email, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary btn-sm">Search</button>
        </form>

        <div className="admin-filter-tabs">
          {['all', 'buyer', 'seller'].map(r => (
            <button
              key={r}
              className={`admin-filter-tab ${roleFilter === r ? 'active' : ''}`}
              onClick={() => { setRoleFilter(r); setPage(1); }}
            >
              {r === 'all' ? 'All Users' : r === 'buyer' ? '🛒 Buyers' : '📦 Sellers'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="admin-loading"><div className="loader"></div><p>Loading users...</p></div>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>City</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className={user.isBanned ? 'row-banned' : ''}>
                    <td>
                      <div className="td-user">
                        <div className={`td-avatar ${user.role}`}>
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <span>{user.name}</span>
                      </div>
                    </td>
                    <td className="td-email">{user.email}</td>
                    <td>{user.phone}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'buyer' ? <FiShoppingCart /> : <FiPackage />}
                        {user.role}
                      </span>
                    </td>
                    <td>{user.city || '-'}</td>
                    <td>
                      {user.isBanned ? (
                        <span className="admin-status status-cancelled">Banned</span>
                      ) : (
                        <span className="admin-status status-completed">Active</span>
                      )}
                    </td>
                    <td className="td-date">{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-action-btn view" onClick={() => handleViewUser(user)} title="View Details">
                          <FiEye />
                        </button>
                        <button
                          className={`admin-action-btn ${user.isBanned ? 'unban' : 'ban'}`}
                          onClick={() => handleBanClick(user)}
                          title={user.isBanned ? 'Unban' : 'Ban'}
                        >
                          {user.isBanned ? <FiCheckCircle /> : <FiSlash />}
                        </button>
                        <button className="admin-action-btn delete" onClick={() => handleDeleteUser(user)} title="Delete">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

      {/* User Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="👤 User Details">
        {detailLoading ? (
          <div className="admin-loading"><div className="loader"></div></div>
        ) : userDetails ? (
          <div className="user-detail-modal">
            <div className="user-detail-header">
              <div className={`user-detail-avatar ${userDetails.user?.role}`}>
                {userDetails.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3>{userDetails.user?.name}</h3>
                <span className={`role-badge ${userDetails.user?.role}`}>{userDetails.user?.role}</span>
                {userDetails.user?.isBanned && <span className="admin-status status-cancelled" style={{ marginLeft: 8 }}>Banned</span>}
              </div>
            </div>

            <div className="user-detail-grid">
              <div className="user-detail-item"><FiMail /> <span>Email:</span> <strong>{userDetails.user?.email}</strong></div>
              <div className="user-detail-item"><FiPhone /> <span>Phone:</span> <strong>{userDetails.user?.phone}</strong></div>
              <div className="user-detail-item"><FiMapPin /> <span>City:</span> <strong>{userDetails.user?.city || 'Not set'}</strong></div>
              <div className="user-detail-item"><FiMapPin /> <span>Address:</span> <strong>{userDetails.user?.address || 'Not set'}</strong></div>
            </div>

            <div className="user-detail-stats">
              <div className="user-stat"><h4>{userDetails.orders?.length || 0}</h4><p>Orders</p></div>
              <div className="user-stat"><h4>{userDetails.products?.length || 0}</h4><p>Products</p></div>
              <div className="user-stat"><h4>{userDetails.reviews?.length || 0}</h4><p>Reviews</p></div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Ban Modal */}
      <Modal isOpen={showBanModal} onClose={() => setShowBanModal(false)} title={banUser?.isBanned ? '✅ Unban User' : '🚫 Ban User'}>
        {banUser && (
          <div className="ban-modal">
            <p>
              {banUser.isBanned
                ? `Are you sure you want to unban "${banUser.name}"?`
                : `Are you sure you want to ban "${banUser.name}"?`}
            </p>

            {!banUser.isBanned && (
              <div className="form-group" style={{ marginTop: 16 }}>
                <label>Reason for ban (optional)</label>
                <textarea
                  placeholder="e.g. Spam, Fake products, Abusive behavior..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            <div className="ban-modal-actions">
              <button className="btn btn-outline" onClick={() => setShowBanModal(false)}>Cancel</button>
              <button
                className={`btn ${banUser.isBanned ? 'btn-success' : 'btn-danger'}`}
                onClick={handleConfirmBan}
              >
                {banUser.isBanned ? '✅ Unban User' : '🚫 Ban User'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsers;