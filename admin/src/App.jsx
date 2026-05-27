// src/App.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import DictionaryManagement from './pages/DictionaryManagement';
import TranslationManagement from './pages/TranslationManagement';
import Incidents from './pages/Incidents';
import Login from './pages/Login'; // Make sure to save the Login component here!
import './assets/css/sidebar.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Check if a valid login session already exists when the page loads
  useEffect(() => {
    const sessionStr = localStorage.getItem('sb-access-token');
    if (sessionStr) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sb-access-token');
    setIsAuthenticated(false);
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
      default:
        return <Dashboard />;
    }
  };

  // 1. Unauthenticated Guard Check Layer
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // 2. Main Authenticated Application View Workspace Screen Layout
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
        
        {/* Simple inline signout link option for panel dashboard */}
        <div style={{ textAlign: 'right', paddingRight: '40px' }}>
          <button 
            onClick={handleLogout} 
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: '600' }}
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