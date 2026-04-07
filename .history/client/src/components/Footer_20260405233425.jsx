import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <Link to="/" className="nav-logo">
            <span className="logo-icon">🧱</span>
            Brick<span>Bazaar</span>
          </Link>
          <p>India's most trusted construction materials marketplace. Connecting buyers with verified sellers.</p>
          <div className="footer-social">
            <a href="#"><FiFacebook /></a>
            <a href="#"><FiTwitter /></a>
            <a href="#"><FiInstagram /></a>
            <a href="#"><FiLinkedin /></a>
          </div>
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/register">Register</Link></li>
            <li><Link to="/login">Login</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Materials</h4>
          <ul>
            <li><Link to="/products">Bricks</Link></li>
            <li><Link to="/products">Cement</Link></li>
            <li><Link to="/products">Sand</Link></li>
            <li><Link to="/products">Steel</Link></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Contact</h4>
          <ul>
            <li>📍 Gandhinagar, Gujarat</li>
            <li>📞 +91 98765 43210</li>
            <li>✉️ support@brickbazaar.com</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} BrickBazaar. All Rights Reserved.</p>
        <div className="footer-bottom-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;