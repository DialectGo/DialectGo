// src/pages/Incidents.jsx
import React, { useState, useEffect } from 'react';
import { apiFetch } from '../services/apiService';
import { authService } from '../services/authService';
import '../assets/css/user-management.css';

const Incidents = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    fetchIncidents();
    const interval = setInterval(fetchIncidents, 10000);
    return () => clearInterval(interval);
  }, []);

  // 1. FETCH — uses apiFetch which auto-attaches token + handles 401 redirect
  const fetchIncidents = async () => {
    try {
      const payload = await apiFetch('/api/dashboard/security');
      if (payload.success) {
        setAnomalies(payload.data.anomalies);
      } else {
        console.error('Backend refused validation token:', payload.message);
      }
    } catch (err) {
      console.error('Failed to fetch threat intelligence feed:', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. RESOLVE MUTATION — uses authService.getToken() + manual fetch
  //    (apiFetch is GET-only by default; mutation needs method: PUT)
  const resolveThreat = async (id) => {
    try {
      const token = authService.getToken();
      const res = await fetch(`/api/dashboard/anomaly/${id}/resolve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        console.warn('Resolve threat failed:', res.status);
        return;
      }

      const payload = await res.json();
      if (payload.success) {
        setActionMessage(`Incident #${id} successfully marked as resolved.`);
        fetchIncidents();
        setTimeout(() => setActionMessage(''), 4000);
      }
    } catch (err) {
      console.error('Error patching security context status:', err);
    }
  };

  if (loading) return (
    <div style={{ padding: '40px', color: '#64748b' }}>
      Parsing threat detection metrics...
    </div>
  );

  return (
    <div className="user-mgmt-container" style={{ padding: 0 }}>
      {actionMessage && (
        <div style={{
          padding: '12px 20px', backgroundColor: '#dcfce7',
          color: '#16803d', borderRadius: '12px',
          fontWeight: '600', marginBottom: '20px',
        }}>
          {actionMessage}
        </div>
      )}

      <div className="main-bento-grid" style={{ gridTemplateColumns: '1fr' }}>
        <div className="bento-item">
          <div className="card-header" style={{ marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Active Threat Logs</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '4px' }}>
                Monitors user activities to detect insider threats, logging actions and sending alerts for unusual behaviors.
              </p>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Detected Event Rule</th>
                  <th>Severity</th>
                  <th>Incident Description</th>
                  <th>Logged</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {anomalies.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                      ✓ Zero insider anomalies identified across active storage logs.
                    </td>
                  </tr>
                ) : (
                  anomalies.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#0f172a', fontWeight: '700' }}>
                          {item.rule_violated}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          fontWeight: '800',
                          color: item.severity === 'CRITICAL' ? '#ef4444'
                               : item.severity === 'HIGH'     ? '#f97316'
                               :                                '#f59e0b',
                        }}>
                          {item.severity}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.9rem', maxWidth: '400px', color: '#334155', lineHeight: '1.4' }}>
                        {item.description}
                        <details style={{ marginTop: '8px' }}>
                          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                            View Context
                          </summary>
                          <pre style={{
                            background: '#f8fafc', padding: '10px',
                            borderRadius: '8px', overflowX: 'auto', fontSize: '0.75rem',
                          }}>
                            {JSON.stringify(item.context_data, null, 2)}
                          </pre>
                        </details>
                      </td>
                      <td style={{ color: '#64748b', fontSize: '0.85rem' }}>
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                      <td>
                        {!item.is_resolved ? (
                          <button
                            className="view-all-btn"
                            style={{ backgroundColor: '#1a1a1a', color: '#FFD230', cursor: 'pointer' }}
                            onClick={() => resolveThreat(item.id)}
                          >
                            Resolve Threat
                          </button>
                        ) : (
                          <span style={{ color: '#16a34a', fontWeight: '600', fontSize: '0.9rem' }}>
                            ✓ Resolved
                          </span>
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
    </div>
  );
};

export default Incidents;