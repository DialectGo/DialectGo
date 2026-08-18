import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/apiService';
import CardSkeleton from '../components/fallbacks/CardSkeleton';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const payload = await apiFetch('/api/admin/dashboard');
        setStats(payload.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div>
        <div className="stats-grid">
          {Array.from({ length: 11 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-icon">⚠️</div>
        <div className="empty-text" style={{ color: 'var(--danger)' }}>{error}</div>
      </div>
    );
  }

  const cards = [
    { label: 'Total Users',            value: stats?.users?.total ?? 0,            icon: '👥', color: 'var(--info)',    bg: 'var(--info-bg)' },
    { label: 'Active Users',           value: stats?.users?.active ?? 0,           icon: '✅', color: 'var(--success)', bg: 'var(--success-bg)' },
    { label: 'Admin Accounts',         value: stats?.users?.admins ?? 0,           icon: '🛡️', color: 'var(--accent)',  bg: 'var(--accent-glow)' },
    { label: 'Dictionary Entries',     value: stats?.dictionary?.total ?? 0,       icon: '📖', color: 'var(--info)',    bg: 'var(--info-bg)' },
    { label: 'Corpus Entries',         value: stats?.corpus?.total ?? 0,           icon: '🗃️', color: 'var(--warning)', bg: 'var(--warning-bg)' },
    { label: 'Wiki Submissions',       value: stats?.wiki?.total ?? 0,             icon: '📝', color: 'var(--info)',    bg: 'var(--info-bg)' },
    { label: 'Pending Submissions',    value: stats?.wiki?.pending ?? 0,           icon: '⏳', color: 'var(--warning)', bg: 'var(--warning-bg)' },
    { label: 'Verified Submissions',   value: stats?.wiki?.verified ?? 0,          icon: '✓',  color: 'var(--success)', bg: 'var(--success-bg)' },
    { label: 'Translation Suggestions',value: stats?.translations?.total ?? 0,     icon: '🌍', color: 'var(--info)',    bg: 'var(--info-bg)' },
    { label: 'Pending Translations',   value: stats?.translations?.pending ?? 0,   icon: '⏳', color: 'var(--warning)', bg: 'var(--warning-bg)' },
    { label: 'Approved Translations',  value: stats?.translations?.approved ?? 0,  icon: '✅', color: 'var(--success)', bg: 'var(--success-bg)' },
  ];

  return (
    <div>
      <div className="stats-grid">
        {cards.map(card => (
          <div key={card.label} className="stat-card">
            <div className="stat-icon" style={{ background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div>
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value.toLocaleString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;