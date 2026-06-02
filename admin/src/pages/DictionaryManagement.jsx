// src/pages/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../assets/css/user-management.css';
import { authService } from '../services/authService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, active: 0, disabled: 0, admins: 0 });
  const [languageStats, setLanguageStats] = useState([]);
  const [streakChartData, setStreakChartData] = useState([0, 0, 0, 0, 0]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination Parameters
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Modal Workflow & Action States
  const [activeActionId, setActiveActionId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [operation, setOperation] = useState('UPDATE');
  const [targetUser, setTargetUser] = useState(null);
  const [rationale, setRationale] = useState('');

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userRole, setUserRole] = useState('user');

  useEffect(() => {
    hydrateDashboardData();
  }, []);

  const hydrateDashboardData = async () => {
    setLoading(true);
    try {
      const token = authService.getToken(); // ← correct JWT key

      if (!token) return;

      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Core Users Directory
      const usersRes = await fetch('/api/v1/users/admin/users', { headers });
      if (!usersRes.ok) {
        console.warn('Users fetch failed:', usersRes.status);
        return;
      }
      const usersPayload = await usersRes.json();
      const usersList = Array.isArray(usersPayload)
        ? usersPayload
        : (usersPayload.data || usersPayload.users || []);
      setUsers(usersList);

      // 2. Fetch Calculated Analytics Metrics
      const metricsRes = await fetch('/api/v1/users/admin/metrics', { headers });
      if (!metricsRes.ok) {
        console.warn('Metrics fetch failed:', metricsRes.status);
        return;
      }
      const metricsPayload = await metricsRes.json();
      const rootData = metricsPayload.data || metricsPayload;

      if (rootData) {
        const fetchedMetrics = rootData.metrics || {
          total: rootData.total ?? 0,
          active: rootData.active ?? 0,
          disabled: rootData.disabled ?? 0,
          admins: rootData.admins ?? 0,
        };

        const fetchedLanguages = rootData.languages || {};
        const fetchedStreaks = rootData.streaks || {};

        setMetrics(fetchedMetrics);

        const totalUsersCount = fetchedMetrics.total || 1;
        const processedLangs = Object.entries(fetchedLanguages)
          .map(([lang, count]) => ({
            name: lang === 'en' ? 'English' : lang === 'tgl' ? 'Tagalog' : lang === 'ceb' ? 'Cebuano' : lang,
            pct: `${Math.round(((count || 0) / totalUsersCount) * 100)}%`,
          }))
          .sort((a, b) => parseFloat(b.pct) - parseFloat(a.pct));

        setLanguageStats(processedLangs);

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
      const token = authService.getToken(); // ← correct JWT key

      const proposedData = operation === 'DISABLE'
        ? { is_disabled: !targetUser.is_disabled }
        : { first_name: firstName, last_name: lastName, role: userRole };

      const res = await fetch('/api/dataset/user/stage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          operationType: 'UPDATE',
          targetRowId: targetUser.id,
          proposedData,
          rationale,
        }),
      });

      if (!res.ok) {
        console.warn('Stage action failed:', res.status);
        return;
      }

      const payload = await res.json();
      alert(payload.message);
      setShowModal(false);
      hydrateDashboardData();
    } catch (err) {
      console.error('Staging action transmission failed:', err);
    }
  };

  // Live client filtering pipeline
  const filteredUsers = users.filter((u) => {
    const fullName = `${u.first_name || ''} ${u.last_name || ''} ${u.username || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter.toLowerCase();

    let matchesStatus = true;
    if (statusFilter === 'DISABLED') matchesStatus = u.is_disabled === true;
    if (statusFilter === 'ACTIVE') matchesStatus = !u.is_disabled;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredUsers.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  const chartData = {
    labels: ['1-5 Days', '6-10 Days', '11-20 Days', '21-30 Days', '30+ Days'],
    datasets: [{
      label: 'User Streaks Distribution',
      data: streakChartData,
      backgroundColor: '#FFD230',
      borderRadius: 6,
    }],
  };

  if (loading) return <div style={{ padding: '40px', color: '#64748b' }}>Loading user management...</div>;

  return (
    <div className="user-mgmt-container" style={{ padding: '24px' }}>

      {/* METRIC BANNER ROW */}
      <div className="stats-bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {[
          { label: 'Total Users', count: metrics.total, color: '#FFD230' },
          { label: 'Active Users', count: metrics.active, color: '#4ade80' },
          { label: 'Disabled', count: metrics.disabled, color: '#f87171' },
          { label: 'Platform Admins', count: metrics.admins, color: '#1a1a1a' },
        ].map((s, idx) => (
          <div key={idx} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
            <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>{s.label}</span>
            <h2 style={{ fontSize: '2rem', margin: '8px 0 0 0', fontWeight: 800, color: s.color }}>{s.count}</h2>
          </div>
        ))}
      </div>

      {/* SEARCH AND FILTER */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by name or username..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          style={{ flex: 1, minWidth: '260px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
        />
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600 }}>
          <option value="ALL">All Roles</option>
          <option value="USER">Standard Users</option>
          <option value="ADMIN">Administrators</option>
          <option value="GUEST">Guests</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontWeight: 600 }}>
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DISABLED">Disabled</option>
        </select>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="main-bento-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>

        {/* USERS TABLE */}
        <div className="bento-item user-table-card" style={{ gridColumn: 'span 8', backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px 0', fontWeight: 800 }}>System Users Directory</h3>
          <div className="table-wrapper" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.85rem' }}>
                  <th style={{ padding: '12px' }}>Name</th>
                  <th style={{ padding: '12px' }}>Username</th>
                  <th style={{ padding: '12px' }}>Role</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>No users found.</td>
                  </tr>
                ) : currentRows.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#0f172a' }}>{user.first_name} {user.last_name}</td>
                    <td style={{ padding: '12px', color: '#475569' }}>@{user.username || 'unsigned'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, background: user.role === 'admin' ? '#e0f2fe' : '#f1f5f9', color: user.role === 'admin' ? '#0369a1' : '#475569' }}>
                        {user.role?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ color: user.is_disabled ? '#ef4444' : '#22c55e', fontWeight: 700 }}>
                        ● {user.is_disabled ? 'Disabled' : 'Operational'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', position: 'relative' }}>
                      <button onClick={() => setActiveActionId(activeActionId === user.id ? null : user.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}>⚙️</button>
                      {activeActionId === user.id && (
                        <div style={{ position: 'absolute', right: 0, top: '40px', backgroundColor: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', borderRadius: '8px', border: '1px solid #e2e8f0', zIndex: 100, padding: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <button onClick={() => openStageModal('UPDATE', user)} style={{ background: 'none', border: 'none', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Edit</button>
                          <button onClick={() => openStageModal('DISABLE', user)} style={{ background: 'none', border: 'none', padding: '6px 12px', textAlign: 'left', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, color: '#dc2626' }}>
                            {user.is_disabled ? 'Enable' : 'Disable'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}>Prev</button>
              <span style={{ display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: '0.85rem' }}>Page {currentPage} of {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', background: '#fff' }}>Next</button>
            </div>
          )}
        </div>

        {/* SIDEBAR ANALYTICS */}
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <div className="bento-item secondary-card" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 12px 0', fontWeight: 800 }}>Linguistic Distribution</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {languageStats.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No language data available.</p>
              ) : languageStats.map((l, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                  <span>{l.name}</span>
                  <span style={{ color: '#64748b' }}>{l.pct}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bento-item secondary-card" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', height: '240px' }}>
            <h3 style={{ margin: '0 0 12px 0', fontWeight: 800 }}>Usage Streaks</h3>
            <div style={{ position: 'relative', height: '170px', width: '100%' }}>
              <Bar data={chartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>

      {/* STAGING MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '16px', width: '460px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '6px' }}>Stage User Action: {operation}</h3>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '20px' }}>Changes require verification from peer admins before committing.</p>

            {operation === 'UPDATE' ? (
              <>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>First Name</label>
                <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '14px' }} />

                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Last Name</label>
                <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '14px' }} />

                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Role</label>
                <select value={userRole} onChange={(e) => setUserRole(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px', background: '#fff' }}>
                  <option value="user">Standard User</option>
                  <option value="admin">Administrator</option>
                  <option value="guest">Guest</option>
                </select>
              </>
            ) : (
              <div style={{ backgroundColor: '#fff5f5', border: '1px solid #fee2e2', padding: '14px', borderRadius: '8px', marginBottom: '18px', color: '#991b1b', fontSize: '0.85rem' }}>
                <strong>Attention:</strong> You are proposing to change the status of <strong>{targetUser?.first_name} {targetUser?.last_name}</strong> to: {targetUser?.is_disabled ? 'ACTIVE' : 'DISABLED'}.
              </div>
            )}

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#f59e0b' }}>Justification Note</label>
            <input type="text" value={rationale} onChange={(e) => setRationale(e.target.value)} placeholder="Provide reason for this action..." required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '24px' }} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleActionStageSubmit} style={{ padding: '10px 20px', background: operation === 'DISABLE' ? '#dc2626' : '#1a1a1a', color: operation === 'DISABLE' ? '#fff' : '#FFD230', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
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