// src/pages/Dashboard.jsx
import React from 'react';
import '../assets/css/sidebar.css'; // We'll add stat card styles here

const Dashboard = () => {
  const stats = [
    { title: 'Total Dialects', value: '124', color: '#FFD230' },
    { title: 'Active Contributors', value: '1,042', color: '#1a1a1a' },
    { title: 'Pending Approvals', value: '18', color: '#ef4444' },
  ];

  return (
    <div className="page-content">
      <header className="page-header">
        <h1 className="brand-yellow-text">Dashboard</h1>
        <p className="subtitle">Monitor system activity and overview.</p>
      </header>

      <div className="stats-grid">
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
          <h3>Recent Contributions</h3>
          <button className="view-all-btn">View All</button>
        </div>
        <div className="placeholder-table">
          <p>Data table will be integrated here...</p>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;