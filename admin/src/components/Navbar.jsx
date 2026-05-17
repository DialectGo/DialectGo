// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react'; 
import '../assets/css/sidebar.css';

const Navbar = ({ title }) => {
  const now = new Date();
  const hours = now.getHours();

  const [notifications, setNotifications] = useState([]);
  const [showHub, setShowHub] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false); // Track visual loading updates
  
  // Format Date: e.g., "May 18, 2026"
  const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
  const formattedDate = now.toLocaleDateString('en-US', dateOptions);

  useEffect(() => {
      // Run initial check on load
      getLatestNotifications();
      
      // Keep background polling active
      const pollTimer = setInterval(getLatestNotifications, 15000);
      return () => clearInterval(pollTimer);
  }, []);

  /**
   * Dedicated function for retrieving pending ledger changes from the system
   */
  const getLatestNotifications = async () => {
      setIsRefreshing(true);
      try {
          const token = localStorage.getItem('sb-access-token');
          if (!token) {
              console.warn("No active authorization token found in system context.");
              return;
          }

          const res = await fetch('/api/dataset/dictionary/verifications', {
              method: 'GET',
              headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
              }
          });

          if (!res.ok) {
              throw new Error(`Server returned network status code: ${res.status}`);
          }

          const payload = await res.json();
          if (payload.success && Array.isArray(payload.data)) {
              setNotifications(payload.data);
          } else {
              setNotifications([]);
          }
      } catch (err) { 
          console.error("Error connecting to notification center stream:", err); 
      } finally {
          setIsRefreshing(false);
      }
  };

  const handleActionDecision = async (logId, decision) => {
      try {
          const token = localStorage.getItem('sb-access-token');
          const res = await fetch(`/api/dataset/dictionary/verify/${logId}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ decision })
          });
          const payload = await res.json();
          if (payload.success) {
              alert(`Transaction choice processed successfully: ${decision}`);
              getLatestNotifications(); // Pull clean database status immediately
          } else {
              alert(`Error confirming submission workflow: ${payload.message}`);
          }
      } catch (err) { 
          console.error("Verification processing failed:", err); 
      }
  };

  // Dynamic Greeting
  let greeting = "Good Evening!";
  if (hours < 12) greeting = "Good Morning!";
  else if (hours < 18) greeting = "Good Afternoon!";

  return (
    <nav className="navbar-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
      {/* LEFT SECTION: Context Title */}
      <div className="navbar-left">
        <h1 className="nav-page-title">{title}</h1>
      </div>

      {/* RIGHT SECTION: Grouped Time, Greetings, and Floating Action Hub */}
      <div className="navbar-right" style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div className="time-greeting" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span className="current-date">{formattedDate}</span>
          <span className="greeting-text" style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>{greeting}</span>
        </div>

        {/* NOTIFICATION MAKER-CHECKER GATEWAY */}
        <div className="action-hub-menu" style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowHub(!showHub)} 
            style={{ 
              position: 'relative', 
              background: '#1a1a1a', 
              color: '#FFD230', 
              border: 'none', 
              padding: '10px 18px', 
              borderRadius: '10px', 
              cursor: 'pointer', 
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}
          >
            🔔 PR Actions
            {notifications.length > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '-6px', 
                right: '-6px', 
                background: '#ef4444', 
                color: '#fff', 
                borderRadius: '50%', 
                padding: '2px 7px', 
                fontSize: '0.75rem', 
                fontWeight: 800,
                border: '2px solid #fff'
              }}>
                {notifications.length}
              </span>
            )}
          </button>

          {showHub && (
            <div 
              className="notification-panel-card" 
              style={{ 
                position: 'absolute', 
                right: 0, 
                top: '50px', 
                width: '420px', 
                backgroundColor: '#fff', 
                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15), 0 10px 10px -5px rgba(0,0,0,0.04)', 
                borderRadius: '14px', 
                border: '1px solid #e2e8f0', 
                padding: '20px', 
                zIndex: 9999, 
                maxHeight: '480px', 
                overflowY: 'auto' 
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                  Pending Dataset Verifications
                </h4>
                <button 
                  onClick={getLatestNotifications}
                  disabled={isRefreshing}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isRefreshing ? 'Syncing...' : '🔄 Refresh'}
                </button>
              </div>
              
              {notifications.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '24px 0', margin: 0 }}>
                  ✓ All actions clear. No pending ledger validations.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {notifications.map(item => (
                    <div 
                      key={item.id} 
                      style={{ 
                        padding: '12px', 
                        backgroundColor: '#f8fafc', 
                        borderRadius: '10px', 
                        borderLeft: '4px solid #f59e0b',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                      }}
                    >
                      <p style={{ margin: '0 0 6px 0', fontSize: '0.85rem', fontWeight: 700, color: '#1e293b' }}>
                        PR #{item.id}: <span style={{ color: item.operation_type === 'DELETE' ? '#dc2626' : item.operation_type === 'UPDATE' ? '#2563eb' : '#16a34a' }}>{item.operation_type}</span> on {item.target_table}
                      </p>
                      
                      <blockquote style={{ margin: '0 0 10px 0', padding: '6px 10px', background: '#fff', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8rem', color: '#475569', fontStyle: 'italic' }}>
                        "{item.context_rationale || 'No justification reasoning submitted.'}"
                      </blockquote>
                      
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleActionDecision(item.id, 'rejected')} 
                          style={{ background: '#f1f5f9', color: '#dc2626', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleActionDecision(item.id, 'approved')} 
                          style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 700 }}
                        >
                          Approve Changes
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;