import React from 'react';
import './Users.css';

const Users = () => {
  const users = [
    {
      name: 'Alice Johnson',
      role: 'Admin',
      status: 'Active',
      icon: 'fas fa-user-shield'
    },
    {
      name: 'Bob Smith',
      role: 'Developer',
      status: 'Inactive',
      icon: 'fas fa-code'
    },
    {
      name: 'Charlie Brown',
      role: 'Designer',
      status: 'Active',
      icon: 'fas fa-paint-brush'
    }
  ];

  return (
    <div className="users-container">
      <h2>Users</h2>
      <div className="users-list">
        {users.map((user, index) => (
          <div key={index} className="user-card">
            <div className="user-header">
              <h3>{user.name}</h3>
              <i className={user.icon}></i>
            </div>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Status:</strong> {user.status} <span className={`status-dot ${user.status === 'Active' ? 'active' : 'inactive'}`}></span></p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;
