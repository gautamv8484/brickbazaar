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
          {/* ... role options ... */}
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* ... form fields ... */}
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Register Now</Link></p>
        </div>
      </div>
    </div>

    <div className="auth-right">
      {/* ... right side content ... */}
    </div>
  </div>

  );
};

export default Login;