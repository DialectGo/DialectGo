import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/apiService';
import CardSkeleton from '../components/fallbacks/CardSkeleton';
import TableSkeleton from '../components/fallbacks/TableSkeleton';

const TranslationManagement = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { fetchRecommendations(); }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const payload = await apiFetch('/api/admin/translations');
      setRecommendations(payload.data || []);
    } catch (err) {
      console.error('Failed to load translations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await apiFetch(`/api/admin/translations/${id}/approve`, { method: 'PUT' });
      fetchRecommendations();
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await apiFetch(`/api/admin/translations/${id}/reject`, { method: 'PUT' });
      fetchRecommendations();
    } catch (err) {
      console.error('Failed to reject:', err);
    }
  };

  const statusBadge = (status) => {
    const cls = status === 'approved' ? 'badge-approved' : status === 'rejected' ? 'badge-rejected' : 'badge-pending';
    return <span className={`badge ${cls}`}>{status || 'pending'}</span>;
  };

  const filtered = recommendations.filter(r => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSearch = !searchQuery ||
      (r.source_text || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.translated_text || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: recommendations.length,
    pending: recommendations.filter(r => r.status === 'pending').length,
    approved: recommendations.filter(r => r.status === 'approved').length,
    rejected: recommendations.filter(r => r.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div style={{ marginTop: 24 }}>
          <TableSkeleton columns={7} rows={5} />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>🌍</div>
          <div><div className="stat-label">Total</div><div className="stat-value">{stats.total}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>⏳</div>
          <div><div className="stat-label">Pending</div><div className="stat-value">{stats.pending}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>✅</div>
          <div><div className="stat-label">Approved</div><div className="stat-value">{stats.approved}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>❌</div>
          <div><div className="stat-label">Rejected</div><div className="stat-value">{stats.rejected}</div></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrapper" style={{ flex: 1 }}>
          <span className="search-icon">🔍</span>
          <input
            className="input"
            style={{ paddingLeft: 40 }}
            placeholder="Search source or translated text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Source Text</th>
                <th>Suggested Translation</th>
                <th>Source Lang</th>
                <th>Target Lang</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No translation suggestions found.
                  </td>
                </tr>
              ) : (
                filtered.map(rec => (
                  <tr key={rec.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rec.source_text || '—'}</td>
                    <td>{rec.translated_text || rec.suggested_translation || '—'}</td>
                    <td><span className="badge badge-admin">{rec.source_language || '—'}</span></td>
                    <td><span className="badge badge-user">{rec.target_language || '—'}</span></td>
                    <td>{statusBadge(rec.status)}</td>
                    <td style={{ fontSize: '0.82rem' }}>
                      {rec.created_at ? new Date(rec.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td>
                      {rec.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-success btn-sm" onClick={() => handleApprove(rec.id)}>Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleReject(rec.id)}>Reject</button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TranslationManagement;