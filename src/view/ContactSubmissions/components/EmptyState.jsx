import React from 'react';
import { Mail } from 'lucide-react';

const EmptyState = ({ searchTerm }) => {
  return (
    <div className="empty-state">
      <Mail size={60} />
      <h3>No submissions found</h3>
      <p>
        {searchTerm
          ? "Try adjusting your search"
          : "No contact form submissions yet"}
      </p>
    </div>
  );
};

export default EmptyState;
