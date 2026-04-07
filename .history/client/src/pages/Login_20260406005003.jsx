import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiMail, FiLock, FiLogIn, FiShoppingCart, FiPackage } from 'react-icons/fi';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get registered users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Find user with matching email, password, and role
      const user = users.find(
        u => u.email === form.email && 
             u.password === form.password && 
             u.role === role
      );

      if (!user) {
        toast.error('Invalid credentials or role mismatch!');
        setLoading(false);
        return;
      }

      // Login successful
      login(user, 'token-' + user.id);
      toast.success(`Welcome back, ${user.name}!`);
      
      // Redirect based on role
      if (role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/products');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
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
          <h1>Welcome Back! 👋</h1>
          <p>Login to your BrickBazaar account</p>
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
            <label><FiLock /> Password</label>
            <input 
              type="password" 
              name="password" 
              placeholder="Enter your password" 
              value={form.password} 
              onChange={handleChange} 
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            <FiLogIn /> {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Register Now</Link></p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-right-content">
          <h2>Build Smarter with BrickBazaar</h2>
          <p>Access thousands of construction materials from verified suppliers at the best prices.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;