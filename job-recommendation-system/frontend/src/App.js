import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Signup from './Signup';
import Login from './Login';
import Dashboard from './Dashboard';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route
            path="/dashboard/*"
            element={
              isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />
            }
          />
          <Route
            path="/"
            element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
