// src/components/ActiveAdmins.jsx

import React, { useEffect, useState } from 'react';
import { authFetch } from '../utils/authFetch';

const ActiveAdmins = () => {

  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {

    try {

      setLoading(true);

      const res = await authFetch(
        '/api/dashboard/active-admins'
      );

      const payload =
        await res.json();

      if (payload.success) {

        // Deduplicate by admin_id
        // because one admin may
        // have multiple sessions

        const uniqueAdmins =
          Array.from(

            new Map(

              (payload.data || []).map(
                admin => [
                  admin.admin_id,
                  admin
                ]
              )

            ).values()

          );

        setAdmins(uniqueAdmins);

      }

    } catch (err) {

      console.error(
        'Active admin fetch failed:',
        err
      );

    } finally {

      setLoading(false);

    }
  };

  return (

    <div
      style={{
        background: '#fff',
        padding: '20px',
        borderRadius: '16px',
        marginTop: '24px'
      }}
    >

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '18px'
        }}
      >

        <h3
          style={{
            margin: 0,
            fontSize: '1.1rem',
            fontWeight: 700
          }}
        >
          Currently Active Admins ({admins.length})
        </h3>

        <button
          onClick={fetchAdmins}
          style={{
            border: 'none',
            background: '#f1f5f9',
            padding: '8px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Refresh
        </button>

      </div>

      {loading ? (

        <div
          style={{
            color: '#64748b',
            padding: '20px'
          }}
        >
          Loading active sessions...
        </div>

      ) : admins.length === 0 ? (

        <div
          style={{
            color: '#94a3b8',
            padding: '20px',
            textAlign: 'center'
          }}
        >
          No active administrator sessions.
        </div>

      ) : (

        admins.map(admin => (

          <div
            key={admin.admin_id || admin.id}
            style={{
              padding: '14px 12px',
              borderBottom:
                '1px solid #f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >

            {/* ADMIN NAME */}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >

              <div
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#22c55e'
                }}
              />

              <span
                style={{
                  fontWeight: 700,
                  color: '#0f172a'
                }}
              >
                {admin.username ||
                  'Administrator'}
              </span>

            </div>

            {/* LOCATION */}

            <div
              style={{
                color: '#64748b',
                fontSize: '0.85rem',
                marginLeft: '20px'
              }}
            >
              📍
              {' '}
              {admin.city_name || 'Unknown City'}
              ,
              {' '}
              {admin.country_code || 'N/A'}
            </div>

            {/* LAST ACTIVE */}

            <div
              style={{
                color: '#94a3b8',
                fontSize: '0.75rem',
                marginLeft: '20px'
              }}
            >
              Last Seen:
              {' '}
              {admin.last_seen_at
                ? new Date(
                    admin.last_seen_at
                  ).toLocaleString()
                : 'Unavailable'}
            </div>

            {/* LOGIN TIME */}

            <div
              style={{
                color: '#94a3b8',
                fontSize: '0.75rem',
                marginLeft: '20px'
              }}
            >
              Login Time:
              {' '}
              {admin.login_at
                ? new Date(
                    admin.login_at
                  ).toLocaleString()
                : 'Unavailable'}
            </div>

          </div>

        ))

      )}

    </div>

  );
};

export default ActiveAdmins;