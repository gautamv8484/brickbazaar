import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import FormError from '../components/FormError';
import { validateEmail } from '../utils/validators';
import {
  FiArrowLeft, FiMail, FiLock, FiLogIn,
  FiShoppingCart, FiPackage, FiEye, FiEyeOff,
  FiAlertCircle, FiShield  // ← ADD FiShield
} from 'react-icons/fi';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);

  const [form, setForm] = useState({ 
    email: '', 
    password: '' 
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Clear error on type
    if (touched[name]) {
      if (name === 'email') {
        setErrors(prev => ({ ...prev, email: validateEmail(value) }));
      } else if (name === 'password') {
        setErrors(prev => ({ ...prev, password: value ? '' : 'Password is required' }));
      }
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    if (name === 'email') {
      setErrors(prev => ({ ...prev, email: validateEmail(value) }));
    } else if (name === 'password') {
      setErrors(prev => ({ ...prev, password: value ? '' : 'Password is required' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const emailError = validateEmail(form.email);
    const passwordError = form.password ? '' : 'Password is required';

    setErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });

    if (emailError || passwordError) {
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        role: role
      });

      const { user, token } = response.data;

      login(user, token);
      setLoginAttempts(0);
      toast.success(`Welcome back, ${user.name}!`);
      
            if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/products');
      }
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || 'Login failed';
      
      setLoginAttempts(prev => prev + 1);

      // Show helpful messages based on attempts
      if (loginAttempts >= 4) {
        toast.error('Too many failed attempts. Please wait a few minutes.');
      } else if (loginAttempts >= 2) {
        toast.error(`${message}. Make sure you selected the correct role (${role}).`);
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const hasError = (field) => touched[field] && errors[field];

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

          {/* Login Attempts Warning */}
          {loginAttempts >= 3 && (
            <div className="login-warning">
              <FiAlertCircle />
              <span>
                {loginAttempts} failed attempts. Account may be temporarily locked after 10 attempts.
              </span>
            </div>
          )}

          {/* Role Selector */}
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

            <div
              className={`role-option admin ${role === 'admin' ? 'active' : ''}`}
              onClick={() => setRole('admin')}
            >
              <div className="role-icon-wrapper admin">
                <FiShield size={20} />
              </div>
              <span>Admin</span>
              <p>Manage site</p>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className={`form-group ${hasError('email') ? 'has-error' : ''}`}>
              <label><FiMail /> Email Address</label>
              <input 
                type="email" 
                name="email" 
                placeholder="Enter your email" 
                value={form.email} 
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="email"
              />
              <FormError error={errors.email} show={touched.email} />
            </div>

            {/* Password */}
            <div className={`form-group ${hasError('password') ? 'has-error' : ''}`}>
              <label><FiLock /> Password</label>
              <div className="input-wrapper password-field">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  name="password" 
                  placeholder="Enter your password" 
                  value={form.password} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="pass-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <FormError error={errors.password} show={touched.password} />
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