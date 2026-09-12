import React, { useState, useEffect } from 'react';
import {
  Activity, Globe, Users, CheckCircle
} from 'lucide-react';
import { apiFetch } from '../services/apiService';
import Analytics from './Analytics';

// ─── Quick-Stat Widget ─────────────────────────────────────────────────────
const QuickStat = ({ icon: Icon, label, value, color, bg }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ background: bg, color }}>
      <Icon size={20} />
    </div>
    <div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </div>
  </div>
);

// ─── Dashboard ─────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => {
    apiFetch('/api/admin/dashboard')
      .then(payload => setStats(payload.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  const quickStats = [
    {
      icon: Users,
      label: 'Total Users',
      value: loading ? '—' : (stats?.users?.total ?? 0).toLocaleString(),
      color: 'var(--info)',
      bg: 'var(--info-bg)',
    },
    {
      icon: Activity,
      label: 'Active Today',
      value: loading ? '—' : (stats?.users?.active ?? 0).toLocaleString(),
      color: 'var(--success)',
      bg: 'var(--success-bg)',
    },
    {
      icon: Globe,
      label: 'Wiki Submissions',
      value: loading ? '—' : (stats?.wiki?.total ?? 0).toLocaleString(),
      color: 'var(--warning)',
      bg: 'var(--warning-bg)',
    },
    {
      icon: CheckCircle,
      label: 'Pending Reviews',
      value: loading ? '—' : ((stats?.wiki?.pending ?? 0) + (stats?.translations?.pending ?? 0)).toLocaleString(),
      color: 'var(--danger)',
      bg: 'var(--danger-bg)',
    },
  ];

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Hero Banner */}
      <div className="dashboard-hero">
        <div className="hero-greeting">{greeting}, Administrator</div>
        <div className="hero-title">DialectGo Command Center</div>
        <div className="hero-subtitle">
          AI Operations &amp; Data Governance — Monitor translation pipelines, govern dialect data,
          and manage the DialectGo ecosystem from a single hub.
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        {quickStats.map(s => (
          <QuickStat key={s.label} {...s} />
        ))}
      </div>

      <div style={{ marginTop: 32 }}>
        <Analytics />
      </div>
    </div>
  );
};

export default Dashboard;