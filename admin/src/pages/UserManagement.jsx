import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import '../assets/css/user-management.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const UserManagement = () => {
  const [selectedStat, setSelectedStat] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null);

  // Mock Data based on your SQL schema
  const stats = [
    { label: 'Total Users', count: 1250, type: 'total', color: '#FFD230' },
    { label: 'Active', count: 1100, type: 'active', color: '#4ade80' },
    { label: 'Disabled', count: 150, type: 'disabled', color: '#f87171' },
    { label: 'Admins', count: 5, type: 'admin', color: '#1a1a1a' },
  ];

  const chartData = {
    labels: ['1-5 Days', '6-10 Days', '11-20 Days', '21-30 Days', '30+ Days'],
    datasets: [{
      label: 'User Streaks',
      data: [400, 300, 200, 150, 100],
      backgroundColor: '#FFD230',
      borderRadius: 8,
    }]
  };

  return (
    <div className="user-mgmt-container">
      {/* Top Clickable Stats Cards */}
      <div className="stats-bento-grid">
        {stats.map((stat) => (
          <div 
            key={stat.label} 
            className="stat-card clickable" 
            onClick={() => setSelectedStat(stat)}
          >
            <span className="stat-label">{stat.label}</span>
            <h2 className="stat-value" style={{ color: stat.color }}>{stat.count}</h2>
          </div>
        ))}
      </div>

      {/* Main Content Bento Grid */}
      <div className="main-bento-grid">
        {/* User Table Card */}
        <div className="bento-item user-table-card">
          <div className="card-header">
            <h3>User Directory</h3>
            <div className="search-box">
              <input type="text" placeholder="Search Username..." />
            </div>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3].map((i) => (
                  <tr key={i}>
                    <td>Maria Clara</td>
                    <td>Alba</td>
                    <td>mariaclara123</td>
                    <td><span className="badge">User</span></td>
                    <td className="action-cell">
                      <button className="cog-btn" onClick={() => setActiveActionId(activeActionId === i ? null : i)}>
                        ⚙️
                      </button>
                      {activeActionId === i && (
                        <div className="action-dropdown">
                          <button>Edit</button>
                          <button className="text-red">Disable</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Languages / Locations */}
        <div className="bento-item secondary-card">
          <h3>Top Preferred Languages</h3>
          <ul className="ranking-list">
            <li><span>Tagalog</span> <span>45%</span></li>
            <li><span>English</span> <span>30%</span></li>
            <li><span>Cebuano</span> <span>15%</span></li>
            <li><span>Ilocano</span> <span>7%</span></li>
            <li><span>Hiligaynon</span> <span>3%</span></li>
          </ul>
        </div>

        {/* Streaks Chart */}
        <div className="bento-item secondary-card">
          <h3>Usage Streaks (Days)</h3>
          <div className="chart-container">
            <Bar data={chartData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Mini Modal for Stat Details */}
      {selectedStat && (
        <div className="mini-modal-overlay" onClick={() => setSelectedStat(null)}>
          <div className="mini-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{selectedStat.label} Details</h4>
              <button onClick={() => setSelectedStat(null)}>✕</button>
            </div>
            <div className="modal-content scrollable">
              {/* Mock list of users for the modal */}
              {[...Array(10)].map((_, i) => (
                <div key={i} className="user-mini-row">
                  <div className="avatar-placeholder"></div>
                  <div>
                    <p className="name">User {i + 1}</p>
                    <p className="email">user{i}@email.com</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;