import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  FiMenu, 
  FiX, 
  FiShoppingBag, 
  FiLogOut, 
  FiPlusCircle, 
  FiGrid,
  FiHome,
  FiPackage,
  FiInfo,
  FiPhone
} from 'react-icons/fi';

const Navbar = () => {
  const { user, isAuthenticated, isSeller, logout } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isHome = location.pathname === '/';

  return (
    <nav className={`navbar ${scrolled || !isHome ? 'scrolled' : ''}`}>
      {/* Logo */}
      <Link to="/" className="nav-logo">
        <span className="logo-icon">🧱</span>
        Brick<span>Bazaar</span>
      </Link>

      {/* Navigation Links */}
      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
          <FiHome className="nav-icon" /> Home
        </Link>
        
        <Link to="/products" className={location.pathname === '/products' ? 'active' : ''}>
          <FiPackage className="nav-icon" /> Products
        </Link>

        <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>
          <FiInfo className="nav-icon" /> About
        </Link>

        <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''}>
          <FiPhone className="nav-icon" /> Contact
        </Link>

        {isAuthenticated && isSeller && (
          <>
            <Link to="/seller/dashboard" className={location.pathname.includes('seller/dashboard') ? 'active' : ''}>
              <FiGrid className="nav-icon" /> Dashboard
            </Link>
            <Link to="/seller/add-product" className={location.pathname === '/seller/add-product' ? 'active' : ''}>
              <FiPlusCircle className="nav-icon" /> Add Product
            </Link>
          </>
        )}

        {isAuthenticated && !isSeller && (
          <Link to="/buyer/dashboard" className={location.pathname.includes('buyer') ? 'active' : ''}>
            <FiShoppingBag className="nav-icon" /> My Orders
          </Link>
        )}

        Mobile Only - Auth Buttons
        <div className="mobile-auth-buttons">
          {isAuthenticated ? (
            <button className="btn btn-primary btn-block" onClick={handleLogout}>
              <FiLogOut /> Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-block">Login</Link>
              <Link to="/register" className="btn btn-primary btn-block">Register</Link>
            </>
          )}
        </div>
      </div>

      {/* Desktop Only - Auth Actions */}
      <div className="nav-actions">
        {isAuthenticated ? (
          <div className="nav-user">
            <div className={`nav-user-avatar ${user?.role}`}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="nav-user-info">
              <span className="nav-user-name">{user?.name}</span>
              <span className="nav-user-role">{user?.role}</span>
            </div>

            <div className="nav-dropdown">
              <Link to={isSeller ? '/seller/dashboard' : '/buyer/dashboard'}>
                <FiGrid /> Dashboard
              </Link>
              {isSeller && (
                <Link to="/seller/add-product">
                  <FiPlusCircle /> Add Product
                </Link>
              )}
              <Link to="/products">
                <FiShoppingBag /> Products
              </Link>
              <hr />
              <button className="logout-btn" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        ) : (
          <>
            <Link 
              to="/login" 
              className="btn btn-outline"
              style={!isHome || scrolled ? { borderColor: 'var(--primary)', color: 'var(--primary)' } : {}}
            >
              Login
            </Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>
    </nav>
  );
};

export default Navbar;