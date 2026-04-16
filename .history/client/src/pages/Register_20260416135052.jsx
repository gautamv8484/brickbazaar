import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import { 
  FiArrowLeft, 
  FiMail, 
  FiLock, 
  FiUser, 
  FiPhone, 
  FiUserPlus, 
  FiShoppingCart, 
  FiPackage,
  FiMapPin,
  FiNavigation
} from 'react-icons/fi';

const Register = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const params = new URLSearchParams(location.search);
  const urlRole = params.get('role');
  
  const [role, setRole] = useState(urlRole || 'buyer');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // ========== NEW: Location Fields ==========
    address: '',
    city: '',
    pincode: '',
    lat: null,
    lng: null
    // ==========================================
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ========== Auto Detect Location ==========
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocationLoading(true);
    toast.info('📍 Detecting your location...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        console.log('📍 Location detected:', latitude, longitude);

        // Try to get city name from coordinates (Reverse Geocoding)
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          
          const city = data.address?.city || 
                       data.address?.town || 
                       data.address?.village || 
                       data.address?.county || '';
          
          const pincode = data.address?.postcode || '';
          const state = data.address?.state || '';
          const address = data.display_name || '';

          setForm(prev => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            city: city,
            pincode: pincode,
            address: `${city}, ${state}`
          }));

          toast.success(`✅ Location detected: ${city}, ${state}`);
        } catch (err) {
          // Even if geocoding fails, save coordinates
          setForm(prev => ({
            ...prev,
            lat: latitude,
            lng: longitude
          }));
          toast.success('✅ Location coordinates saved!');
        }

        setLocationLoading(false);
      },
      (error) => {
        setLocationLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('❌ Location permission denied. Please enter manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('❌ Location unavailable. Please enter manually.');
            break;
          default:
            toast.error('❌ Could not get location. Please enter manually.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters!');
      return;
    }

    // Seller must have city
    if (role === 'seller' && !form.city) {
      toast.error('Sellers must provide their city!');
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: role,
        // ========== NEW: Send Location ==========
        address: form.address,
        city: form.city,
        pincode: form.pincode,
        lat: form.lat,
        lng: form.lng
        // ========================================
      });

      const { user, token } = response.data;

      login(user, token);
      toast.success(`Welcome, ${user.name}! Registration successful. 🎉`);
      
      if (role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/products');
      }
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.message || 'Registration failed.';
      toast.error(message);
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
            <div 
              className={`role-option buyer ${role === 'buyer' ? 'active' : ''}`} 
              onClick={() => setRole('buyer')}
            >
              <div className="role-icon-wrapper buyer">
                <FiShoppingCart size={18} />
              </div>
              <span>Buyer</span>
              <p>Buy materials</p>
            </div>
            
            <div 
              className={`role-option seller ${role === 'seller' ? 'active' : ''}`} 
              onClick={() => setRole('seller')}
            >
              <div className="role-icon-wrapper seller">
                <FiPackage size={18} />
              </div>
              <span>Seller</span>
              <p>Sell materials</p>
            </div>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Basic Fields */}
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

            {/* ========== NEW: Location Section ========== */}
            <div className="location-section">
              <div className="location-header">
                <label>
                  <FiMapPin /> 
                  {role === 'seller' ? 'Business Location (Required)' : 'Your Location (Optional)'}
                </label>
                <button
                  type="button"
                  className="detect-location-btn"
                  onClick={handleDetectLocation}
                  disabled={locationLoading}
                >
                  <FiNavigation />
                  {locationLoading ? 'Detecting...' : 'Auto Detect'}
                </button>
              </div>

              {/* Location Status */}
              {form.lat && form.lng && (
                <div className="location-detected">
                  <FiMapPin />
                  <span>
                    📍 Location saved: {form.city || `${form.lat?.toFixed(4)}, ${form.lng?.toFixed(4)}`}
                  </span>
                </div>
              )}

              {/* City & Pincode */}
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Ahmedabad"
                    value={form.city}
                    onChange={handleChange}
                    required={role === 'seller'}
                  />
                </div>
                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="e.g. 380001"
                    value={form.pincode}
                    onChange={handleChange}
                    maxLength="6"
                  />
                </div>
              </div>

              {/* Seller Address */}
              {role === 'seller' && (
                <div className="form-group">
                  <label>Business Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="e.g. 123 Industrial Area, Ahmedabad"
                    value={form.address}
                    onChange={handleChange}
                  />
                </div>
              )}

              <small className="location-hint">
                {role === 'seller' 
                  ? '📍 Location helps buyers find you nearby. Click "Auto Detect" or enter manually.'
                  : '📍 Optional: Helps find nearest sellers. You can also set it later.'
                }
              </small>
            </div>
            {/* ========================================== */}

            {/* Password Fields */}
            <div className="form-row">
              <div className="form-group">
                <label><FiLock /> Password</label>
                <input 
                  type="password" 
                  name="password" 
                  placeholder="Min 6 characters" 
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
                  placeholder="Confirm password" 
                  value={form.confirmPassword} 
                  onChange={handleChange} 
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg btn-block" 
              disabled={loading}
            >
              <FiUserPlus /> {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already have an account? <Link to="/login">Login Now</Link></p>
          </div>
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