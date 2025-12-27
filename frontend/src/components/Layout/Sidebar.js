import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ activeSection, onSectionChange }) => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'certificates', label: 'My Certificates', icon: '📜' },
    { id: 'upload', label: 'Upload Certificate', icon: '📤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const staffMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'certificates', label: 'All Certificates', icon: '📜' },
    { id: 'verification', label: 'Verification Queue', icon: '✅' },
    { id: 'reports', label: 'Reports & Analytics', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const menuItems = user?.role === 'STUDENT' ? studentMenuItems : staffMenuItems;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button 
          className="collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onSectionChange(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span className="nav-label">{item.label}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;