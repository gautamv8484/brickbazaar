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
      <div className="auth-left-content">
        <Link to="/" className="auth-back">
          <FiArrowLeft /> Back to Home
        </Link>

        <div className="auth-header">
          <h1>Create Account 🚀</h1>
          <p>Join BrickBazaar today</p>
        </div>

        {/* Role Selector */}
        <div className="role-selector">
          {/* ... role options ... */}
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {/* ... form fields ... */}
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login Now</Link></p>
        </div>
      </div>
    </div>

    <div className="auth-right">
      {/* ... right side content ... */}
    </div>
  </div>
);
};

export default Register;