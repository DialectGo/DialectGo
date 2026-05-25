// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import '../assets/css/sidebar.css';

const Dashboard = () => {
  const [stats, setStats] = useState([
    { title: 'System Anomalies', value: '0', color: '#ef4444' },
    { title: 'Operational Audits Logs', value: '0', color: '#1a1a1a' },
    { title: 'Monitored Actions', value: 'Active', color: '#FFD230' },
  ]);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    async function loadDashboardMetrics() {
      try {
        const res = await fetch('/api/dashboard/security'); // No headers needed during bypass
        const payload = await res.json();
        if (payload.success) {
          const activeThreats = payload.data.anomalies.filter(a => !a.is_resolved).length;
          
          setStats([
            { title: 'Active System Anomalies', value: activeThreats.toString(), color: '#ef4444' },
            { title: 'Total Activity Logs', value: payload.data.recentLogs.length.toString(), color: '#1a1a1a' },
            { title: 'UAM Telemetry Status', value: 'Healthy', color: '#22c55e' },
          ]);
          setRecentLogs(payload.data.recentLogs);
        }
      } catch (err) {
        console.error("Error reading operational logging data stream:", err);
      }
    }
    loadDashboardMetrics();
  }, []);

  return (
    <div className="page-content" style={{ padding: 0 }}>
      <div className="stats-grid" style={{ margin: '0 0 24px 0' }}>
        {stats.map((stat) => (
          <div key={stat.title} className="stat-card">
            <span className="stat-title">{stat.title}</span>
            <h3 className="stat-value" style={{ borderLeft: `4px solid ${stat.color}` }}>
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      <section className="main-card">
        <div className="card-header">
          <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Recent Administrative Logs (UAM Trail)</h3>
        </div>
        <div className="table-wrapper" style={{ marginTop: '15px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '12px', color: '#64748b' }}>Audited Event Rule Action</th>
                <th style={{ padding: '12px', color: '#64748b' }}>Origin Location Tracking</th>
                <th style={{ padding: '12px', color: '#64748b' }}>Execution Log Time</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>
                    Waiting for admin dashboard stream events...
                  </td>
                </tr>
              ) : (
                recentLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 12px' }}>
                      <code style={{ 
                        backgroundColor: '#f1f5f9', 
                        padding: '4px 8px', 
                        borderRadius: '6px', 
                        fontFamily: 'monospace',
                        color: '#0f172a'
                      }}>
                        {log.action_type}
                      </code>
                    </td>
                    <td style={{ padding: '14px 12px', color: '#334155' }}>
                      {log.city_name}, {log.country_code}
                    </td>
                    <td style={{ padding: '14px 12px', color: '#64748b' }}>
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;