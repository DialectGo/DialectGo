import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/apiService';
import CardSkeleton from '../components/CardSkeleton';

const WikiManagement = () => {
  const [submissions, setSubmissions] = useState([]);
  const [corpus, setCorpus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('submissions');

  // Corpus pagination
  const [corpusPage, setCorpusPage] = useState(1);
  const [corpusTotal, setCorpusTotal] = useState(0);
  const corpusLimit = 20;

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { if (activeTab === 'corpus') fetchCorpus(); }, [corpusPage, activeTab]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [subsPayload] = await Promise.all([
        apiFetch('/api/admin/wiki'),
      ]);
      setSubmissions(subsPayload.data || []);
      if (activeTab === 'corpus') await fetchCorpus();
    } catch (err) {
      console.error('Failed to load wiki data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCorpus = async () => {
    try {
      const payload = await apiFetch(`/api/admin/corpus?page=${corpusPage}&limit=${corpusLimit}`);
      setCorpus(payload.data || []);
      setCorpusTotal(payload.count || 0);
    } catch (err) {
      console.error('Failed to load corpus:', err);
    }
  };

  const handleVerify = async (id) => {
    try {
      await apiFetch(`/api/admin/wiki/${id}/verify`, { method: 'PUT' });
      fetchAll();
    } catch (err) {
      console.error('Failed to verify:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await apiFetch(`/api/admin/wiki/${id}/reject`, { method: 'PUT' });
      fetchAll();
    } catch (err) {
      console.error('Failed to reject:', err);
    }
  };

  const handleDeleteCorpus = async (id) => {
    if (!confirm('Delete this corpus entry?')) return;
    try {
      await apiFetch(`/api/admin/corpus/${id}`, { method: 'DELETE' });
      fetchCorpus();
    } catch (err) {
      console.error('Failed to delete corpus entry:', err);
    }
  };

  const statusBadge = (status) => {
    const cls = status === 'verified' ? 'badge-verified' : status === 'rejected' ? 'badge-rejected' : 'badge-pending';
    return <span className={`badge ${cls}`}>{status || 'pending'}</span>;
  };

  const filteredSubmissions = submissions.filter(s => {
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesSearch = !searchQuery ||
      (s.source_term || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.translation || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    verified: submissions.filter(s => s.status === 'verified').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  };

  const corpusTotalPages = Math.ceil(corpusTotal / corpusLimit);

  if (loading) {
    return (
      <div>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="empty-state loading-pulse">
          <div className="empty-icon">📝</div>
          <div className="empty-text">Loading wiki data...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>📝</div>
          <div><div className="stat-label">Total Submissions</div><div className="stat-value">{stats.total}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-bg)', color: 'var(--warning)' }}>⏳</div>
          <div><div className="stat-label">Pending</div><div className="stat-value">{stats.pending}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>✅</div>
          <div><div className="stat-label">Verified</div><div className="stat-value">{stats.verified}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>❌</div>
          <div><div className="stat-label">Rejected</div><div className="stat-value">{stats.rejected}</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar">
        <button className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>
          Dialect Submissions
        </button>
        <button className={`tab-btn ${activeTab === 'corpus' ? 'active' : ''}`} onClick={() => { setActiveTab('corpus'); fetchCorpus(); }}>
          Dialect Corpus
        </button>
      </div>

      {activeTab === 'submissions' && (
        <>
          {/* Toolbar */}
          <div className="toolbar">
            <div className="search-wrapper" style={{ flex: 1 }}>
              <span className="search-icon">🔍</span>
              <input
                className="input"
                style={{ paddingLeft: 40 }}
                placeholder="Search by term or translation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select className="select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Submissions Table */}
          <div className="glass-card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Source Term</th>
                    <th>Translation</th>
                    <th>Type</th>
                    <th>Region</th>
                    <th>Author</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                        No submissions found.
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map(sub => (
                      <tr key={sub.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{sub.source_term}</td>
                        <td>{sub.translation || '—'}</td>
                        <td><span className="badge badge-admin">{sub.type || 'Term'}</span></td>
                        <td style={{ fontSize: '0.82rem' }}>{sub.region || '—'}</td>
                        <td style={{ fontSize: '0.82rem' }}>
                          {sub.profiles ? `${sub.profiles.first_name || ''} ${sub.profiles.last_name || ''}`.trim() || sub.profiles.username : '—'}
                        </td>
                        <td>{statusBadge(sub.status)}</td>
                        <td style={{ fontSize: '0.82rem' }}>
                          {sub.created_at ? new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                        </td>
                        <td>
                          {sub.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button className="btn btn-success btn-sm" onClick={() => handleVerify(sub.id)}>Verify</button>
                              <button className="btn btn-danger btn-sm" onClick={() => handleReject(sub.id)}>Reject</button>
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
        </>
      )}

      {activeTab === 'corpus' && (
        <>
          <div style={{ marginBottom: 16, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Showing {corpus.length} of {corpusTotal} validated corpus entries.
          </div>

          <div className="glass-card" style={{ padding: 0 }}>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Source Text</th>
                    <th>Dialect Translation</th>
                    <th>Standard Term</th>
                    <th>Region</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {corpus.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                        No corpus entries found.
                      </td>
                    </tr>
                  ) : (
                    corpus.map(entry => (
                      <tr key={entry.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{entry.source_text}</td>
                        <td>{entry.dialect_translation || '—'}</td>
                        <td>{entry.standard_term || '—'}</td>
                        <td><span className="badge badge-admin">{entry.region || '—'}</span></td>
                        <td>{statusBadge(entry.status)}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteCorpus(entry.id)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Corpus Pagination */}
          {corpusTotalPages > 1 && (
            <div className="pagination">
              <button className="page-btn" disabled={corpusPage <= 1} onClick={() => setCorpusPage(corpusPage - 1)}>‹</button>
              {Array.from({ length: Math.min(corpusTotalPages, 5) }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${corpusPage === p ? 'active' : ''}`} onClick={() => setCorpusPage(p)}>{p}</button>
              ))}
              <button className="page-btn" disabled={corpusPage >= corpusTotalPages} onClick={() => setCorpusPage(corpusPage + 1)}>›</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WikiManagement;
