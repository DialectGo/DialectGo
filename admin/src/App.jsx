// src/App.jsx
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const currentTab = "Dashboard"; // This can later be dynamic via React Router

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} />
      
      <button className="hamburger-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        {isSidebarOpen ? '✕' : '☰'}
      </button>

      <main className={`main-viewport ${!isSidebarOpen ? 'full-width' : ''}`}>
        <Navbar title={currentTab} />
        <Dashboard />
      </main>
    </div>
  );
}

export default App;