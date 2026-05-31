// src/components/Navbar.jsx

import React, { useState, useEffect } from 'react';
import '../assets/css/sidebar.css';

const Navbar = ({ title }) => {

  const now = new Date();
  const hours = now.getHours();

  const [notifications, setNotifications] = useState([]);
  const [showHub, setShowHub] = useState(false);
  const [loading, setLoading] = useState(false);

  const dateOptions = {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  };

  const formattedDate = now.toLocaleDateString(
    'en-US',
    dateOptions
  );

  useEffect(() => {

    fetchNotifications();

    const interval = setInterval(
      fetchNotifications,
      10000
    );

    return () => clearInterval(interval);

  }, []);

  const fetchNotifications = async () => {

    setLoading(true);

    try {

      const token =
        localStorage.getItem('sb-access-token');

      if (!token) return;

      const res = await fetch(
        '/api/dashboard/security',
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const payload = await res.json();

      if (payload.success) {

        const unresolved =
          payload.data.anomalies.filter(
            item => !item.is_resolved
          );

        setNotifications(unresolved);

      }

    } catch (err) {

      console.error(
        'Notification fetch error:',
        err
      );

    } finally {
      setLoading(false);
    }
  };

  let greeting = 'Good Evening!';

  if (hours < 12) {
    greeting = 'Good Morning!';
  } else if (hours < 18) {
    greeting = 'Good Afternoon!';
  }

  return (

    <nav
      className="navbar-container"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}
    >

      <div className="navbar-left">
        <h1 className="nav-page-title">
          {title}
        </h1>
      </div>

      <div
        className="navbar-right"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}
      >

        <div
          className="time-greeting"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end'
          }}
        >

          <span className="current-date">
            {formattedDate}
          </span>

          <span
            style={{
              fontSize: '0.85rem',
              color: '#64748b'
            }}
          >
            {greeting}
          </span>

        </div>

        {/* SECURITY NOTIFICATION HUB */}

        <div style={{ position: 'relative' }}>

          <button
            onClick={() => setShowHub(!showHub)}
            style={{
              position: 'relative',
              background: '#1a1a1a',
              color: '#FFD230',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              cursor: 'pointer'
            }}
          >

            🔔

            {notifications.length > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  background: '#ef4444',
                  color: '#fff',
                  borderRadius: '50%',
                  padding: '2px 7px',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}
              >
                {notifications.length}
              </span>
            )}

          </button>

          {showHub && (

            <div
              style={{
                position: 'absolute',
                top: '52px',
                right: 0,
                width: '420px',
                background: '#fff',
                borderRadius: '14px',
                padding: '18px',
                zIndex: 9999,
                boxShadow:
                  '0 20px 25px -5px rgba(0,0,0,0.15)',
                maxHeight: '500px',
                overflowY: 'auto'
              }}
            >

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '16px'
                }}
              >

                <h4
                  style={{
                    margin: 0,
                    fontWeight: 800
                  }}
                >
                  Security Threat Center
                </h4>

                <button
                  onClick={fetchNotifications}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'Syncing...' : '🔄'}
                </button>

              </div>

              {notifications.length === 0 ? (

                <div
                  style={{
                    color: '#94a3b8',
                    textAlign: 'center',
                    padding: '24px'
                  }}
                >
                  ✓ No active security threats.
                </div>

              ) : (

                notifications.map(item => (

                  <div
                    key={item.id}
                    style={{
                      background: '#f8fafc',
                      borderLeft:
                        item.severity === 'CRITICAL'
                          ? '4px solid #ef4444'
                          : '4px solid #f59e0b',
                      padding: '12px',
                      borderRadius: '10px',
                      marginBottom: '12px'
                    }}
                  >

                    <div
                      style={{
                        fontWeight: 800,
                        marginBottom: '6px'
                      }}
                    >
                      {item.rule_violated}
                    </div>

                    <div
                      style={{
                        color: '#475569',
                        fontSize: '0.85rem',
                        marginBottom: '8px'
                      }}
                    >
                      {item.description}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between'
                      }}
                    >

                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: '#64748b'
                        }}
                      >
                        {new Date(
                          item.created_at
                        ).toLocaleString()}
                      </span>

                      <span
                        style={{
                          fontWeight: 700,
                          color:
                            item.severity === 'CRITICAL'
                              ? '#ef4444'
                              : '#f59e0b'
                        }}
                      >
                        {item.severity}
                      </span>

                    </div>

                  </div>

                ))

              )}

            </div>

          )}

        </div>

      </div>

    </nav>
  );
};

export default Navbar;