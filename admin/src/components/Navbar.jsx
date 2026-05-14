// src/components/Navbar.jsx
import React from 'react';
import '../assets/css/sidebar.css';

const Navbar = ({ title }) => {
  const now = new Date();
  const hours = now.getHours();
  
  // Format Date: e.g., "May 13, 2026"
  const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
  const formattedDate = now.toLocaleDateString('en-US', dateOptions);

  // Dynamic Greeting
  let greeting = "Good Evening!";
  if (hours < 12) greeting = "Good Morning!";
  else if (hours < 18) greeting = "Good Afternoon!";

  return (
    <nav className="navbar-container">
      <div className="navbar-left">
        <h1 className="nav-page-title">{title}</h1>
      </div>
      <div className="navbar-right">
        <div className="time-greeting">
          <span className="current-date">{formattedDate}</span>
          <span className="greeting-text">{greeting}</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;