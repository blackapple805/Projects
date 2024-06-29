import React from 'react';
import { FaUser } from 'react-icons/fa';
import './Team.css';

function Team() {
  return (
    <div className="team-container">
      <h2>Our Team</h2>
      <p>Meet the amazing people who make our company great.</p>
      <div className="team-member">
        <FaUser className="team-icon" />
        <div className="team-member-content">
          <h3>John Doe</h3>
          <p>Software Engineer</p>
        </div>
      </div>
      <div className="team-member">
        <FaUser className="team-icon" />
        <div className="team-member-content">
          <h3>Jane Smith</h3>
          <p>Product Manager</p>
        </div>
      </div>
    </div>
  );
}

export default Team;
