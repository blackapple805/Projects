import React, { useState } from 'react';
import './App.css';
import JobList from './JobList';
import Header from './Header';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="App">
      <Header onSearch={handleSearch} />
      <div className="container">
        <JobList searchQuery={searchQuery} />
      </div>
    </div>
  );
}

export default App;
