import React from 'react';

const ChartSkeleton = ({ height = 300 }) => {
  return (
    <div className="glass-card" style={{ height, display: 'flex', flexDirection: 'column' }}>
      <div className="skeleton-box" style={{ height: 20, width: 150, marginBottom: 20 }} />
      <div className="skeleton-box" style={{ flex: 1, width: '100%' }} />
    </div>
  );
};

export default ChartSkeleton;
