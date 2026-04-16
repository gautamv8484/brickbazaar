import React, { useContext } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  FiGrid,
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiStar,
  FiShield,
  FiLogOut
} from 'react-icons/fi';

const AdminLayout = () => {
  const { user, isAuthenticated, isAdmin, logout } = useContext(AuthContext);

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-logo">
            <FiShield size={24} />
            <div>
              <h3>Admin Panel</h3>
              <p>BrickBazaar</p>
            </div>
          </div>
        </div>

        <nav className="admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
            <FiGrid /> <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
            <FiUsers /> <span>Users</span>
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
            <FiPackage /> <span>Products</span>
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
            <FiShoppingCart /> <span>Orders</span>
          </NavLink>
          <NavLink to="/admin/reviews" className={({ isActive }) => isActive ? 'admin-nav-link active' : 'admin-nav-link'}>
            <FiStar /> <span>Reviews</span>
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-info">
            <div className="admin-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="admin-user-name">{user?.name}</p>
              <p className="admin-user-role">Administrator</p>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={logout}>
            <FiLogOut />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;