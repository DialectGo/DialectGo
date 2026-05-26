// src/components/Sidebar.jsx
import React, { useEffect, useState } from 'react';
import '../assets/css/sidebar.css';

const Sidebar = ({ isOpen, activeTab, onTabChange }) => {
  const [adminData, setAdminData] = useState({
    firstName: 'Admin',
    lastName: 'User',
    initials: 'AD',
    loading: true
  });

  const PROFILE_API = '/api/v1/users/profile';

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem('sb-access-token');
        if (!token) {
          setAdminData(prev => ({ ...prev, loading: false }));
          return;
        }

        const response = await fetch(PROFILE_API, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();
        
        if (result.success) {
          const user = result.data;
          const first = user.first_name || 'Admin';
          const last = user.last_name || 'User';
          const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();

          setAdminData({
            firstName: first,
            lastName: last,
            initials: initials,
            loading: false
          });
        }
      } catch (error) {
        console.error("Sidebar Admin Profile Fetch Error:", error);
        setAdminData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchAdminProfile();
  }, []);

  const menuItems = [
    { name: 'Dashboard', icon: '⊞' },
    { name: 'Users', icon: '👥' },
    { name: 'Incidents', icon: '⚠' },
    { name: 'Translations', icon: '🌍' },
    { name: 'Dictionaries', icon: '📖' },
  ];

  return (
    <aside 
      className={`sidebar-container ${!isOpen ? 'sidebar-hidden' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh',
        backgroundColor: '#fff',
        borderRight: '1px solid #e2e8f0',
        width: isOpen ? '260px' : '0px',
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}
    >
      {/* TOP: LOGO AND NAVIGATION LINKS */}
      <div>
        <div className="sidebar-logo" style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>🚀</span>
          <span className="brand-name" style={{ fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>DialectGo</span>
        </div>

        <nav className="sidebar-nav" style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {menuItems.map((item) => (
            <button 
              key={item.name} 
              onClick={() => onTabChange(item.name)} 
              className={`nav-link ${activeTab === item.name ? 'active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                border: 'none',
                background: activeTab === item.name ? '#FFD230' : 'none',
                color: activeTab === item.name ? '#1a1a1a' : '#475569',
                fontWeight: activeTab === item.name ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                fontSize: '0.9rem',
                transition: 'all 0.15s ease'
              }}
            >
              <span className="nav-icon" style={{ fontSize: '1.1rem', minWidth: '20px' }}>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      {/* BOTTOM: ADMIN USER COMPLIANCE FOOTER CARD */}
      <div 
        className="sidebar-footer-profile" 
        style={{ 
          padding: '16px 20px', 
          borderTop: '1px solid #f1f5f9', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          backgroundColor: '#f8fafc',
          marginBpottom: '30px',
        }}
      >
        {adminData.loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', backgroundColor: '#e2e8f0' }} />
            <div style={{ height: '12px', width: '80px', backgroundColor: '#e2e8f0', borderRadius: '4px' }} />
          </div>
        ) : (
          <>
            <div 
              className="admin-avatar-chip" 
              style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '50%', 
                backgroundColor: '#1a1a1a', 
                color: '#FFD230', 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                fontWeight: 800, 
                fontSize: '0.9rem',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
              }}
            >
              {adminData.initials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              <span 
                style={{ 
                  fontWeight: 700, 
                  fontSize: '0.85rem', 
                  color: '#0f172a', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis'
                }}
              >
                {`${adminData.firstName} ${adminData.lastName}`.trim()}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span style={{ width: '6px', height: '6px', backgroundColor: '#22c55e', borderRadius: '50%' }}></span>
                System Administrator
              </span>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar; 