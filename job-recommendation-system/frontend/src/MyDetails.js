import React from 'react';

function MyDetails({ userEmail }) {
  return (
    <div>
      <h2>My Details</h2>
      <div className="details-content">
        <div className="details-section">
          <h3>Personal Information</h3>
          <p><strong>Name:</strong> Eric Del Angel</p>
          <p><strong>Email:</strong> {userEmail}</p>
          <p><strong>Phone:</strong> (123) 456-7890</p>
        </div>
        <div className="details-section">
          <h3>Job Preferences</h3>
          <p><strong>Desired Position:</strong> Software Engineer</p>
          <p><strong>Preferred Location:</strong> San Francisco, CA</p>
          <p><strong>Experience Level:</strong> Mid Level</p>
          <p><strong>Preferred Companies:</strong> Google, Amazon, Facebook</p>
        </div>
        <div className="details-section bio-section">
          <h3>Bio</h3>
          <p>Eric is a passionate software engineer with over 5 years of experience in developing scalable web applications. He is skilled in JavaScript, React, and Node.js. In his free time, Eric enjoys contributing to open-source projects and exploring new technologies.</p>
        </div>
      </div>
    </div>
  );
}

export default MyDetails;
