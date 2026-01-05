import React from 'react';
import { Search } from 'lucide-react';

const SearchBox = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="search-box">
      <Search className="search-icon" size={20} />
      <input
        type="text"
        placeholder="Search by name, email, or message..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
    </div>
  );
};

export default SearchBox;
