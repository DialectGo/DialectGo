// src/pages/TranslationManagement.jsx
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const TranslationManagement = () => {
  const [error, setError] = useState(null);
  const [historyRecords, setHistoryRecords] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination Parameters
  const [historyPage, setHistoryPage] = useState(1);
  const [recsPage, setRecsPage] = useState(1);
  const itemsPerPage = 10;

  // Staging Matrix Controls
  const [showStageModal, setShowStageModal] = useState(false);
  const [targetTable, setTargetTable] = useState('');
  const [operationType, setOperationType] = useState('');
  const [targetRowId, setTargetRowId] = useState(null);
  const [rationale, setRationale] = useState('');
  
  // Staging Form Dynamic Elements
  const [editSourceText, setEditSourceText] = useState('');
  const [editTranslatedText, setEditTranslatedText] = useState('');

  useEffect(() => {
    fetchTranslationWorkspaceMetrics();
  }, []);

  const fetchTranslationWorkspaceMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
        const token = localStorage.getItem('admin_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // PATH FIXED: Pointing accurately to the nested /api/v1/translations base route context
        const [historyRes, recsRes, analyticsRes] = await Promise.all([
          fetch('/api/v1/translations/admin/history', { headers }),
          fetch('/api/v1/translations/admin/recommendations', { headers }),
          fetch('/api/v1/translations/admin/analytics/daily', { headers })
        ]);

        const historyPayload = await historyRes.json();
        const recsPayload = await recsRes.json();
        const analyticsPayload = await analyticsRes.json();

        // DEFENSIVE PARSING (Fixes empty arrays if backend structures vary)
        const historyList = Array.isArray(historyPayload) ? historyPayload : (historyPayload.data || historyPayload.history || []);
        setHistoryRecords(historyList);

        const recsList = Array.isArray(recsPayload) ? recsPayload : (recsPayload.data || recsPayload.recommendations || []);
        setRecommendations(recsList);

        const analyticsList = Array.isArray(analyticsPayload) ? analyticsPayload : (analyticsPayload.data || analyticsPayload.analytics || []);
        setAnalyticsData(analyticsList);

    } catch (err) {
        console.error("Failed to cleanly balance translation data pools:", err);
        setError("Could not connect to the backend engine core. Verify your API server is running.");
    } finally {
        setLoading(false);
    }
  };

  const openStagingWizard = (table, operation, row) => {
    setTargetTable(table);
    setOperationType(operation);
    setTargetRowId(row.id);
    setRationale('');
    
    if (operation === 'UPDATE' && table === 'translation_history') {
      setEditSourceText(row.source_text || '');
      setEditTranslatedText(row.translated_text || '');
    } else {
      setEditSourceText('');
      setEditTranslatedText('');
    }
    setShowStageModal(true);
  };

  const handleStageRequestSubmission = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('admin_token');
      
      let proposedData = {};
      if (targetTable === 'translation_history' && operationType === 'UPDATE') {
        proposedData = { source_text: editSourceText, translated_text: editTranslatedText };
      } else if (targetTable === 'user_recommended_translations') {
        proposedData = { status: operationType === 'APPROVE' ? 'approved' : 'rejected' };
      }

      const res = await fetch('/api/dataset/dictionary/stage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetTable,
          operationType: operationType === 'APPROVE' || operationType === 'DENY' ? 'UPDATE' : operationType,
          targetRowId,
          proposedData,
          rationale
        })
      });

      const payload = await res.json();
      alert(payload.message || "Action successfully staged into the audit pool log layers.");
      setShowStageModal(false);
      fetchTranslationWorkspaceMetrics();
    } catch (err) {
      console.error("Failed transmission processing request workflow staging:", err);
    }
  };

  // Pagination Computing Logic Mappings
  const historyIdxLast = historyPage * itemsPerPage;
  const historyIdxFirst = historyIdxLast - itemsPerPage;
  const currentHistoryRows = historyRecords.slice(historyIdxFirst, historyIdxLast);
  const totalHistoryPages = Math.ceil(historyRecords.length / itemsPerPage);

  const recsIdxLast = recsPage * itemsPerPage;
  const recsIdxFirst = recsIdxLast - itemsPerPage;
  const currentRecsRows = recommendations.slice(recsIdxFirst, recsIdxLast);
  const totalRecsPages = Math.ceil(recommendations.length / itemsPerPage);

  // ChartJS Configuration Data mapping
  const chartConfig = {
    labels: analyticsData.map(d => d.date || ''),
    datasets: [{
      label: 'System Dynamic Requests Pipeline',
      data: analyticsData.map(d => d.count || 0),
      borderColor: '#FFD230',
      backgroundColor: 'rgba(255, 210, 48, 0.12)',
      tension: 0.25,
      fill: true,
      pointBackgroundColor: '#1a1a1a',
      borderWidth: 3
    }]
  };

  if (error) return <div style={{ padding: '40px', color: '#ef4444', fontWeight: 600 }}>{error}</div>;
  if (loading) return <div style={{ padding: '40px', color: '#64748b' }}>Decompressing operational Bento metrics profiles...</div>;

  return (
    <div className="translation-mgmt-container" style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* HEADER ACTION TITLE BANNER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Translation Engine Management Workspace</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '4px 0 0 0' }}>Bento matrix tracking platform translations and public suggestions using peer validation mechanisms.</p>
        </div>
      </div>

      {/* METRIC ENGINE CHART PANEL CARD */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <h3 style={{ margin: '0 0 4px 0', fontWeight: 800, color: '#0f172a' }}>Platform Query Trailing Flow</h3>
        <p style={{ margin: '0 0 16px 0', fontSize: '0.78rem', color: '#64748b' }}>Approximate translation requests generated across system user frameworks trailing a 7-day loop window.</p>
        <div style={{ height: '180px', position: 'relative' }}>
          <Line data={chartConfig} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
        </div>
      </div>

      {/* COMPACT TWO-COLUMN GRID ARCHITECTURE LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* BLOCK A: IMMUTABLE ENGINE TRANSLATION REGISTRY */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800 }}>Translation History Audit Pool</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Immutable user translation transactions database logs.</span>
            
            <div style={{ overflowX: 'auto', marginTop: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.8rem' }}>
                    <th style={{ padding: '10px' }}>User Session</th>
                    <th style={{ padding: '10px' }}>Linguistic Content</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentHistoryRows.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                      <td style={{ padding: '12px 10px' }}>
                        <strong style={{ display: 'block', color: '#0f172a' }}>{item.profiles?.first_name || 'Anonymous User'}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>@{item.profiles?.username || 'unknown_account'}</span>
                      </td>
                      <td style={{ padding: '12px 10px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.72rem', marginBottom: '2px', color: '#64748b' }}>
                          Direction: <strong>{item.source_lang?.code || '??'}</strong> → <strong>{item.target_lang?.code || '??'}</strong>
                        </div>
                        <span style={{ color: '#ef4444' }}>src:</span> {item.source_text || '""'}<br/>
                        <span style={{ color: '#22c55e' }}>trans:</span> {item.translated_text || '""'}
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button onClick={() => openStagingWizard('translation_history', 'UPDATE', item)} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Edit</button>
                          <button onClick={() => openStagingWizard('translation_history', 'DELETE', item)} style={{ background: 'none', border: 'none', color: '#dc2626', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* BLOCK A PAGINATION FOOTER CONTROL PANEL */}
          {totalHistoryPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Page {historyPage} of {totalHistoryPages}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => setHistoryPage(p => Math.max(1, p - 1))} disabled={historyPage === 1} style={{ padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fff', fontSize: '0.78rem', cursor: historyPage === 1 ? 'not-allowed' : 'pointer' }}>Prev</button>
                <button onClick={() => setHistoryPage(p => Math.min(totalHistoryPages, p + 1))} disabled={historyPage === totalHistoryPages} style={{ padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fff', fontSize: '0.78rem', cursor: historyPage === totalHistoryPages ? 'not-allowed' : 'pointer' }}>Next</button>
              </div>
            </div>
          )}
        </div>

        {/* BLOCK B: CONTRIBUTOR REGS INTERSECTION DATA CARD */}
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 800 }}>User-Recommended Translations</h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Public recommendation submissions requiring co-admin approval parameters.</span>
            
            <div style={{ overflowX: 'auto', marginTop: '16px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', fontSize: '0.8rem' }}>
                    <th style={{ padding: '10px' }}>Contributor</th>
                    <th style={{ padding: '10px' }}>Proposed Data</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Review Logic</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRecsRows.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.85rem' }}>
                      <td style={{ padding: '12px 10px' }}>
                        <strong style={{ display: 'block' }}>{item.profiles?.first_name || 'Contributor'}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>@{item.profiles?.username || 'anonymous'}</span>
                      </td>
                      <td style={{ padding: '12px 10px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.72rem', marginBottom: '2px', color: '#64748b' }}>
                          Langs: <strong>{item.source_lang?.code || '??'}</strong> → <strong>{item.target_lang?.code || '??'}</strong>
                        </div>
                        <span style={{ color: '#64748b' }}>In:</span> {item.source_text || '""'}<br/>
                        <span style={{ color: '#f59e0b', fontWeight: 600 }}>Out:</span> {item.user_translation || '""'}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: item.status === 'pending' ? '#fef3c7' : item.status === 'approved' ? '#dcfce7' : '#fee2e2', color: item.status === 'pending' ? '#d97706' : item.status === 'approved' ? '#15803d' : '#b91c1c' }}>
                          {(item.status || 'pending').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                        {item.status === 'pending' ? (
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                            <button onClick={() => openStagingWizard('user_recommended_translations', 'APPROVE', item)} style={{ background: '#dcfce7', border: 'none', color: '#15803d', fontWeight: 700, cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>Approve</button>
                            <button onClick={() => openStagingWizard('user_recommended_translations', 'DENY', item)} style={{ background: '#fee2e2', border: 'none', color: '#b91c1c', fontWeight: 700, cursor: 'pointer', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>Deny</button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Resolved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* BLOCK B PAGINATION FOOTER CONTROL PANEL */}
          {totalRecsPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Page {recsPage} of {totalRecsPages}</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => setRecsPage(p => Math.max(1, p - 1))} disabled={recsPage === 1} style={{ padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fff', fontSize: '0.78rem', cursor: recsPage === 1 ? 'not-allowed' : 'pointer' }}>Prev</button>
                <button onClick={() => setRecsPage(p => Math.min(totalRecsPages, p + 1))} disabled={recsPage === totalRecsPages} style={{ padding: '4px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', backgroundColor: '#fff', fontSize: '0.78rem', cursor: recsPage === totalRecsPages ? 'not-allowed' : 'pointer' }}>Next</button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* DUAL-AUTHORIZATION AUDITING LAYER MODAL POPUP */}
      {showStageModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 }}>
          <form onSubmit={handleStageRequestSubmission} style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '16px', width: '480px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            
            <h3 style={{ fontWeight: 800, fontSize: '1.25rem', marginBottom: '4px' }}>Stage Action: {operationType}</h3>
            <p style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '20px' }}>Executing modifications on core translation structures. Peer administrator validation loops are strictly enforced.</p>

            {targetTable === 'translation_history' && operationType === 'UPDATE' && (
              <>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Source Text Value</label>
                <textarea value={editSourceText} onChange={e => setEditSourceText(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '14px', resize: 'vertical', fontFamily: 'inherit' }} />

                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>Translated Text Value</label>
                <textarea value={editTranslatedText} onChange={e => setEditTranslatedText(e.target.value)} required style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '14px', resize: 'vertical', fontFamily: 'inherit' }} />
              </>
            )}

            {operationType === 'DELETE' && (
              <div style={{ padding: '12px', backgroundColor: '#fff5f5', border: '1px solid #fee2e2', borderRadius: '8px', color: '#991b1b', fontSize: '0.85rem', marginBottom: '16px' }}>
                <strong>Warning:</strong> Proposing a hard truncation loop sequence against runtime target row element identifier references: <strong>#{targetRowId}</strong>.
              </div>
            )}

            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: '#f59e0b' }}>Justification Audit Note</label>
            <input type="text" value={rationale} onChange={e => setRationale(e.target.value)} placeholder="Provide compliance justification tracking summary..." required style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '24px', fontSize: '0.9rem' }} />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setShowStageModal(false)} style={{ padding: '10px 16px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button type="submit" style={{ padding: '10px 20px', background: operationType === 'DELETE' || operationType === 'DENY' ? '#dc2626' : '#1a1a1a', color: operationType === 'DELETE' || operationType === 'DENY' ? '#fff' : '#FFD230', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
                Stage Request
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default TranslationManagement;