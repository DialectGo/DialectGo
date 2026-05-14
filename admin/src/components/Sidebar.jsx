// src/components/Sidebar.jsx
import React from 'react';
import '../assets/css/sidebar.css';

const Sidebar = ({ isOpen, activeTab, onTabChange }) => {
  const menuItems = [
    { name: 'Dashboard', icon: '⊞' },
    { name: 'Users', icon: '👥' },
    { name: 'Incidents', icon: '⚠' },
    { name: 'Translations', icon: '🌍' },
    { name: 'Dictionaries', icon: '📖' },
  ];

  return (
    <aside className={`sidebar-container ${!isOpen ? 'sidebar-hidden' : ''}`}>
      <div className="sidebar-logo">
        <span>🐝</span>
        <span className="brand-name">dialectGo</span>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
            <button 
                key={item.name} 
                onClick={() => onTabChange(item.name)} 
                className={`nav-link ${activeTab === item.name ? 'active' : ''}`}
                /* Inline styles removed to allow CSS class priority */
            >
                <span className="nav-icon">{item.icon}</span>
                {item.name}
            </button>
            ))}
      </nav>
    </aside>
  );
};

export default Sidebar;