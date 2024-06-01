import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Dashboard({ onLogout }) {
  const location = useLocation();
  const email = location.state ? location.state.email : 'User';
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div>
      <h1>Welcome, {email}!</h1>
      <p>Congratulations on successfully logging in!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Dashboard;
