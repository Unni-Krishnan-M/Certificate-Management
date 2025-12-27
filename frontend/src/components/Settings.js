import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder for API call
    alert('Settings functionality coming soon (API integration pending)');
  };

  return (
    <div className="settings-container">
      <div className="page-header">
        <h2>Account Settings</h2>
        <p>Manage your profile and account preferences</p>
      </div>

      <div className="settings-content-grid">
        <div className="settings-card profile-card">
          <div className="card-header">
            <h3>Profile Information</h3>
          </div>
          <div className="card-body">
            <div className="profile-avatar">
              <div className="avatar-circle">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="profile-details">
                <h4>{user?.fullName}</h4>
                <span className="role-badge">{user?.role}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="settings-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-input"
                  disabled
                />
                <small>Contact admin to change name</small>
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  disabled
                />
              </div>
            </form>
          </div>
        </div>

        <div className="settings-card security-card">
          <div className="card-header">
            <h3>Security</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} className="settings-form">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter current password"
                />
              </div>

              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter new password"
                />
              </div>

              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="settings-card preferences-card">
            <div className="card-header">
                <h3>App Preferences</h3>
            </div>
            <div className="card-body">
                <div className="preference-item">
                    <label className="toggle-label">
                        <span>Email Notifications</span>
                        <input type="checkbox" defaultChecked />
                    </label>
                </div>
                <div className="preference-item">
                    <label className="toggle-label">
                        <span>Dark Mode</span>
                        <input type="checkbox" />
                    </label>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
