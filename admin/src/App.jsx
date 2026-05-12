// src/App.jsx
import React from 'react';
import styles from './AdminDashboard.module.css';

function App() {
  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>DialectGo Admin</div>
        <nav className={styles.nav}>
          <a href="#" className={`${styles.navItem} ${styles.navItemActive}`}>Dashboard</a>
          <a href="#" className={styles.navItem}>Dialects List</a>
          <a href="#" className={styles.navItem}>Users</a>
          <a href="#" className={styles.navItem}>Settings</a>
        </nav>
      </aside>

      {/* Main Area */}
      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.search}>Search Dialects...</div>
          <div className={styles.profile}>Admin User</div>
        </header>

        <main className={styles.content}>
          <h2 style={{ marginBottom: '24px' }}>Overview</h2>
          
          <div className={styles.statsGrid}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Total Dialects</div>
              <div className={styles.cardValue}>124</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Active Contributors</div>
              <div className={styles.cardValue}>1,042</div>
            </div>
            <div className={styles.card}>
              <div className={styles.cardTitle}>Pending Approvals</div>
              <div className={styles.cardValue}>18</div>
            </div>
          </div>

          <div className={styles.card} style={{ minHeight: '300px' }}>
            <h3>Recent Contributions</h3>
            <p style={{ color: '#94a3b8', marginTop: '16px' }}>
              Data table will appear here...
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;