import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import DictionaryManagement from './pages/DictionaryManagement';
import TranslationManagement from './pages/TranslationManagement';
import WikiManagement from './pages/WikiManagement';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import Analytics from './pages/Analytics';
import { authService } from './services/authService';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');

  // On desktop (>1024px) sidebar is always visible; on mobile it toggles
  useEffect(() => {
    const checkDesktop = () => {
      if (window.innerWidth > 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

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

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Close sidebar on mobile after navigation
    if (window.innerWidth <= 1024) {
      setIsSidebarOpen(false);
    }
  };

  const isDesktop = () => window.innerWidth > 1024;

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Dashboard':       return <Dashboard onNavigate={handleTabChange} />;
      case 'Analytics':       return <Analytics />;
      case 'Users':           return <UserManagement />;
      case 'Dictionary':      return <DictionaryManagement />;
      case 'Translations':    return <TranslationManagement />;
      case 'Wiki':            return <WikiManagement />;
      case 'Notifications':   return <Notifications />;
      default:                return <Dashboard onNavigate={handleTabChange} />;
    }
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-layout">
      {/* Mobile hamburger */}
      <button
        className="hamburger-btn"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Toggle sidebar"
      >
        {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Mobile overlay */}
      {isSidebarOpen && !isDesktop() && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogout={handleLogout}
      />

      <div className={`main-viewport ${!isSidebarOpen || !isDesktop() ? 'full-width' : ''}`}>
        {/* Navbar */}
        <div className="navbar">
          <div className="navbar-left">
            <div>
              <h1 className="navbar-title">{activeTab}</h1>
              <div className="navbar-subtitle">
                {activeTab === 'Dashboard'     && 'AI Operations & Data Governance Command Center'}
                {activeTab === 'Analytics'     && 'Translation Quality & Hallucination Monitoring'}
                {activeTab === 'Users'         && 'Manage user accounts and permissions'}
                {activeTab === 'Dictionary'    && 'Manage dialect dictionary entries'}
                {activeTab === 'Translations'  && 'Review user-recommended translations'}
                {activeTab === 'Wiki'          && 'Moderate community dialect submissions'}
                {activeTab === 'Notifications' && 'System and administrative alerts'}
              </div>
            </div>
          </div>
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
              <LogOut size={14} />
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