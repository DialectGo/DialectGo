import React, { useState, useEffect } from 'react';
import {
  Activity, Brain, Cpu, Database, Globe, Users, BookOpen,
  FileText, Bell, TrendingUp, Zap, Shield, ArrowRight,
  Clock, CheckCircle, AlertTriangle, BarChart2
} from 'lucide-react';
import { apiFetch } from '../services/apiService';

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

// ─── Dashboard Nav Card ────────────────────────────────────────────────────
const NavCard = ({ icon: Icon, iconBg, iconColor, title, desc, badge, onNavigate, tab }) => (
  <div className="dash-nav-card" onClick={() => onNavigate(tab)} role="button" tabIndex={0}
       onKeyDown={e => e.key === 'Enter' && onNavigate(tab)}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div className="dash-nav-icon" style={{ background: iconBg, color: iconColor }}>
        <Icon size={22} />
      </div>
      {badge && (
        <span className={`badge badge-${badge.type}`}>{badge.label}</span>
      )}
    </div>
    <div className="dash-nav-title">{title}</div>
    <div className="dash-nav-desc">{desc}</div>
    <div className="dash-nav-arrow">
      <span>Open</span>
      <ArrowRight size={14} />
    </div>
  </div>
);

// ─── Dashboard ─────────────────────────────────────────────────────────────
const Dashboard = ({ onNavigate }) => {
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

  const navigationSections = [
    {
      heading: 'AI Operations',
      cards: [
        {
          tab: 'Analytics',
          icon: BarChart2,
          iconBg: 'var(--danger-bg)',
          iconColor: 'var(--danger)',
          title: 'Hallucination Analytics',
          desc: 'Visualize negative-feedback translation pairs, detect NLLB drift, and compile fine-tuning datasets.',
          badge: { label: 'AI-Powered', type: 'flagged' },
        },
        {
          tab: 'Analytics',
          icon: TrendingUp,
          iconBg: 'var(--info-bg)',
          iconColor: 'var(--info)',
          title: 'Diagnostic Analysis',
          desc: 'Drill into engine latency, HuggingFace vs Groq routing decisions, and hallucination event rates.',
          badge: null,
        },
        {
          tab: 'Analytics',
          icon: Zap,
          iconBg: 'var(--warning-bg)',
          iconColor: 'var(--warning)',
          title: 'Predictive Forecasting',
          desc: 'Forecast API cost exhaustion timelines and predict which dialects are growing fastest.',
          badge: null,
        },
        {
          tab: 'Analytics',
          icon: Brain,
          iconBg: 'rgba(88, 28, 135, 0.08)',
          iconColor: '#7C3AED',
          title: 'Prescriptive Recommendations',
          desc: 'Automatically generated corpus expansion and canonicalization suggestions based on live usage.',
          badge: null,
        },
      ],
    },
    {
      heading: 'Content & Community',
      cards: [
        {
          tab: 'Users',
          icon: Users,
          iconBg: 'var(--info-bg)',
          iconColor: 'var(--info)',
          title: 'User Management',
          desc: 'Manage user accounts, roles, and access. Disable or re-enable accounts.',
          badge: null,
        },
        {
          tab: 'Wiki',
          icon: FileText,
          iconBg: 'var(--success-bg)',
          iconColor: 'var(--success)',
          title: 'Wiki Moderation',
          desc: 'Review and approve community dialect submissions. Track contributor leaderboards.',
          badge: stats?.wiki?.pending ? { label: `${stats.wiki.pending} Pending`, type: 'pending' } : null,
        },
        {
          tab: 'Translations',
          icon: Globe,
          iconBg: 'var(--warning-bg)',
          iconColor: 'var(--warning)',
          title: 'Translation Recommendations',
          desc: 'Approve or reject user-submitted translation improvements and corrections.',
          badge: stats?.translations?.pending ? { label: `${stats.translations.pending} Pending`, type: 'pending' } : null,
        },
        {
          tab: 'Dictionary',
          icon: BookOpen,
          iconBg: 'rgba(2, 132, 199, 0.08)',
          iconColor: '#0284C7',
          title: 'Dictionary Management',
          desc: 'Add, edit, and manage dialect dictionary entries, definitions, and audio files.',
          badge: null,
        },
      ],
    },
    {
      heading: 'System',
      cards: [
        {
          tab: 'Notifications',
          icon: Bell,
          iconBg: 'var(--danger-bg)',
          iconColor: 'var(--danger)',
          title: 'Notifications',
          desc: 'View system alerts, moderation notices, and administrative events.',
          badge: null,
        },
        {
          tab: 'Analytics',
          icon: Cpu,
          iconBg: 'rgba(15, 118, 110, 0.08)',
          iconColor: '#0F766E',
          title: 'NLP Data Governance',
          desc: 'Monitor cache hit/miss ratios, OOV frequencies, and corpus health metrics.',
          badge: null,
        },
        {
          tab: 'Analytics',
          icon: Shield,
          iconBg: 'var(--accent-glow)',
          iconColor: 'var(--accent-dark)',
          title: 'AI Engine Controls',
          desc: 'Monitor engine distribution and hallucination threshold telemetry.',
          badge: null,
        },
        {
          tab: 'Analytics',
          icon: Database,
          iconBg: 'rgba(30, 64, 175, 0.08)',
          iconColor: '#1D4ED8',
          title: 'Corpus Health',
          desc: 'Track dialect corpus growth, pending entries, and sentiment distribution.',
          badge: null,
        },
      ],
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

      {/* Navigation Sections */}
      {navigationSections.map(section => (
        <div key={section.heading} style={{ marginBottom: 32 }}>
          <div className="section-header">
            <div>
              <div className="section-title">{section.heading}</div>
            </div>
          </div>
          <div className="dash-nav-grid">
            {section.cards.map(card => (
              <NavCard key={card.title} {...card} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;