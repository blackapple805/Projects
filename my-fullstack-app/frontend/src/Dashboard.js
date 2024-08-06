import React from 'react';

function Dashboard({ user }) {
  return (
    <div>
      <h2>Welcome to the Dashboard, {user.email}!</h2>
      {/* Add more user-specific content here */}
    </div>
  );
}

export default Dashboard;
