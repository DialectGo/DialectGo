import React, { useEffect, useState } from 'react';
import { authService } from '../services/authService';

const ADMINS_PER_PAGE = 5;

const ActiveAdmins = () => {
  const [admins, setAdmins]           = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchAdmins();
    const interval = setInterval(fetchAdmins, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchAdmins = async () => {
    try {
      const token = authService.getToken();
      if (!token) return;

      const res = await fetch('/api/admin/active-sessions', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.warn('Active sessions fetch failed:', res.status);
        return;
      }

      const payload = await res.json();
      if (payload.success) {
        setAdmins(payload.data);
        // If current page no longer exists after a refresh, reset to last valid page
        setCurrentPage((prev) => {
          const newTotalPages = Math.ceil(payload.data.length / ADMINS_PER_PAGE);
          return prev > newTotalPages ? Math.max(1, newTotalPages) : prev;
        });
      }
    } catch (err) {
      console.error('ActiveAdmins fetch error:', err);
    }
  };

  // Pagination math
  const totalPages      = Math.ceil(admins.length / ADMINS_PER_PAGE);
  const indexOfFirst    = (currentPage - 1) * ADMINS_PER_PAGE;
  const indexOfLast     = indexOfFirst + ADMINS_PER_PAGE;
  const currentAdmins   = admins.slice(indexOfFirst, indexOfLast);

  const goToPrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));


  // Shows: 1 ... [prev] [current] [next] ... last — max ~5 buttons visible
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    const addPage = (p) => { if (!pages.includes(p)) pages.push(p); };
    addPage(1);
    if (currentPage - 2 > 2) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) addPage(i);
    if (currentPage + 2 < totalPages - 1) pages.push('...');
    addPage(totalPages);
    return pages;
  };
  return (
    <div style={{
      marginTop: '24px',
      borderTop: '2px solid #f1f5f9',
      paddingTop: '20px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
      }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Currently Active Admins
          </h3>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0' }}>
            Live sessions · refreshes every 10s
          </p>
        </div>

        {/* Online indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            backgroundColor: '#22c55e',
            boxShadow: '0 0 0 3px rgba(34,197,94,0.2)',
            display: 'inline-block',
          }} />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#22c55e' }}>
            {admins.length} online
          </span>
        </div>
      </div>

      {/* Admin list */}
      {admins.length === 0 ? (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          color: '#94a3b8',
          fontSize: '0.875rem',
          backgroundColor: '#f8fafc',
          borderRadius: '10px',
          border: '1px dashed #e2e8f0',
        }}>
          No active admin sessions.
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentAdmins.map((admin) => (
              <div
                key={admin.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  borderRadius: '10px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    backgroundColor: '#1a1a1a',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#FFD230', fontWeight: 800, fontSize: '0.85rem',
                    flexShrink: 0,
                  }}>
                    {(admin.username || '?')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>
                      {admin.username}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {admin.city_name}, {admin.country_code}
                    </div>
                  </div>
                </div>

                {/* Live badge */}
                <span style={{
                  fontSize: '0.7rem', fontWeight: 700,
                  color: '#16a34a', backgroundColor: '#dcfce7',
                  padding: '3px 8px', borderRadius: '20px',
                  letterSpacing: '0.05em',
                }}>
                  LIVE
                </span>
              </div>
            ))}
          </div>

          {/* Pagination — only rendered when needed */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '1px solid #f1f5f9',
            }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {indexOfFirst + 1}–{Math.min(indexOfLast, admins.length)} of {admins.length}
              </span>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={goToPrev}
                  disabled={currentPage === 1}
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    backgroundColor: '#fff',
                    color: '#334155',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    opacity: currentPage === 1 ? 0.4 : 1,
                  }}
                >
                  Prev
                </button>

                {getPageNumbers().map((page, i) => (
                  <button
                    key={i}
                    disabled={page === '...'}
                    onClick={() => page !== '...' && setCurrentPage(page)}
                    style={{
                      padding: '5px 10px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      backgroundColor: currentPage === page ? '#1a1a1a' : '#fff',
                      color: currentPage === page ? '#FFD230' : '#334155',
                      cursor: page === '...' ? 'default' : 'pointer',
                      minWidth: '32px',
                    }}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={goToNext}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '5px 12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    backgroundColor: '#fff',
                    color: '#334155',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    opacity: currentPage === totalPages ? 0.4 : 1,
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ActiveAdmins;