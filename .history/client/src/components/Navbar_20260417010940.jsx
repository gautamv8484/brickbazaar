import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
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
  FiUser,
  FiPhone,
} from "react-icons/fi";

const Navbar = () => {
  const { user, isAuthenticated, isSeller, isAdmin, logout } =
    useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
    document.body.style.overflow = '';
  }, [location]);

  // Toggle menu + lock body scroll
  const toggleMenu = () => {
    const newState = !menuOpen;
    setMenuOpen(newState);
    document.body.style.overflow = newState ? 'hidden' : '';
  };

  // Close menu
  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = '';
  };

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/");
  };

  const isHome = location.pathname === "/";

  return (
    <>
      <nav className={`navbar ${scrolled || !isHome ? "scrolled" : ""}`}>
        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <span className="logo-icon">🧱</span>
          Brick<span>Bazaar</span>
        </Link>

        {/* Navigation Links (Desktop + Mobile Sidebar) */}
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <Link to="/" className={location.pathname === "/" ? "active" : ""} onClick={closeMenu}>
            <FiHome className="nav-icon" /> Home
          </Link>

          <Link to="/products" className={location.pathname === "/products" ? "active" : ""} onClick={closeMenu}>
            <FiPackage className="nav-icon" /> Products
          </Link>

          <Link to="/about" className={location.pathname === "/about" ? "active" : ""} onClick={closeMenu}>
            <FiInfo className="nav-icon" /> About
          </Link>

          <Link to="/contact" className={location.pathname === "/contact" ? "active" : ""} onClick={closeMenu}>
            <FiPhone className="nav-icon" /> Contact
          </Link>

          {isAuthenticated && isSeller && (
            <>
              <Link to="/seller/dashboard" className={location.pathname.includes("seller/dashboard") ? "active" : ""} onClick={closeMenu}>
                <FiGrid className="nav-icon" /> Dashboard
              </Link>
              <Link to="/seller/add-product" className={location.pathname === "/seller/add-product" ? "active" : ""} onClick={closeMenu}>
                <FiPlusCircle className="nav-icon" /> Add Product
              </Link>
            </>
          )}

          {isAuthenticated && !isSeller && !isAdmin && (
            <Link to="/buyer/dashboard" className={location.pathname.includes("buyer") ? "active" : ""} onClick={closeMenu}>
              <FiShoppingBag className="nav-icon" /> My Orders
            </Link>
          )}

          {isAuthenticated && isAdmin && (
            <Link to="/admin" className={location.pathname.includes("admin") ? "active" : ""} onClick={closeMenu}>
              <FiGrid className="nav-icon" /> Admin Panel
            </Link>
          )}

          {/* Mobile-only: Profile link */}
          {isAuthenticated && (
            <Link to="/profile" className={location.pathname === "/profile" ? "active" : ""} onClick={closeMenu}>
              <FiUser className="nav-icon" /> My Profile
            </Link>
          )}

          {/* Mobile Auth Buttons */}
          <div className="mobile-auth-buttons">
            {isAuthenticated ? (
              <>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '10px', 
                  padding: '10px 0',
                  marginBottom: '8px'
                }}>
                  <div className={`nav-user-avatar ${user?.role}`} style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    background: user?.role === 'seller' 
                      ? 'linear-gradient(135deg, #9C27B0, #E91E63)' 
                      : user?.role === 'admin'
                        ? 'linear-gradient(135deg, #1e293b, #334155)'
                        : 'linear-gradient(135deg, #2196F3, #03A9F4)'
                  }}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1f2937' }}>
                      {user?.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', textTransform: 'capitalize' }}>
                      {user?.role}
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary btn-block" onClick={handleLogout} style={{ borderRadius: '10px' }}>
                  <FiLogOut /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline btn-block" onClick={closeMenu} style={{ 