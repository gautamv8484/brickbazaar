import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormError from '../components/FormError';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import {
  validateName,
  validatePhone,
  validateCity,
  validatePincode,
  validatePassword,
  validateConfirmPassword,
  formatPhone
} from '../utils/validators';
import {
  FiUser, FiMail, FiPhone, FiMapPin, FiLock,
  FiSave, FiEdit, FiShield, FiPackage, FiShoppingCart,
  FiEye, FiEyeOff, FiCheckCircle
} from 'react-icons/fi';

const Profile = () => {
  const { user, isAuthenticated, updateUser } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    address: user?.address || '',
    pincode: user?.pincode || ''
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Validation
  const [profileErrors, setProfileErrors] = useState({});
  const [profileTouched, setProfileTouched] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordTouched, setPasswordTouched] = useState({});

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // ========== Profile Validation ==========
  const validateProfileField = (name, value) => {
    switch (name) {
      case 'name': return validateName(value);
      case 'phone': return validatePhone(value);
      case 'city': return validateCity(value, user?.role === 'seller');
      case 'pincode': return validatePincode(value);
      default: return '';
    }
  };

  const handleProfileChange = (e) => {
    let { name, value } = e.target;

    if (name === 'phone') {
      value = formatPhone(value);
    }

    setProfileForm(prev => ({ ...prev, [name]: value }));

    if (profileTouched[name]) {
      setProfileErrors(prev => ({ ...prev, [name]: validateProfileField(name, value) }));
    }
  };

  const handleProfileBlur = (e) => {
    const { name, value } = e.target;
    setProfileTouched(prev => ({ ...prev, [name]: true }));
    setProfileErrors(prev => ({ ...prev, [name]: validateProfileField(name, value) }));
  };

  // ========== Password Validation ==========
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));

    if (passwordTouched[name]) {
      if (name === 'newPassword') {
        setPasswordErrors(prev => ({ 
          ...prev, 
          newPassword: validatePassword(value),
          confirmPassword: passwordForm.confirmPassword 
            ? validateConfirmPassword(value, passwordForm.confirmPassword) 
            : ''
        }));
      } else if (name === 'confirmPassword') {
        setPasswordErrors(prev => ({ 
          ...prev, 
          confirmPassword: validateConfirmPassword(passwordForm.newPassword, value) 
        }));
      } else if (name === 'currentPassword') {
        setPasswordErrors(prev => ({ 
          ...prev, 
          currentPassword: value ? '' : 'Current password is required' 
        }));
      }
    }
  };

  const handlePasswordBlur = (e) => {
    const { name, value } = e.target;
    setPasswordTouched(prev => ({ ...prev, [name]: true }));

    if (name === 'currentPassword') {
      setPasswordErrors(prev => ({ ...prev, currentPassword: value ? '' : 'Current password is required' }));
    } else if (name === 'newPassword') {
      setPasswordErrors(prev => ({ ...prev, newPassword: validatePassword(value) }));
    } else if (name === 'confirmPassword') {
      setPasswordErrors(prev => ({ 
        ...prev, 
        confirmPassword: validateConfirmPassword(passwordForm.newPassword, value) 
      }));
    }
  };

  // ========== Save Profile ==========
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    const newErrors = {
      name: validateName(profileForm.name),
      phone: validatePhone(profileForm.phone),
      city: validateCity(profileForm.city, user?.role === 'seller'),
      pincode: validatePincode(profileForm.pincode)
    };

    setProfileErrors(newErrors);
    setProfileTouched({ name: true, phone: true, city: true, pincode: true });

    if (Object.values(newErrors).some(err => err !== '')) {
      toast.error('Please fix the errors');
      return;
    }

    setSaving(true);

    try {
      const response = await authAPI.updateProfile({
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        city: profileForm.city.trim(),
        address: profileForm.address.trim(),
        pincode: profileForm.pincode.trim()
      });

      updateUser(response.data.user);
      toast.success('Profile updated successfully! ✅');
      setEditing(false);
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.errors) {
        const backendErrors = {};
        errorData.errors.forEach(err => {
          if (err.field) backendErrors[err.field] = err.message;
        });
        setProfileErrors(prev => ({ ...prev, ...backendErrors }));
      }
      toast.error(errorData?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // ========== Change Password ==========
  const handleChangePassword = async (e) => {
    e.preventDefault();

    const newErrors = {
      currentPassword: passwordForm.currentPassword ? '' : 'Current password is required',
      newPassword: validatePassword(passwordForm.newPassword),
      confirmPassword: validateConfirmPassword(passwordForm.newPassword, passwordForm.confirmPassword)
    };

    // Check if same as current
    if (passwordForm.newPassword && passwordForm.newPassword === passwordForm.currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setPasswordErrors(newErrors);
    setPasswordTouched({ currentPassword: true, newPassword: true, confirmPassword: true });

    if (Object.values(newErrors).some(err => err !== '')) {
      toast.error('Please fix the errors');
      return;
    }

    setChangingPassword(true);

    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      toast.success('Password changed successfully! 🔐');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors({});
      setPasswordTouched({});
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCancelEdit = () => {
    setProfileForm({
      name: user?.name || '',
      phone: user?.phone || '',
      city: user?.city || '',
      address: user?.address || '',
      pincode: user?.pincode || ''
    });
    setProfileErrors({});
    setProfileTouched({});
    setEditing(false);
  };

  const hasProfileError = (field) => profileTouched[field] && profileErrors[field];
  const hasPasswordError = (field) => passwordTouched[field] && passwordErrors[field];

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Left - Profile Card */}
        <div className="profile-card">
          <div className={`profile-avatar ${user?.role}`}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h2 className="profile-name">{user?.name}</h2>
          <span className={`profile-role-badge ${user?.role}`}>
            {user?.role === 'seller' ? <FiPackage /> : <FiShoppingCart />}
            {user?.role}
          </span>
          <div className="profile-email"><FiMail /> {user?.email}</div>
          <div className="profile-phone"><FiPhone /> {user?.phone}</div>
          {user?.city && (
            <div className="profile-city"><FiMapPin /> {user?.city}</div>
          )}
          <div className="profile-meta">
            <div className="meta-item">
              <span className="meta-label">Member Since</span>
              <span className="meta-value">
                {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', {
                  month: 'long', year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Right - Edit Section */}
        <div className="profile-content">
          <div className="profile-tabs">
            <button
              className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FiUser /> Profile Details
            </button>
            <button
              className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              <FiLock /> Change Password
            </button>
          </div>

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="section-head">
                <h3><FiUser /> Personal Information</h3>
                {!editing && (
                  <button className="edit-btn" onClick={() => setEditing(true)}>
                    <FiEdit /> Edit
                  </button>
                )}
              </div>

              {editing ? (
                <form className="profile-form" onSubmit={handleSaveProfile} noValidate>
                  <div className={`pf-group ${hasProfileError('name') ? 'has-error' : ''}`}>
                    <label><FiUser /> Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      onBlur={handleProfileBlur}
                      maxLength={50}
                    />
                    <FormError error={profileErrors.name} show={profileTouched.name} />
                  </div>

                  <div className="pf-group">
                    <label><FiMail /> Email</label>
                    <input type="email" value={user?.email} disabled className="disabled-input" />
                    <small>Email cannot be changed</small>
                  </div>

                  <div className={`pf-group ${hasProfileError('phone') ? 'has-error' : ''}`}>
                    <label><FiPhone /> Phone Number</label>
                    <div className="input-wrapper phone-input">
                      <span className="phone-prefix">+91</span>
                      <input
                        type="tel"
                        name="phone"
                        value={profileForm.phone}
                        onChange={handleProfileChange}
                        onBlur={handleProfileBlur}
                        maxLength={10}
                      />
                    </div>
                    <FormError error={profileErrors.phone} show={profileTouched.phone} />
                  </div>

                  <div className="pf-row">
                    <div className={`pf-group ${hasProfileError('city') ? 'has-error' : ''}`}>
                      <label><FiMapPin /> City</label>
                      <input
                        type="text"
                        name="city"
                        value={profileForm.city}
                        onChange={handleProfileChange}
                        onBlur={handleProfileBlur}
                        placeholder="Enter your city"
                        maxLength={50}
                      />
                      <FormError error={profileErrors.city} show={profileTouched.city} />
                    </div>
                    <div className={`pf-group ${hasProfileError('pincode') ? 'has-error' : ''}`}>
                      <label>Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        value={profileForm.pincode}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                          setProfileForm(prev => ({ ...prev, pincode: val }));
                          if (profileTouched.pincode) {
                            setProfileErrors(prev => ({ ...prev, pincode: validatePincode(val) }));
                          }
                        }}
                        onBlur={handleProfileBlur}
                        placeholder="e.g. 380001"
                        maxLength={6}
                      />
                      <FormError error={profileErrors.pincode} show={profileTouched.pincode} />
                    </div>
                  </div>

                  <div className="pf-group">
                    <label><FiMapPin /> Address</label>
                    <input
                      type="text"
                      name="address"
                      value={profileForm.address}
                      onChange={handleProfileChange}
                      placeholder="Enter your full address"
                      maxLength={200}
                    />
                  </div>

                  <div className="pf-actions">
                    <button type="button" className="btn btn-outline" onClick={handleCancelEdit}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-details">
                  <div className="detail-item">
                    <span className="detail-label"><FiUser /> Name</span>
                    <span className="detail-value">{user?.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label"><FiMail /> Email</span>
                    <span className="detail-value">{user?.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label"><FiPhone /> Phone</span>
                    <span className="detail-value">{user?.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label"><FiShield /> Role</span>
                    <span className="detail-value capitalize">{user?.role}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label"><FiMapPin /> City</span>
                    <span className="detail-value">{user?.city || 'Not set'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label"><FiMapPin /> Address</span>
                    <span className="detail-value">{user?.address || 'Not set'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Pincode</span>
                    <span className="detail-value">{user?.pincode || 'Not set'}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <div className="profile-section">
              <div className="section-head">
                <h3><FiLock /> Change Password</h3>
              </div>

              <form className="profile-form" onSubmit={handleChangePassword} noValidate>
                <div className={`pf-group ${hasPasswordError('currentPassword') ? 'has-error' : ''}`}>
                  <label><FiLock /> Current Password</label>
                  <div className="password-input">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      onBlur={handlePasswordBlur}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      className="pass-toggle"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                    >
                      {showCurrentPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <FormError error={passwordErrors.currentPassword} show={passwordTouched.currentPassword} />
                </div>

                <div className={`pf-group ${hasPasswordError('newPassword') ? 'has-error' : ''}`}>
                  <label><FiLock /> New Password</label>
                  <div className="password-input">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      onBlur={handlePasswordBlur}
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="pass-toggle"
                      onClick={() => setShowNewPass(!showNewPass)}
                    >
                      {showNewPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <PasswordStrengthMeter password={passwordForm.newPassword} />
                </div>

                <div className={`pf-group ${hasPasswordError('confirmPassword') ? 'has-error' : ''}`}>
                  <label><FiLock /> Confirm New Password</label>
                  <div className="password-input">
                    <input
                      type={showConfirmPass ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={handlePasswordChange}
                      onBlur={handlePasswordBlur}
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      className="pass-toggle"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                    >
                      {showConfirmPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <FormError error={passwordErrors.confirmPassword} show={passwordTouched.confirmPassword} />
                  {passwordTouched.confirmPassword && !passwordErrors.confirmPassword && passwordForm.confirmPassword && (
                    <div className="form-success">
                      <FiCheckCircle /> Passwords match
                    </div>
                  )}
                </div>

                <div className="pf-actions">
                  <button type="submit" className="btn btn-primary" disabled={changingPassword}>
                    <FiShield /> {changingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;