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
          <div key={index} className="user-card playing">
            <div className="user-wave"></div>
            <div className="user-wave"></div>
            <div className="user-wave"></div>
            <div className="user-infotop">
              <i className={`user-icon ${user.icon}`}></i><br />
              <span className="user-title">{user.role}</span>
              <div className="user-name">{user.name}</div>
              <p className="user-status"><strong>Status:</strong> {user.status} <span className={`user-status-dot ${user.status === 'Active' ? 'active' : 'inactive'}`}></span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;
