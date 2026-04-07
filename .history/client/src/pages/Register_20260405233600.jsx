import React, { useState, useContext } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiLock, FiUserPlus, FiShoppingCart, FiPackage, FiBriefcase, FiMapPin } from 'react-icons/fi';

const Register = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [role, setRole] = useState(searchParams.get('role') || 'buyer');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    businessName: '', gstNumber: '', address: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Replace with real API call
      const mockUser = {
        id: Date.now(),
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: role,
        ...(role === 'seller' && {
          businessName: form.businessName,
          address: form.address
        })
      };

      login(mockUser, 'mock-token-' + Date.now());
      toast.success(`Welcome to BrickBazaar, ${form.name}!`);

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
          <p>Join BrickBazaar as a {role}</p>
        </div>

        {/* Role Selector */}
        <div className="role-selector">
          <div className={`role-option buyer ${role === 'buyer' ? 'active' : ''}`} onClick={() => setRole('buyer')}>
            <div className="role-icon" style={{ background: 'var(--buyer-gradient)', width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#fff' }}>
              <FiShoppingCart size={20} />
            </div>
            <span>Buyer</span>
          </div>
          <div className={`role-option seller ${role === 'seller' ? 'active' : ''}`} onClick={() => setRole('seller')}>
            <div className="role-icon" style={{ background: 'var(--seller-gradient)', width: 50, height: 50, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#fff' }}>
              <FiPackage size={20} />
            </div>
            <span>Seller</span>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label><FiUser /> Full Name</label>
            <input type="text" name="name" placeholder="Enter your name" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label><FiMail /> Email</label>
              <input type="email" name="email" placeholder="Enter email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label><FiPhone /> Phone</label>
              <input type="tel" name="phone" placeholder="Phone number" value={form.phone} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label><FiLock /> Password</label>
            <input type="password" name="password" placeholder="Create a password" value={form.password} onChange={handleChange} required />
          </div>

          {/* Seller Extra Fields */}
          {role === 'seller' && (
            <>
              <div className="form-group">
                <label><FiBriefcase /> Business Name</label>
                <input type="text" name="businessName" placeholder="Your business name" value={form.businessName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label><FiMapPin /> Business Address</label>
                <input type="text" name="address" placeholder="Business address" value={form.address} onChange={handleChange} required />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
            <FiUserPlus /> {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-right-content">
          <h2>{role === 'seller' ? 'Grow Your Business' : 'Build Your Dreams'}</h2>
          <p>{role === 'seller' ? 'Reach thousands of buyers across India.' : 'Access quality materials at best prices.'}</p>
        </div>
      </div>
    </div>
  );
};

export default Register;