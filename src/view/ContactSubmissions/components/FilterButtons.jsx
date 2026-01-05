import React from 'react';

const FilterButtons = ({ filter, setFilter }) => {
  const statuses = ["all", "new", "read", "replied", "archived"];

  return (
    <div className="filter-buttons">
      {statuses.map((status) => (
        <button
          key={status}
          onClick={() => setFilter(status)}
          className={`filter-button ${filter === status ? "active" : ""}`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default FilterButtons;
