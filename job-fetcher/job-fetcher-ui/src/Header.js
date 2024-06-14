import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (query || showDropdown) {
      setSuggestions([
        `Job in ${query}`,
        `Company ${query}`,
        `Location ${query}`
      ]);
    } else {
      setSuggestions([]);
    }
  }, [query, showDropdown]);

  const handleSearch = () => {
    onSearch(query);
    setQuery(''); // Clear the input field
    setShowDropdown(false);
  };

  return (
    <div className="header">
      <h1>Job Fetcher</h1>
      <div className="search-container">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search for jobs, companies, locations..."
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">Search</button>
        {showDropdown && (
          <div className="search-dropdown">
            {suggestions.map((suggestion, index) => (
              <div 
                key={index} 
                className="search-suggestion"
                onClick={() => {
                  setQuery(suggestion);
                  handleSearch();
                }}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
