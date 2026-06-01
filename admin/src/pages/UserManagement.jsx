// src/pages/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { authService } from '../services/authService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ─── SVG Icon Components ──────────────────────────────────────────────────────
const Icon = {
  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  UserCheck: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
      <polyline points="17 11 19 13 23 9"/>
    </svg>
  ),
  UserX: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
      <line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/>
    </svg>
  ),
  Shield: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Search: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  Edit: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Toggle: ({ on }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {on
        ? <><rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="16" cy="12" r="3" fill="currentColor"/></>
        : <><rect x="1" y="5" width="22" height="14" rx="7"/><circle cx="8" cy="12" r="3" fill="currentColor"/></>
      }
    </svg>
  ),
  Globe: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  ),
  Flame: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  ),
  X: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
};

// ─── Smart Pagination Helper ──────────────────────────────────────────────────
const getPageNumbers = (currentPage, totalPages) => {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  const pages = [];
  const add = (p) => { if (!pages.includes(p)) pages.push(p); };
  add(1);
  if (currentPage - 2 > 2) pages.push('...');
  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) add(i);
  if (currentPage + 2 < totalPages - 1) pages.push('...');
  add(totalPages);
  return pages;
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, count, color, icon: IconComp, accent }) => (
  <div style={{
    backgroundColor: '#fff',
    padding: '20px 24px',
    borderRadius: '16px',
    border: '1px solid #e8edf3',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    transition: 'box-shadow 0.2s',
  }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'}
  >
    <div style={{
      width: '48px', height: '48px', borderRadius: '12px',
      backgroundColor: accent,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color,
      flexShrink: 0,
    }}>
      <IconComp />
    </div>
    <div>
      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>{count}</div>
    </div>
  </div>
);

// ─── Role Badge ───────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const styles = {
    admin:  { bg: '#fef3c7', color: '#92400e', label: 'Admin' },
    user:   { bg: '#f0fdf4', color: '#166534', label: 'User' },
    guest:  { bg: '#f1f5f9', color: '#475569', label: 'Guest' },
  };
  const s = styles[role] || styles.guest;
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '20px', fontSize: '0.72rem',
      fontWeight: 700, backgroundColor: s.bg, color: s.color,
      letterSpacing: '0.04em', textTransform: 'uppercase',
    }}>
      {s.label}
    </span>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, active: 0, disabled: 0, admins: 0 });
  const [languageStats, setLanguageStats] = useState([]);
  const [streakChartData, setStreakChartData] = useState([0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // ← Pagination unchanged
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [activeActionId, setActiveActionId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [operation, setOperation] = useState('UPDATE');
  const [targetUser, setTargetUser] = useState(null);
  const [rationale, setRationale] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userRole, setUserRole] = useState('user');

  useEffect(() => { hydrateDashboardData(); }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = () => setActiveActionId(null);
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const hydrateDashboardData = async () => {
    setLoading(true);
    try {
      const token = authService.getToken();
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };

      const usersRes = await fetch('/api/v1/users/admin/users', { headers });
      if (!usersRes.ok) { console.warn('Users fetch failed:', usersRes.status); return; }
      const usersPayload = await usersRes.json();
      const usersList = Array.isArray(usersPayload) ? usersPayload : (usersPayload.data || usersPayload.users || []);
      setUsers(usersList);

      const metricsRes = await fetch('/api/v1/users/admin/metrics', { headers });
      if (!metricsRes.ok) { console.warn('Metrics fetch failed:', metricsRes.status); return; }
      const metricsPayload = await metricsRes.json();
      const rootData = metricsPayload.data || metricsPayload;

      if (rootData) {
        const fetchedMetrics = rootData.metrics || { total: rootData.total ?? 0, active: rootData.active ?? 0, disabled: rootData.disabled ?? 0, admins: rootData.admins ?? 0 };
        const fetchedLanguages = rootData.languages || {};
        const fetchedStreaks = rootData.streaks || {};
        setMetrics(fetchedMetrics);

        const totalUsersCount = fetchedMetrics.total || 1;
        setLanguageStats(
          Object.entries(fetchedLanguages)
            .map(([lang, count]) => ({
              name: lang === 'en' ? 'English' : lang === 'tgl' ? 'Tagalog' : lang === 'ceb' ? 'Cebuano' : lang,
              pct: Math.round(((count || 0) / totalUsersCount) * 100),
            }))
            .sort((a, b) => b.pct - a.pct)
        );

        setStreakChartData([
          fetchedStreaks['1-5 Days'] || fetchedStreaks['1_5_days'] || 0,
          fetchedStreaks['6-10 Days'] || fetchedStreaks['6_10_days'] || 0,
          fetchedStreaks['11-20 Days'] || fetchedStreaks['11_20_days'] || 0,
          fetchedStreaks['21-30 Days'] || fetchedStreaks['21_30_days'] || 0,
          fetchedStreaks['30+ Days'] || fetchedStreaks['30_plus_days'] || 0,
        ]);
      }
    } catch (err) {
      console.error('Critical error syncing management workspace:', err);
    } finally {
      setLoading(false);
    }
  };

  const openStageModal = (type, user) => {
    setOperation(type);
    setTargetUser(user);
    setRationale('');
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setUserRole(user.role || 'user');
    }
    setShowModal(true);
    setActiveActionId(null);
  };

  const handleActionStageSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = authService.getToken();
      const proposedData = operation === 'DISABLE'
        ? { is_disabled: !targetUser.is_disabled }
        : { first_name: firstName, last_name: lastName, role: userRole };

      const res = await fetch('/api/dataset/user/stage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ operationType: 'UPDATE', targetRowId: targetUser.id, proposedData, rationale }),
      });
      if (!res.ok) { console.warn('Stage action failed:', res.status); return; }
      const payload = await res.json();
      alert(payload.message);
      setShowModal(false);
      hydrateDashboardData();
    } catch (err) {
      console.error('Staging action transmission failed:', err);
    }
  };

  // ─── Filtering ───────────────────────────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.first_name || ''} ${u.last_name || ''} ${u.username || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter.toLowerCase();
    let matchesStatus = true;
    if (statusFilter === 'DISABLED') matchesStatus = u.is_disabled === true;
    if (statusFilter === 'ACTIVE') matchesStatus = !u.is_disabled;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // ─── Pagination (unchanged logic) ────────────────────────────────────────────
  const indexOfLastRow  = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows     = filteredUsers.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages      = Math.ceil(filteredUsers.length / rowsPerPage);

  const chartData = {
    labels: ['1–5d', '6–10d', '11–20d', '21–30d', '30+d'],
    datasets: [{
      label: 'Users',
      data: streakChartData,
      backgroundColor: '#FFD230',
      hoverBackgroundColor: '#f5c800',
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10, weight: '600' }, color: '#94a3b8' } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 }, color: '#94a3b8' } },
    },
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '12px' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid #f1f5f9', borderTop: '3px solid #1a1a1a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ color: '#94a3b8', fontSize: '0.875rem', fontWeight: 500 }}>Loading user directory...</span>
    </div>
  );

  return (
    <div style={{ padding: '28px', fontFamily: "'DM Sans', system-ui, sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .um-row-hover:hover { background-color: #f8fafc !important; }
        .um-action-btn:hover { background-color: #f1f5f9 !important; }
        .um-filter-select { appearance: none; -webkit-appearance: none; background-image: none; }
        .um-page-btn:hover:not(:disabled) { background-color: #f1f5f9 !important; }
      `}</style>

      {/* PAGE HEADER */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <div style={{ width: '4px', height: '28px', backgroundColor: '#FFD230', borderRadius: '4px' }} />
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>User Management</h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 0 14px', fontWeight: 500 }}>
          {metrics.total} registered users · dual-control staging pipeline
        </p>
      </div>

      {/* STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Total Users"     count={metrics.total}    color="#92400e" accent="#fef3c7" icon={Icon.Users} />
        <StatCard label="Active Users"    count={metrics.active}   color="#166534" accent="#f0fdf4" icon={Icon.UserCheck} />
        <StatCard label="Disabled"        count={metrics.disabled} color="#991b1b" accent="#fef2f2" icon={Icon.UserX} />
        <StatCard label="Administrators"  count={metrics.admins}   color="#1e40af" accent="#eff6ff" icon={Icon.Shield} />
      </div>

      {/* SEARCH & FILTER BAR */}
      <div style={{
        display: 'flex', gap: '12px', marginBottom: '20px',
        background: '#fff', padding: '14px 16px',
        borderRadius: '14px', border: '1px solid #e8edf3',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)', flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}>
            <Icon.Search />
          </span>
          <input
            type="text"
            placeholder="Search name or username..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{
              width: '100%', padding: '9px 14px 9px 38px',
              borderRadius: '9px', border: '1px solid #e2e8f0',
              fontSize: '0.875rem', color: '#0f172a', outline: 'none',
              backgroundColor: '#f8fafc', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Role filter */}
        <div style={{ position: 'relative' }}>
          <select
            className="um-filter-select"
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '9px 36px 9px 14px', borderRadius: '9px',
              border: '1px solid #e2e8f0', background: '#f8fafc',
              fontSize: '0.875rem', fontWeight: 600, color: '#334155',
              outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="ALL">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="GUEST">Guest</option>
          </select>
          <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}><Icon.ChevronDown /></span>
        </div>

        {/* Status filter */}
        <div style={{ position: 'relative' }}>
          <select
            className="um-filter-select"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '9px 36px 9px 14px', borderRadius: '9px',
              border: '1px solid #e2e8f0', background: '#f8fafc',
              fontSize: '0.875rem', fontWeight: 600, color: '#334155',
              outline: 'none', cursor: 'pointer',
            }}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="DISABLED">Disabled</option>
          </select>
          <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}><Icon.ChevronDown /></span>
        </div>

        {/* Result count pill */}
        <div style={{
          marginLeft: 'auto', padding: '6px 14px', borderRadius: '20px',
          backgroundColor: '#f1f5f9', fontSize: '0.8rem', fontWeight: 700, color: '#475569',
        }}>
          {filteredUsers.length} result{filteredUsers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '20px' }}>

        {/* USERS TABLE — 8 cols */}
        <div style={{
          gridColumn: 'span 8', backgroundColor: '#fff',
          borderRadius: '16px', border: '1px solid #e8edf3',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>System Users Directory</h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
              {indexOfFirstRow + 1}–{Math.min(indexOfLastRow, filteredUsers.length)} of {filteredUsers.length}
            </span>
          </div>

          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc' }}>
                  {['User', 'Username', 'Role', 'Status', ''].map((h, i) => (
                    <th key={i} style={{
                      padding: '11px 16px', textAlign: i === 4 ? 'right' : 'left',
                      fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8',
                      textTransform: 'uppercase', letterSpacing: '0.07em',
                      borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRows.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
                      No users match your filters.
                    </td>
                  </tr>
                ) : currentRows.map((user) => (
                  <tr
                    key={user.id}
                    className="um-row-hover"
                    style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                  >
                    {/* User cell with avatar */}
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%',
                          backgroundColor: '#1a1a1a', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#FFD230', fontWeight: 800, fontSize: '0.8rem',
                        }}>
                          {((user.first_name || user.username || '?')[0]).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                            {user.first_name} {user.last_name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '13px 16px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>
                      @{user.username || 'unsigned'}
                    </td>

                    <td style={{ padding: '13px 16px' }}>
                      <RoleBadge role={user.role} />
                    </td>

                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                          width: '7px', height: '7px', borderRadius: '50%',
                          backgroundColor: user.is_disabled ? '#f87171' : '#4ade80',
                          flexShrink: 0,
                        }} />
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: user.is_disabled ? '#ef4444' : '#22c55e' }}>
                          {user.is_disabled ? 'Disabled' : 'Active'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '13px 16px', textAlign: 'right', position: 'relative' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button
                          className="um-action-btn"
                          onClick={(e) => { e.stopPropagation(); openStageModal('UPDATE', user); }}
                          title="Edit user"
                          style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '6px 10px', borderRadius: '7px',
                            border: '1px solid #e2e8f0', background: '#fff',
                            color: '#334155', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                            transition: 'background 0.15s',
                          }}
                        >
                          <Icon.Edit /> Edit
                        </button>
                        <button
                          className="um-action-btn"
                          onClick={(e) => { e.stopPropagation(); openStageModal('DISABLE', user); }}
                          title={user.is_disabled ? 'Enable user' : 'Disable user'}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '5px',
                            padding: '6px 10px', borderRadius: '7px',
                            border: `1px solid ${user.is_disabled ? '#bbf7d0' : '#fecaca'}`,
                            background: user.is_disabled ? '#f0fdf4' : '#fff5f5',
                            color: user.is_disabled ? '#16a34a' : '#dc2626',
                            cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600,
                            transition: 'background 0.15s',
                          }}
                        >
                          <Icon.Toggle on={!user.is_disabled} />
                          {user.is_disabled ? 'Enable' : 'Disable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION — same logic, better look */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 20px', borderTop: '1px solid #f1f5f9',
            }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
                Page {currentPage} of {totalPages}
              </span>
              <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button
                  className="um-page-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '32px', height: '32px', borderRadius: '8px',
                    border: '1px solid #e2e8f0', background: '#fff',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.4 : 1, transition: 'background 0.15s',
                  }}
                >
                  <Icon.ChevronLeft />
                </button>

                {getPageNumbers(currentPage, totalPages).map((num, i) => (
                  <button
                    key={i}
                    disabled={num === '...'}
                    onClick={() => num !== '...' && setCurrentPage(num)}
                    style={{
                      minWidth: '32px', height: '32px', borderRadius: '8px',
                      border: '1px solid #e2e8f0', padding: '0 8px',
                      fontSize: '0.82rem', fontWeight: 700,
                      backgroundColor: currentPage === num ? '#1a1a1a' : '#fff',
                      color: currentPage === num ? '#FFD230' : '#334155',
                      cursor: num === '...' ? 'default' : 'pointer',
                      transition: 'background 0.15s',
                    }}
                  >
                    {num}
                  </button>
                ))}

                <button
                  className="um-page-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '32px', height: '32px', borderRadius: '8px',
                    border: '1px solid #e2e8f0', background: '#fff',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.4 : 1, transition: 'background 0.15s',
                  }}
                >
                  <Icon.ChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SIDEBAR — 4 cols */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Language Distribution */}
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e8edf3', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ color: '#64748b' }}><Icon.Globe /></div>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>Language Split</h3>
            </div>

            {languageStats.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>No data available.</p>
            ) : languageStats.map((l, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}>{l.name}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>{l.pct}%</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', width: `${l.pct}%`, borderRadius: '99px',
                    backgroundColor: i === 0 ? '#FFD230' : i === 1 ? '#1a1a1a' : '#94a3b8',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Streak Chart */}
          <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e8edf3', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ color: '#64748b' }}><Icon.Flame /></div>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>Usage Streaks</h3>
            </div>
            <div style={{ height: '160px' }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* STAGING MODAL */}
      {showModal && (
        <div
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.55)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, backdropFilter: 'blur(2px)' }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '20px', width: '460px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: '#f1f5f9', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
            >
              <Icon.X />
            </button>

            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{
                width: '42px', height: '42px', borderRadius: '12px',
                backgroundColor: operation === 'DISABLE' ? '#fef2f2' : '#f0fdf4',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: operation === 'DISABLE' ? '#dc2626' : '#16a34a',
              }}>
                {operation === 'DISABLE' ? <Icon.AlertTriangle /> : <Icon.Edit />}
              </div>
              <div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>
                  {operation === 'DISABLE' ? (targetUser?.is_disabled ? 'Enable User' : 'Disable User') : 'Edit User'}
                </h3>
                <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '0.78rem' }}>Requires peer-admin verification before commit</p>
              </div>
            </div>

            {operation === 'UPDATE' ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#475569' }}>First Name</label>
                    <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#475569' }}>Last Name</label>
                    <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#475569' }}>Role</label>
                  <select value={userRole} onChange={(e) => setUserRole(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.875rem', outline: 'none' }}>
                    <option value="user">Standard User</option>
                    <option value="admin">Administrator</option>
                    <option value="guest">Guest</option>
                  </select>
                </div>
              </>
            ) : (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '14px 16px', borderRadius: '10px', marginBottom: '16px', color: '#991b1b', fontSize: '0.85rem' }}>
                <strong>{targetUser?.first_name} {targetUser?.last_name}</strong> will be set to{' '}
                <strong>{targetUser?.is_disabled ? 'ACTIVE' : 'DISABLED'}</strong>.
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px', color: '#f59e0b' }}>
                Justification <span style={{ color: '#94a3b8', fontWeight: 500 }}>(required for audit trail)</span>
              </label>
              <input type="text" value={rationale} onChange={(e) => setRationale(e.target.value)} placeholder="Reason for this action..." required
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setShowModal(false)}
                style={{ flex: 1, padding: '11px', background: '#f1f5f9', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, color: '#475569', fontSize: '0.875rem' }}>
                Cancel
              </button>
              <button onClick={handleActionStageSubmit}
                style={{
                  flex: 2, padding: '11px', border: 'none', borderRadius: '10px', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.875rem',
                  backgroundColor: operation === 'DISABLE' ? '#dc2626' : '#1a1a1a',
                  color: operation === 'DISABLE' ? '#fff' : '#FFD230',
                }}>
                Stage Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;