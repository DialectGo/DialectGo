import React from 'react';

const CardSkeleton = () => {
  return (
    <div className="stat-card" style={{ borderColor: 'transparent', boxShadow: 'none' }}>
      <div className="stat-icon skeleton-box" style={{ background: 'var(--bg-glass)' }} />
      <div style={{ flex: 1 }}>
        <div className="skeleton-box" style={{ height: 12, width: '60%', marginBottom: 8 }} />
        <div className="skeleton-box" style={{ height: 24, width: '40%' }} />
      </div>
    </div>
  );
};

export default CardSkeleton;
