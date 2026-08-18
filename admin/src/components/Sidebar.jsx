import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';

const MENU = [
  { name: 'Dashboard',    icon: '⊞' },
  { name: 'Users',        icon: '👥' },
  { name: 'Dictionary',   icon: '📖' },
  { name: 'Translations', icon: '🌍' },
  { name: 'Wiki',         icon: '📝' },
  { name: 'Notifications',icon: '🔔' },
];

const Sidebar = ({ isOpen, activeTab, onTabChange, onLogout }) => {
  const [admin, setAdmin] = useState({ name: 'Admin', initials: 'AD', loading: true });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = authService.getToken();
        if (!token) { setAdmin(prev => ({ ...prev, loading: false })); return; }

        const res = await fetch('/api/v1/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) { setAdmin(prev => ({ ...prev, loading: false })); return; }
        const result = await res.json();

        if (result.success) {
          const first = result.data.first_name || 'Admin';
          const last = result.data.last_name || '';
          setAdmin({
            name: `${first} ${last}`.trim(),
            initials: `${first.charAt(0)}${last.charAt(0) || 'A'}`.toUpperCase(),
            loading: false,
          });
        } else {
          setAdmin(prev => ({ ...prev, loading: false }));
        }
      } catch {
        setAdmin(prev => ({ ...prev, loading: false }));
      }
    };
    fetchProfile();
  }, []);

  return (
    <aside className={`sidebar ${!isOpen ? 'hidden' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="brand-icon">DG</div>
        <div>
          <div className="brand-text">DialectGo</div>
          <div className="brand-sub">Admin Panel</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {MENU.map(item => (
          <button
            key={item.name}
            className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
            onClick={() => onTabChange(item.name)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {admin.loading ? (
          <div className="loading-pulse" style={{ width: '100%', height: 38, borderRadius: 8, background: 'var(--bg-glass)' }} />
        ) : (
          <>
            <div className="admin-avatar">{admin.initials}</div>
            <div>
              <div className="admin-name">{admin.name}</div>
              <div className="admin-role">
                <span className="dot" />
                System Administrator
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;