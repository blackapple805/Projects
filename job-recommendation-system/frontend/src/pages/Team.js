import React from 'react';

const members = [
  { name: 'John Doe', role: 'Software Engineer', icon: 'fa-code' },
  { name: 'Jane Smith', role: 'Product Manager', icon: 'fa-compass-drafting' },
  { name: 'Maria Garcia', role: 'Designer', icon: 'fa-pen-nib' },
  { name: 'Sam Lee', role: 'Data Analyst', icon: 'fa-chart-simple' },
];

function Team() {
  return (
    <div>
      <div className="page-head">
        <h2>Our team</h2>
        <p>Meet the people who make this happen.</p>
      </div>
      <div className="card-grid">
        {members.map((m, i) => (
          <div key={i} className="member-card ui-card">
            <span className="member-avatar"><i className={`fas ${m.icon}`}></i></span>
            <div className="info">
              <h3>{m.name}</h3>
              <span>{m.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Team;
