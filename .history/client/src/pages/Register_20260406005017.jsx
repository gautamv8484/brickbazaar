import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiMail, FiLock, FiUser, FiPhone, FiUserPlus, FiShoppingCart, FiPackage } from 'react-icons/fi';

const Register = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const params = new URLSearchParams(location.search);
  const urlRole = params.get('role');
  
  const [role, setRole] = useState(urlRole || 'buyer');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters!');
      return;
    }

    setLoading(true);

    try {
      // Get existing users
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Check if email already exists
      if (users.find(u => u.email === form.email)) {
        toast.error('Email already registered!');
        setLoading(false);
        return;
      }

      // Create new user
      const newUser = {
        id: Date.now(),
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: role
      };

      // Save to localStorage
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      // Auto login
      login(newUser, 'token-' + newUser.id);
      
      toast.success(`Welcome, ${newUser.name}! Registration successful.`);
      
      // Redirect based on role
      if (role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/products');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <Link to="/" className="auth-back">
          <FiArrowLeft /> Back to Home
        </Link>

        <div className="auth-header">
          <h1>Create Account 🚀</h1>
          <p>Join BrickBazaar and start building today</p>
        </div>

        {/* Role Selector */}
        <div className="role-selector">
          <div 
            className={`role-option buyer ${role === 'buyer' ? 'active' : ''}`} 
            onClick={() => setRole('buyer')}
          >
            <div className="role-icon" style={{ 
              background: 'var(--buyer-gradient)', 
              width: 50, 
              height: 50, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 10px', 
              color: '#fff' 
            }}>
              <FiShoppingCart size={20} />
            </div>
            <span>Buyer</span>
            <p>Buy materials</p>
          </div>
          
          <div 
            className={`role-option seller ${role === 'seller' ? 'active' : ''}`} 
            onClick={() => setRole('seller')}
          >
            <div className="role-icon" style={{ 
              background: 'var(--seller-gradient)', 
              width: 50, 
              height: 50, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 10px', 
              color: '#fff' 
            }}>
              <FiPackage size={20} />
            </div>
            <span>Seller</span>
            <p>Sell materials</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FiUser /> Full Name</label>
            <input 
              type="text" 
              name="name" 
              placeholder="Enter your full name" 
              value={form.name} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label><FiMail /> Email Address</label>
            <input 
              type="email" 
              name="email" 
              placeholder="Enter your email" 
              value={form.email} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label><FiPhone /> Phone Number</label>
            <input 
              type="tel" 
              name="phone" 
              placeholder="Enter your phone number" 
              value={form.phone} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label><FiLock /> Password</label>
            <input 
              type="password" 
              name="password" 
              placeholder="Create a password (min 6 characters)" 
              value={form.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label><FiLock /> Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword" 
              placeholder="Confirm your password" 
              value={form.confirmPassword} 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            <FiUserPlus /> {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login Now</Link></p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-right-content">
          <h2>Join India's #1 Construction Marketplace</h2>
          <p>Connect with thousands of verified buyers and sellers across the country.</p>
        </div>
      </div>
    </div>
  );
};

export default Register;