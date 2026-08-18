import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/apiService';
import CardSkeleton from '../components/CardSkeleton';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [targetUser, setTargetUser] = useState(null);
  const [newRole, setNewRole] = useState('user');

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
        body: JSON.stringify({ role: newRole }),
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
        body: JSON.stringify({ is_disabled: !user.is_disabled }),
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to toggle user:', err);
    }
  };

  const openRoleModal = (user) => {
    setTargetUser(user);
    setNewRole(user.role || 'user');
    setModalAction('role');
    setShowModal(true);
  };

  const filtered = users.filter(u => {
    const matchesSearch = !searchQuery ||
      (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.first_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.last_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => !u.is_disabled).length,
    disabled: users.filter(u => u.is_disabled).length,
    admins: users.filter(u => u.role === 'admin').length,
  };

  const roleBadge = (role) => {
    const cls = role === 'admin' ? 'badge-admin' : role === 'user' ? 'badge-user' : 'badge-guest';
    return <span className={`badge ${cls}`}>{role || 'user'}</span>;
  };

  if (loading) {
    return (
      <div>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="empty-state loading-pulse">
          <div className="empty-icon">👥</div>
          <div className="empty-text">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>👥</div>
          <div><div className="stat-label">Total Users</div><div className="stat-value">{stats.total}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>✅</div>
          <div><div className="stat-label">Active</div><div className="stat-value">{stats.active}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>🚫</div>
          <div><div className="stat-label">Disabled</div><div className="stat-value">{stats.disabled}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--accent-glow)', color: 'var(--accent)' }}>🛡️</div>
          <div><div className="stat-label">Admins</div><div className="stat-value">{stats.admins}</div></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrapper" style={{ flex: 1 }}>
          <span className="search-icon">🔍</span>
          <input
            className="input"
            style={{ paddingLeft: 40 }}
            placeholder="Search users by name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="ALL">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="guest">Guest</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0 }}>
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'var(--gradient-accent)', color: '#0f1117',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '0.7rem', flexShrink: 0,
                        }}>
                          {(user.first_name?.charAt(0) || '') + (user.last_name?.charAt(0) || '')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                            {user.first_name || ''} {user.last_name || ''}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{user.username || 'unknown'}</div>
                        </div>
                      </div>
                    </td>
                    <td>{user.email || '—'}</td>
                    <td>{roleBadge(user.role)}</td>
                    <td>
                      <span className={`badge ${user.is_disabled ? 'badge-rejected' : 'badge-verified'}`}>
                        {user.is_disabled ? 'Disabled' : 'Active'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem' }}>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openRoleModal(user)}>
                          Role
                        </button>
                        <button
                          className={`btn btn-sm ${user.is_disabled ? 'btn-success' : 'btn-danger'}`}
                          onClick={() => handleToggleDisabled(user)}
                        >
                          {user.is_disabled ? 'Enable' : 'Disable'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Modal */}
      {showModal && modalAction === 'role' && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Change User Role</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: '0.88rem' }}>
              Changing role for <strong style={{ color: 'var(--text-primary)' }}>{targetUser?.first_name} {targetUser?.last_name}</strong>
            </p>
            <div className="form-group">
              <label className="form-label">New Role</label>
              <select className="select" style={{ width: '100%' }} value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="guest">Guest</option>
              </select>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRoleChange}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;