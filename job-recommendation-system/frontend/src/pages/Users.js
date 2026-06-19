import React from 'react';

const users = [
  { name: 'Alice Johnson', role: 'Admin', status: 'Active', icon: 'fa-user-shield' },
  { name: 'Bob Smith', role: 'Developer', status: 'Inactive', icon: 'fa-code' },
  { name: 'Charlie Brown', role: 'Designer', status: 'Active', icon: 'fa-pen-nib' },
];

const Users = () => (
  <div>
    <div className="page-head">
      <h2>Users</h2>
      <p>Everyone with access to this workspace.</p>
    </div>
    <div className="card-grid">
      {users.map((u, i) => (
        <div key={i} className="member-card ui-card">
          <span className="member-avatar"><i className={`fas ${u.icon}`}></i></span>
          <div className="info">
            <h3>{u.name}</h3>
            <span>{u.role}</span>
            <span className={`badge ${u.status === 'Active' ? 'green' : 'gray'}`}>{u.status}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default Users;
