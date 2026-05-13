// src/components/Sidebar.jsx
import React from 'react';
import '../assets/css/sidebar.css';

const Sidebar = ({ isOpen }) => {
  const menuItems = [
    { name: 'Dashboard', icon: '⊞', active: true },
    { name: 'Users', icon: '👥', active: false },
    { name: 'Incidents', icon: '⚠', active: false },
    { name: 'Translations', icon: '🌍', active: false },
    { name: 'Dictionaries', icon: '📖', active: false },
  ];

  return (
    <aside className={`sidebar-container ${!isOpen ? 'sidebar-hidden' : ''}`}>
      <div className="sidebar-logo">
        <span>🐝</span>
        <span className="brand-name">dialectGo</span>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <a key={item.name} href={`#${item.name.toLowerCase()}`} className={`nav-link ${item.active ? 'active' : ''}`}>
            <span className="nav-icon">{item.icon}</span>
            {item.name}
          </a>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;