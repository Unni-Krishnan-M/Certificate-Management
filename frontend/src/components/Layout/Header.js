import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="app-brand">
          <h1>CertiVault Pro</h1>
          <span className="environment-badge">Academic Portal</span>
        </div>
      </div>
      
      <div className="header-right">
        <div className="notifications">
          <button className="notification-btn">
            <span className="notification-icon">🔔</span>
            <span className="notification-count">3</span>
          </button>
        </div>
        
        <div className="user-menu">
          <div className="user-info">
            <span className="user-name">{user?.fullName}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;