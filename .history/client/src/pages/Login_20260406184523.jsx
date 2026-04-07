import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  FiArrowLeft, 
  FiMail, 
  FiLock, 
  FiLogIn, 
  FiShoppingCart, 
  FiPackage 
} from 'react-icons/fi';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ 
    email: '', 
    password: '' 
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with API call later
      // const res = await api.post('/auth/login', { ...form, role });

      // Mock login for now
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
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

      login(user, 'token-' + user.id);
      toast.success(`Welcome back, ${user.name}!`);
      
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
        <div className="auth-left-content">
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
              <div className="role-icon-wrapper buyer">
                <FiShoppingCart size={20} />
              </div>
              <span>Buyer</span>
              <p>Buy materials</p>
            </div>
            
            <div 
              className={`role-option seller ${role === 'seller' ? 'active' : ''}`} 
              onClick={() => setRole('seller')}
            >
              <div className="role-icon-wrapper seller">
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

            <button 
              type="submit" 
              className="btn btn-primary btn-lg btn-block" 
              disabled={loading}
            >
              <FiLogIn /> {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Don't have an account? <Link to="/register">Register Now</Link></p>
          </div>
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