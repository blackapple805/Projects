import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS

// Login is disabled — the app goes straight to the dashboard.
function App() {
  return (
    <Router>
      <Routes>
        {/* Everything lands on the dashboard. */}
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
