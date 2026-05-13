// src/App.jsx
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Dashboard'); // This can later be dynamic via React Router
  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <Dashboard />;
      case 'Users':
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar 
        isOpen={isSidebarOpen} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      <button className="hamburger-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      <main className={`main-viewport ${!isSidebarOpen ? 'full-width' : ''}`}>
        {/* FIX 1: Use activeTab instead of currentTab */}
        <Navbar title={activeTab} /> 
        
        {/* FIX 2: Call the function to render the correct page */}
        {renderContent()} 
      </main>
    </div>
  );
}

export default App;