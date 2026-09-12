import React, { useState, useEffect } from 'react';
import { Search, Users, UserCheck, UserX, ShieldCheck, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiFetch } from '../services/apiService';
import CardSkeleton from '../components/fallbacks/CardSkeleton';
import TableSkeleton from '../components/fallbacks/TableSkeleton';

const UserManagement = () => {
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter]   = useState('ALL');
  const [page, setPage]               = useState(1);
  const PAGE_SIZE = 15;

  // Modal
  const [showModal, setShowModal]   = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [newRole, setNewRole]       = useState('user');

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const payload = await apiFetch('/api/admin/users');
      setUsers(payload.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async () => {
    try {
      await apiFetch(`/api/admin/users/${targetUser.id}/role`, {
        method: 'PUT',
        body:   JSON.stringify({ role: newRole }),
      });
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleToggleDisabled = async (user) => {
    try {
      await apiFetch(`/api/admin/users/${user.id}/toggle`, {
        method: 'PUT',
        body:   JSON.stringify({ is_disabled: !user.is_disabled }),
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to toggle user:', err);
    }
  };

  const filtered = users.filter(u => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.email    || '').toLowerCase().includes(q) ||
      (u.first_name || '').toLowerCase().includes(q) ||
      (u.last_name  || '').toLowerCase().includes(q);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = {
    total:    users.length,
    active:   users.filter(u => !u.is_disabled).length,
    disabled: users.filter(u =>  u.is_disabled).length,
    admins:   users.filter(u =>  u.role === 'admin').length,
  };

  const roleBadge = (role) => {
    const map = { admin: 'badge-admin', user: 'badge-user', guest: 'badge-guest' };
    return <span className={`badge ${map[role] ?? 'badge-guest'}`}>{role || 'user'}</span>;
  };

  const initials = (u) =>
    ((u.first_name?.charAt(0) || '') + (u.last_name?.charAt(0) || '')).toUpperCase() || '?';

  if (loading) {
    return (
      <div>
        <div className="stats-grid">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div style={{ marginTop: 24 }}>
          <TableSkeleton columns={6} rows={8} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: 24 }}>
        {[
          { icon: Users,      label: 'Total Users', value: stats.total,    color: 'var(--info)',    bg: 'var(--info-bg)' },
          { icon: UserCheck,  label: 'Active',       value: stats.active,   color: 'var(--success)', bg: 'var(--success-bg)' },
          { icon: UserX,      label: 'Disabled',     value: stats.disabled, color: 'var(--danger)',  bg: 'var(--danger-bg)' },
          { icon: ShieldCheck,label: 'Admins',        value: stats.admins,   color: 'var(--warning)', bg: 'var(--warning-bg)' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              <s.icon size={20} />
            </div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrapper" style={{ flex: 1 }}>
          <span className="search-icon"><Search size={15} /></span>
          <input
            className="input"
            placeholder="Search by name, username, or email…"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
          />
        </div>
        <select className="select" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="ALL">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="guest">Guest</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">
                    <div className="empty-icon"><Users size={22} /></div>
                    <div className="empty-text">No users found</div>
                    <div className="empty-subtext">Try adjusting your search or filter.</div>
                  </div>
                </td>
              </tr>
            ) : paginated.map(user => (
              <tr key={user.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'var(--gradient-accent)', color: '#421C00',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.7rem', flexShrink: 0,
                    }}>
                      {initials(user)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.86rem' }}>
                        {[user.first_name, user.last_name].filter(Boolean).join(' ') || '—'}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>@{user.username || 'unknown'}</div>
                    </div>
                  </div>
                </td>
                <td style={{ fontSize: '0.83rem' }}>{user.email || '—'}</td>
                <td>{roleBadge(user.role)}</td>
                <td>
                  <span className={`badge ${user.is_disabled ? 'badge-disabled' : 'badge-active'}`}>
                    {user.is_disabled ? 'Disabled' : 'Active'}
                  </span>
                </td>
                <td style={{ fontSize: '0.81rem', color: 'var(--text-muted)' }}>
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-xs" onClick={() => { setTargetUser(user); setNewRole(user.role || 'user'); setShowModal(true); }}>
                      Change Role
                    </button>
                    <button className={`btn btn-xs ${user.is_disabled ? 'btn-success' : 'btn-danger'}`}
                      onClick={() => handleToggleDisabled(user)}>
                      {user.is_disabled ? 'Enable' : 'Disable'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 2)
            .map((n, i, arr) => (
              <React.Fragment key={n}>
                {i > 0 && arr[i - 1] !== n - 1 && <span style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>}
                <button className={`page-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
              </React.Fragment>
            ))}
          <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Change User Role</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}><X size={14} /></button>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.86rem' }}>
              Changing role for <strong style={{ color: 'var(--text-primary)' }}>{targetUser?.first_name} {targetUser?.last_name}</strong>
            </p>
            <div className="form-group">
              <label className="form-label">New Role</label>
              <select className="select" style={{ width: '100%' }} value={newRole} onChange={e => setNewRole(e.target.value)}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="guest">Guest</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRoleChange}>Confirm Change</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;