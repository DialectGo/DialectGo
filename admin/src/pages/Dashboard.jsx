// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { authFetch } from '../utils/authFetch';
import '../assets/css/sidebar.css';
import ActiveAdmins from '../components/ActiveAdmins';
import { apiFetch } from '../services/apiService'; 

const INITIAL_STATS = [
  { title: 'Active System Anomalies', value: '—', color: '#ef4444' },
  { title: 'Total Activity Logs',     value: '—', color: '#1a1a1a' },
  { title: 'UAM Telemetry Status',    value: '—', color: '#22c55e' },
];

const Dashboard = () => {
  const [stats, setStats]           = useState(INITIAL_STATS);
  const [recentLogs, setRecentLogs] = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState(null);

  useEffect(() => {
    async function loadDashboardMetrics() {
      try {
        setIsLoading(true);
        setError(null);

        // apiFetch automatically attaches Authorization: Bearer <token>
        // and redirects to /login if the token is missing or expired
        const payload = await apiFetch('/api/dashboard/security');

        const activeThreats = payload.data.anomalies.filter(
          (a) => !a.is_resolved
        ).length;

        setStats([
          { title: 'Active System Anomalies', value: activeThreats.toString(),                        color: '#ef4444' },
          { title: 'Total Activity Logs',     value: payload.data.recentLogs.length.toString(),       color: '#1a1a1a' },
          { title: 'UAM Telemetry Status',    value: 'Healthy',                                       color: '#22c55e' },
        ]);

        setRecentLogs(payload.data.recentLogs);
      } catch (err) {
        // apiFetch already handles 401 redirect — this catches everything else
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="page-content" style={{ padding: '24px', color: '#64748b' }}>
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content" style={{ padding: '24px', color: '#ef4444' }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div className="page-content" style={{ padding: 0 }}>
      {/* Stats Row */}
      <div className="stats-grid" style={{ margin: '0 0 24px 0' }}>
        {stats.map((stat) => (
          <div key={stat.title} className="stat-card">
            <span className="stat-title">{stat.title}</span>
            <h3
              className="stat-value"
              style={{ borderLeft: `4px solid ${stat.color}` }}
            >
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Logs Table */}
      <section className="main-card">
        <div className="card-header">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
            Recent Administrative Logs (UAM Trail)
          </h3>
        </div>

        <div className="table-wrapper" style={{ marginTop: '15px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px', color: '#64748b' }}>Audited Event</th>
                <th style={{ padding: '12px', color: '#64748b' }}>Origin Location</th>
                <th style={{ padding: '12px', color: '#64748b' }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}
                  >
                    No logs found.
                  </td>
                </tr>
              ) : (
                recentLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 12px' }}>
                      <code
                        style={{
                          backgroundColor: '#f1f5f9',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontFamily: 'monospace',
                          color: '#0f172a',
                        }}
                      >
                        {log.action_type}
                      </code>
                    </td>
                    <td style={{ padding: '14px 12px', color: '#334155' }}>
                      {log.city_name}, {log.country_code}
                    </td>
                    <td style={{ padding: '14px 12px', color: '#64748b' }}>
                      {new Date(log.created_at).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div>
          <ActiveAdmins />
        </div>
      </section>
    </div>
  );
};

export default Dashboard;