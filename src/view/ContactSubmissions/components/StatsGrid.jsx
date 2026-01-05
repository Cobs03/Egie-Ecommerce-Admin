import React from 'react';
import StatCard from './StatCard';

const StatsGrid = ({ stats }) => {
  if (!stats) return null;

  const statsConfig = [
    { value: stats.total, label: 'Total', color: '#2196f3' },
    { value: stats.new, label: 'New', color: '#10b981' },
    { value: stats.read, label: 'Read', color: '#2196f3' },
    { value: stats.replied, label: 'Replied', color: '#9c27b0' },
    { value: stats.archived, label: 'Archived', color: '#757575' },
    { value: stats.today, label: 'Today', color: '#f59e0b' },
    { value: stats.thisWeek, label: 'This Week', color: '#6366f1' },
  ];

  return (
    <div className="stats-grid">
      {statsConfig.map((stat, index) => (
        <StatCard
          key={index}
          value={stat.value}
          label={stat.label}
          color={stat.color}
        />
      ))}
    </div>
  );
};

export default StatsGrid;
