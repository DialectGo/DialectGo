import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import DictionaryManagement from './pages/DictionaryManagement';
import TranslationManagement from './pages/TranslationManagement';
import WikiManagement from './pages/WikiManagement';
import Login from './pages/Login';
import { authService } from './services/authService';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');

  useEffect(() => {
    if (authService.isAuthenticated()) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    authService.clearToken();
    setIsAuthenticated(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setActiveTab('Dashboard');
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Dashboard':       return <Dashboard />;
      case 'Users':           return <UserManagement />;
      case 'Dictionary':      return <DictionaryManagement />;
      case 'Translations':    return <TranslationManagement />;
      case 'Wiki':            return <WikiManagement />;
      default:                return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

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
        onLogout={handleLogout}
      />

      <div className={`main-viewport ${!isSidebarOpen ? 'full-width' : ''}`}>
        {/* Navbar */}
        <div className="navbar">
          <h1 className="navbar-title">{activeTab}</h1>
          <div className="navbar-right">
            <div className="navbar-date">
              <div className="date">
                {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
              <div className="greeting">
                {new Date().getHours() < 12 ? 'Good Morning!' : new Date().getHours() < 18 ? 'Good Afternoon!' : 'Good Evening!'}
              </div>
            </div>
            <button className="btn-signout" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </div>

        <main>{renderActiveView()}</main>
      </div>
    </div>
  );
}

export default App;