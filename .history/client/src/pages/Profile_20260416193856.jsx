import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiLock,
  FiSave,
  FiEdit,
  FiShield,
  FiPackage,
  FiShoppingCart,
  FiEye,
  FiEyeOff
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

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Handle profile form change
  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  // Handle password form change
  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  // Save profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!profileForm.name.trim()) {
      toast.error('Name is required!');
      return;
    }

    if (!profileForm.phone.trim()) {
      toast.error('Phone is required!');
      return;
    }

    setSaving(true);

    try {
      const response = await authAPI.updateProfile({
        name: profileForm.name,
        phone: profileForm.phone,
        city: profileForm.city,
        address: profileForm.address,
        pincode: profileForm.pincode
      });

      updateUser(response.data.user);
      toast.success('Profile updated successfully! ✅');
      setEditing(false);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passwordForm.currentPassword) {
      toast.error('Enter current password!');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters!');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }

    setChangingPassword(true);

    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });

      toast.success('Password changed successfully! 🔐');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setChangingPassword(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setProfileForm({
      name: user?.name || '',
      phone: user?.phone || '',
      city: user?.city || '',
      address: user?.address || '',
      pincode: user?.pincode || ''
    });
    setEditing(false);
  };

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
          <div className="profile-email">
            <FiMail /> {user?.email}
          </div>
          <div className="profile-phone">
            <FiPhone /> {user?.phone}
          </div>
          {user?.city && (
            <div className="profile-city">
              <FiMapPin /> {user?.city}
            </div>
          )}

          <div className="profile-meta">
            <div className="meta-item">
              <span className="meta-label">Member Since</span>
              <span className="meta-value">
                {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-IN', {
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Right - Edit Section */}
        <div className="profile-content">

          {/* Tabs */}
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
                <form className="profile-form" onSubmit={handleSaveProfile}>
                  <div className="pf-group">
                    <label><FiUser /> Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profileForm.name}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>

                  <div className="pf-group">
                    <label><FiMail /> Email</label>
                    <input
                      type="email"
                      value={user?.email}
                      disabled
                      className="disabled-input"
                    />
                    <small>Email cannot be changed</small>
                  </div>

                  <div className="pf-group">
                    <label><FiPhone /> Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileForm.phone}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>

                  <div className="pf-row">
                    <div className="pf-group">
                      <label><FiMapPin /> City</label>
                      <input
                        type="text"
                        name="city"
                        value={profileForm.city}
                        onChange={handleProfileChange}
                        placeholder="Enter your city"
                      />
                    </div>
                    <div className="pf-group">
                      <label>Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        value={profileForm.pincode}
                        onChange={handleProfileChange}
                        placeholder="e.g. 380001"
                        maxLength="6"
                      />
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

              <form className="profile-form" onSubmit={handleChangePassword}>
                <div className="pf-group">
                  <label><FiLock /> Current Password</label>
                  <div className="password-input">
                    <input
                      type={showCurrentPass ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      className="pass-toggle"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                    >
                      {showCurrentPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="pf-group">
                  <label><FiLock /> New Password</label>
                  <div className="password-input">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="Enter new password (min 6 chars)"
                      required
                      minLength="6"
                    />
                    <button
                      type="button"
                      className="pass-toggle"
                      onClick={() => setShowNewPass(!showNewPass)}
                    >
                      {showNewPass ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="pf-group">
                  <label><FiLock /> Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                    required
                  />
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