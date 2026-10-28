import { useState, useEffect } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import DictionaryManagement from './pages/DictionaryManagement';
import TranslationManagement from './pages/TranslationManagement';
import WikiManagement from './pages/WikiManagement';
import Notifications from './pages/Notifications';
import Login from './pages/Login';
import { authService } from './services/authService';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => authService.isAuthenticated());
  const [isCompact, setIsCompact] = useState(() => window.innerWidth <= 1024);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 1024);
  const [activeTab, setActiveTab] = useState('Dashboard');

  useEffect(() => {
    const updateViewport = () => setIsCompact(window.innerWidth <= 1024);
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  useEffect(() => {
    if (!isSidebarOpen || !isCompact) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setIsSidebarOpen(false);
        document.getElementById('admin-menu-toggle')?.focus();
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isSidebarOpen, isCompact]);

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
    if (isCompact) {
      setIsSidebarOpen(false);
    }
  };


  const renderActiveView = () => {
    switch (activeTab) {
      case 'Dashboard':       return <Dashboard onNavigate={handleTabChange} />;
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
      <a className="skip-link" href="#main-content">Skip to content</a>
      <button
        className={`hamburger-btn ${isSidebarOpen ? 'sidebar-open' : ''}`}
        id="admin-menu-toggle"
        aria-expanded={isSidebarOpen}
        aria-controls="admin-sidebar"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {isSidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {isSidebarOpen && isCompact && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        isOpen={isSidebarOpen}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      <div className={`main-viewport ${!isSidebarOpen || isCompact ? 'full-width' : ''}`}>
        {/* Navbar */}
        <div className="navbar">
          <div className="navbar-left">
            <div>
              <h1 className="navbar-title">{activeTab}</h1>
              <div className="navbar-subtitle">
                {activeTab === 'Dashboard'     && 'Your platform at a glance'}
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

        <main id="main-content" tabIndex={-1} key={activeTab}>{renderActiveView()}</main>
      </div>
    </div>
  );
}

export default App;
