import React from 'react';
import './App.css';
import JobList from './JobList';
import Header from './Header';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <div className="App">
      <Header />
      <div className="container">
        <JobList />
      </div>
    </div>
  );
}

export default App;
