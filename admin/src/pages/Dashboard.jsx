import { useState, useEffect } from 'react';
import { Activity, Globe, Users, CheckCircle, ArrowUpRight, BookOpen, RefreshCw } from 'lucide-react';
import { apiFetch } from '../services/apiService';
import Analytics from './Analytics';

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  useEffect(() => {
    let active = true;
    apiFetch('/api/admin/dashboard')
      .then(payload => { if (active) { setStats(payload.data); setUpdatedAt(new Date()); } })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const refreshStats = () => {
    setLoading(true);
    setError(false);
    apiFetch('/api/admin/dashboard')
      .then(payload => { setStats(payload.data); setUpdatedAt(new Date()); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };
  const available = !loading && !error;
  const display = value => available && Number.isFinite(value) ? value.toLocaleString() : '\u2014';
  const wikiPending = stats?.wiki?.pending;
  const translationPending = stats?.translations?.pending;
  const pending = Number.isFinite(wikiPending) && Number.isFinite(translationPending) ? wikiPending + translationPending : null;
  const metrics = [
    { icon: Users, label: 'Total users', value: stats?.users?.total, color: 'info' },
    { icon: Activity, label: 'Enabled accounts', value: stats?.users?.active, color: 'success' },
    { icon: Globe, label: 'Wiki submissions', value: stats?.wiki?.total, color: 'warning' },
    { icon: CheckCircle, label: 'Pending reviews', value: pending, color: 'danger' },
  ];
  const shortcuts = [
    { tab: 'Translations', icon: CheckCircle, title: 'Review translations', description: 'Check suggestions from your community.' },
    { tab: 'Wiki', icon: Globe, title: 'Moderate Wiki', description: 'Review and publish dialect submissions.' },
    { tab: 'Dictionary', icon: BookOpen, title: 'Manage dictionary', description: 'Keep dialect words and meanings up to date.' },
  ];
  return (
    <div className="dashboard-page">
      <section className="dashboard-hero" aria-labelledby="welcome-title">
        <div>
          <div className="hero-greeting">Community review</div>
          <h2 className="hero-title" id="welcome-title">Keep dialect knowledge moving</h2>
          <p className="hero-subtitle">Review community contributions and keep the dictionary useful for everyone.</p>
          <button className="btn btn-primary hero-action" onClick={() => onNavigate('Translations')}>Review translations <ArrowUpRight size={16} /></button>
        </div>
        <div className="hero-queue" aria-label={`${display(pending)} contributions awaiting review`}>
          <span className="hero-queue-label">Awaiting review</span>
          <strong className="hero-queue-value">{display(pending)}</strong>
          <span className="hero-queue-note">Wiki and translation submissions</span>
        </div>
      </section>
      <div className="overview-heading">
        <h2>Platform overview</h2>
        <div className="flex items-center gap-12">
          {updatedAt && !loading && !error && <span className="text-xs text-muted">Updated {updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
          <button className="btn btn-secondary" onClick={refreshStats} disabled={loading}><RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> {loading ? 'Refreshing...' : 'Refresh'}</button>
        </div>
      </div>
      {error && <div className="info-box danger" role="alert">Overview could not be loaded. Refresh to try again.</div>}
      <div className="stats-grid dashboard-stats" aria-busy={loading}>
        {metrics.map(({ icon: Icon, label, value, color }) => (
          <div className="stat-card" key={label}>
            <div className="stat-icon" style={{ background: `var(--${color}-bg)`, color: `var(--${color})` }}><Icon size={20} /></div>
            <div><div className="stat-label">{label}</div><div className="stat-value">{display(value)}</div></div>
          </div>
        ))}
      </div>
      <section aria-labelledby="quick-actions-title" className="quick-actions-section">
        <div className="overview-heading"><h2 id="quick-actions-title">Quick actions</h2><span>Review and maintain content</span></div>
        <div className="quick-actions-grid">
          {shortcuts.map(({ tab, icon: Icon, title, description }) => (
            <button key={tab} className="quick-action" onClick={() => onNavigate(tab)}><Icon size={22} /><span><strong>{title}</strong><span>{description}</span></span><ArrowUpRight size={18} /></button>
          ))}
        </div>
      </section>
      <Analytics />
    </div>
  );
}
