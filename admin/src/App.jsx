// src/App.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import DictionaryManagement from './pages/DictionaryManagement';
import TranslationManagement from './pages/TranslationManagement';
import Incidents from './pages/Incidents';
import GameManagement from './pages/GameManagement';
import Login from './pages/Login';
import { authService } from './services/authService'; // ← JWT auth
import './assets/css/sidebar.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Check if a valid JWT token exists when the page loads
  useEffect(() => {
    if (authService.isAuthenticated()) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    authService.clearToken(); // clears 'admin_token' from localStorage
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setActiveTab('Dashboard');
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Users':
        return <UserManagement />;
      case 'Incidents':
        return <Incidents />;
      case 'Dictionaries':
        return <DictionaryManagement />;
      case 'Translations':
        return <TranslationManagement />;
      case 'Game Management':
        return <GameManagement />;
      default:
        return <Dashboard />;
    }
  };

  // 1. Unauthenticated Guard — show Login if no valid token
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // 2. Main Authenticated Application Layout
  return (
    <div className="app-layout">
      <button
        className="hamburger-btn"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      <Sidebar
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      <div className={`main-viewport ${!isSidebarOpen ? 'full-width' : ''}`}>
        <Navbar title={activeTab} />

        <div style={{ textAlign: 'right', paddingRight: '40px' }}>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            ↳ Sign Out
          </button>
        </div>

        <main style={{ marginTop: '10px' }}>
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}

export default App;