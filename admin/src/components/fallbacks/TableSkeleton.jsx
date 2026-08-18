import React from 'react';

const TableSkeleton = ({ columns = 6, rows = 5 }) => {
  return (
    <div className="glass-card" style={{ padding: 0 }}>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i}>
                  <div className="skeleton-box" style={{ height: 16, width: i === columns - 1 ? '40%' : '70%' }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex}>
                    <div 
                      className="skeleton-box" 
                      style={{ 
                        height: 20, 
                        width: colIndex === 0 ? '80%' : colIndex === columns - 1 ? '50%' : '60%' 
                      }} 
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableSkeleton;
