import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/apiService';
import CardSkeleton from '../components/CardSkeleton';

const DictionaryManagement = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const limit = 20;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editTarget, setEditTarget] = useState(null);
  const [formData, setFormData] = useState({ word_term: '', definition: '', part_of_speech: '', example_usage: '', language_id: '' });

  useEffect(() => { fetchEntries(); }, [page]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const payload = await apiFetch(`/api/admin/dictionary?page=${page}&limit=${limit}`);
      setEntries(payload.data || []);
      setTotalCount(payload.count || 0);
    } catch (err) {
      console.error('Failed to load dictionary:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setFormData({ word_term: '', definition: '', part_of_speech: '', example_usage: '', language_id: '' });
    setModalMode('add');
    setShowModal(true);
  };

  const openEditModal = (entry) => {
    setEditTarget(entry);
    setFormData({
      word_term: entry.word_term || '',
      definition: entry.definition || '',
      part_of_speech: entry.part_of_speech || '',
      example_usage: entry.example_usage || '',
      language_id: entry.language_id || '',
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (modalMode === 'add') {
        await apiFetch('/api/admin/dictionary', { method: 'POST', body: JSON.stringify(formData) });
      } else {
        await apiFetch(`/api/admin/dictionary/${editTarget.id}`, { method: 'PUT', body: JSON.stringify(formData) });
      }
      setShowModal(false);
      fetchEntries();
    } catch (err) {
      console.error('Failed to save entry:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this dictionary entry?')) return;
    try {
      await apiFetch(`/api/admin/dictionary/${id}`, { method: 'DELETE' });
      fetchEntries();
    } catch (err) {
      console.error('Failed to delete entry:', err);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  const filtered = entries.filter(e =>
    !searchQuery || (e.word_term || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div>
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="empty-state loading-pulse">
          <div className="empty-icon">📖</div>
          <div className="empty-text">Loading dictionary entries...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--info-bg)', color: 'var(--info)' }}>📖</div>
          <div><div className="stat-label">Total Entries</div><div className="stat-value">{totalCount}</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>📄</div>
          <div><div className="stat-label">Current Page</div><div className="stat-value">{page} / {totalPages || 1}</div></div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-wrapper" style={{ flex: 1 }}>
          <span className="search-icon">🔍</span>
          <input
            className="input"
            style={{ paddingLeft: 40 }}
            placeholder="Search by word term..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>+ Add Entry</button>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Word / Term</th>
                <th>Definition</th>
                <th>Part of Speech</th>
                <th>Example</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                    No entries found.
                  </td>
                </tr>
              ) : (
                filtered.map(entry => (
                  <tr key={entry.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{entry.word_term}</td>
                    <td style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.definition || '—'}
                    </td>
                    <td>
                      {entry.part_of_speech ? (
                        <span className="badge badge-admin">{entry.part_of_speech}</span>
                      ) : '—'}
                    </td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                      {entry.example_usage || '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEditModal(entry)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(entry.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
            <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>›</button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">{modalMode === 'add' ? 'Add Dictionary Entry' : 'Edit Dictionary Entry'}</h3>

            <div className="form-group">
              <label className="form-label">Word / Term</label>
              <input className="input" value={formData.word_term} onChange={(e) => setFormData({ ...formData, word_term: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Definition</label>
              <input className="input" value={formData.definition} onChange={(e) => setFormData({ ...formData, definition: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Part of Speech</label>
              <select className="select" style={{ width: '100%' }} value={formData.part_of_speech} onChange={(e) => setFormData({ ...formData, part_of_speech: e.target.value })}>
                <option value="">Select...</option>
                <option value="noun">Noun</option>
                <option value="verb">Verb</option>
                <option value="adjective">Adjective</option>
                <option value="adverb">Adverb</option>
                <option value="pronoun">Pronoun</option>
                <option value="interjection">Interjection</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Example Usage</label>
              <input className="input" value={formData.example_usage} onChange={(e) => setFormData({ ...formData, example_usage: e.target.value })} />
            </div>

            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>
                {modalMode === 'add' ? 'Add Entry' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DictionaryManagement;