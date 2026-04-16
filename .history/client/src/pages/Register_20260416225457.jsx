import React, { useState, useContext, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { authAPI } from '../services/api';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import FormError from '../components/FormError';
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
  validateCity,
  validatePincode,
  formatPhone,
  getPasswordStrength
} from '../utils/validators';
import { 
  FiArrowLeft, FiMail, FiLock, FiUser, FiPhone, 
  FiUserPlus, FiShoppingCart, FiPackage,
  FiMapPin, FiNavigation, FiEye, FiEyeOff,
  FiCheckCircle
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: '',
    pincode: '',
    lat: null,
    lng: null
  });

  // ========== Validation Errors State ==========
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ========== Validate Single Field ==========
  const validateField = useCallback((name, value) => {
    switch (name) {
      case 'name': return validateName(value);
      case 'email': return validateEmail(value);
      case 'phone': return validatePhone(value);
      case 'password': return validatePassword(value);
      case 'confirmPassword': return validateConfirmPassword(form.password, value);
      case 'city': return validateCity(value, role === 'seller');
      case 'pincode': return validatePincode(value);
      default: return '';
    }
  }, [form.password, role]);

  // ========== Handle Input Change with Validation ==========
  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    // Auto-format phone number
    if (name === 'phone') {
      processedValue = formatPhone(value);
    }

    // Update form
    setForm(prev => ({ ...prev, [name]: processedValue }));

    // Real-time validation (only if field was touched)
    if (touched[name]) {
      const error = validateField(name, processedValue);
      setErrors(prev => ({ ...prev, [name]: error }));

      // Also validate confirmPassword when password changes
      if (name === 'password' && touched.confirmPassword) {
        const confirmError = validateConfirmPassword(processedValue, form.confirmPassword);
        setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
      }
    }
  };

  // ========== Handle Field Blur (Mark as Touched) ==========
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
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

          setForm(prev => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            city: city,
            pincode: pincode,
            address: `${city}, ${state}`
          }));

          // Clear city error if detected
          if (city) {
            setErrors(prev => ({ ...prev, city: '' }));
          }

          toast.success(`✅ Location detected: ${city}, ${state}`);
        } catch (err) {
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
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // ========== Validate All Fields ==========
  const validateAll = () => {
    const newErrors = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
      city: validateCity(form.city, role === 'seller'),
      pincode: validatePincode(form.pincode)
    };

    setErrors(newErrors);
    setTouched({
      name: true, email: true, phone: true,
      password: true, confirmPassword: true,
      city: true, pincode: true
    });

    // Return true if no errors
    return !Object.values(newErrors).some(err => err !== '');
  };

  // ========== Check if Form is Valid ==========
  const isFormValid = () => {
    const strength = getPasswordStrength(form.password);
    return (
      form.name.trim().length >= 3 &&
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email) &&
      /^[6-9]\d{9}$/.test(form.phone.replace(/[\s\-+]/g, '').replace(/^91/, '')) &&
      strength.level >= 2 &&
      form.password === form.confirmPassword &&
      (role !== 'seller' || form.city.trim().length >= 2)
    );
  };

  // ========== Handle Submit ==========
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (!validateAll()) {
      toast.error('Please fix the errors in the form');
      // Scroll to first error
      const firstError = document.querySelector('.form-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        password: form.password,
        role: role,
        address: form.address.trim(),
        city: form.city.trim(),
        pincode: form.pincode.trim(),
        lat: form.lat,
        lng: form.lng
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
      const errorData = error.response?.data;
      
      // Handle field-specific errors from backend
      if (errorData?.errors) {
        const backendErrors = {};
        errorData.errors.forEach(err => {
          if (err.field) backendErrors[err.field] = err.message;
        });
        setErrors(prev => ({ ...prev, ...backendErrors }));
      }
      
      toast.error(errorData?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to check if field has error
  const hasError = (field) => touched[field] && errors[field];

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

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div className={`form-group ${hasError('name') ? 'has-error' : touched.name && !errors.name ? 'has-success' : ''}`}>
              <label><FiUser /> Full Name</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Enter your full name" 
                  value={form.name} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={50}
                />
                {touched.name && !errors.name && form.name && (
                  <FiCheckCircle className="input-success-icon" />
                )}
              </div>
              <FormError error={errors.name} show={touched.name} />
              <small className="char-count">{form.name.length}/50</small>
            </div>

            {/* Email */}
            <div className={`form-group ${hasError('email') ? 'has-error' : touched.email && !errors.email ? 'has-success' : ''}`}>
              <label><FiMail /> Email Address</label>
              <div className="input-wrapper">
                <input 
                  type="email" 
                  name="email" 
                  placeholder="Enter your email" 
                  value={form.email} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={100}
                />
                {touched.email && !errors.email && form.email && (
                  <FiCheckCircle className="input-success-icon" />
                )}
              </div>
              <FormError error={errors.email} show={touched.email} />
            </div>

            {/* Phone */}
            <div className={`form-group ${hasError('phone') ? 'has-error' : touched.phone && !errors.phone ? 'has-success' : ''}`}>
              <label><FiPhone /> Phone Number</label>
              <div className="input-wrapper phone-input">
                <span className="phone-prefix">+91</span>
                <input 
                  type="tel" 
                  name="phone" 
                  placeholder="9876543210" 
                  value={form.phone} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  maxLength={10}
                />
                {touched.phone && !errors.phone && form.phone && (
                  <FiCheckCircle className="input-success-icon" />
                )}
              </div>
              <FormError error={errors.phone} show={touched.phone} />
            </div>

            {/* Location Section */}
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

              {form.lat && form.lng && (
                <div className="location-detected">
                  <FiCheckCircle />
                  <span>
                    📍 Location saved: {form.city || `${form.lat?.toFixed(4)}, ${form.lng?.toFixed(4)}`}
                  </span>
                </div>
              )}

              <div className="form-row">
                <div className={`form-group ${hasError('city') ? 'has-error' : ''}`}>
                  <label>City {role === 'seller' && <span className="required">*</span>}</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="e.g. Ahmedabad"
                    value={form.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={50}
                  />
                  <FormError error={errors.city} show={touched.city} />
                </div>
                <div className={`form-group ${hasError('pincode') ? 'has-error' : ''}`}>
                  <label>Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    placeholder="e.g. 380001"
                    value={form.pincode}
                    onChange={(e) => {
                      // Only allow digits, max 6
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setForm(prev => ({ ...prev, pincode: val }));
                      if (touched.pincode) {
                        setErrors(prev => ({ ...prev, pincode: validatePincode(val) }));
                      }
                    }}
                    onBlur={handleBlur}
                    maxLength={6}
                  />
                  <FormError error={errors.pincode} show={touched.pincode} />
                </div>
              </div>

              {role === 'seller' && (
                <div className="form-group">
                  <label>Business Address</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="e.g. 123 Industrial Area, Ahmedabad"
                    value={form.address}
                    onChange={handleChange}
                    maxLength={200}
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

            {/* Password */}
            <div className={`form-group ${hasError('password') ? 'has-error' : touched.password && !errors.password ? 'has-success' : ''}`}>
              <label><FiLock /> Password</label>
              <div className="input-wrapper password-field">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  name="password" 
                  placeholder="Create a strong password" 
                  value={form.password} 
                  onChange={handleChange}
                  onBlur={handleBlur}
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
              <PasswordStrengthMeter password={form.password} />
            </div>

            {/* Confirm Password */}
            <div className={`form-group ${hasError('confirmPassword') ? 'has-error' : touched.confirmPassword && !errors.confirmPassword && form.confirmPassword ? 'has-success' : ''}`}>
              <label><FiLock /> Confirm Password</label>
              <div className="input-wrapper password-field">
                <input 
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword" 
                  placeholder="Confirm your password" 
                  value={form.confirmPassword} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                <button
                  type="button"
                  className="pass-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              <FormError error={errors.confirmPassword} show={touched.confirmPassword} />
              {touched.confirmPassword && !errors.confirmPassword && form.confirmPassword && (
                <div className="form-success">
                  <FiCheckCircle /> Passwords match
                </div>
              )}
            </div>

            <button 
              type="submit" 
              className={`btn btn-primary btn-lg btn-block ${!isFormValid() ? 'btn-disabled-look' : ''}`}
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