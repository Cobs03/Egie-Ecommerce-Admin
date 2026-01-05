import React from 'react';

const StatCard = ({ value, label, color }) => {
  return (
    <div
      className="stat-card"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="stat-value" style={{ color }}>
        {value}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

export default StatCard;
