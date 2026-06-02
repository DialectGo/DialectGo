// src/App.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import DictionaryManagement from './pages/DictionaryManagement';
import TranslationManagement from './pages/TranslationManagement';
import Incidents from './pages/Incidents';
import GameManagement from './pages/GameManagement';
import Login from './pages/Login'; // Make sure to save the Login component here!
import './assets/css/sidebar.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard');

  // Check if a valid login session already exists when the page loads
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      console.debug('Initial supabase session on App mount:', session);

      setIsAuthenticated(!!session);
    };
    
    checkSession();
    
    // Listen for auth changes to update UI reactively
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.debug('Auth state changed:', event, session);
      setIsAuthenticated(!!session);
    });

    // AGGRESSIVE TOKEN REFRESH: Refresh every 2 minutes to prevent expiration
    // This is more aggressive than the 5-minute cycle to ensure token never expires
    const refreshInterval = setInterval(async () => {
      try {
        console.debug('Running token refresh cycle...');
        
        // Always attempt a refresh to keep token fresh
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData?.session) {
          console.warn('Token refresh failed:', refreshError?.message);
          setIsAuthenticated(false);
          window.location.href = '/login';
        } else {
          console.log('Token successfully refreshed at:', new Date().toLocaleTimeString());
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error('Token refresh error:', e);
        setIsAuthenticated(false);
      }
    }, 2 * 60 * 1000); // Refresh every 2 minutes (more aggressive)

    return () => {
      authListener?.subscription?.unsubscribe?.();
      clearInterval(refreshInterval);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
      case 'Game Management':
        return <GameManagement />;
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