import React from 'react';
import './Projects.css';

const Projects = () => {
  const projectData = [
    {
      name: 'Alpha',
      description: 'Developing an AI-driven chatbot to enhance customer service interactions for an e-commerce platform.',
      status: 'In Progress',
      teamMembers: ['Alice', 'Bob', 'Charlie'],
    },
    {
      name: 'Beta',
      description: 'Creating a mobile app to track fitness activities and provide personalized workout plans.',
      status: 'Completed',
      teamMembers: ['Dave', 'Eve', 'Frank'],
    },
    {
      name: 'Gamma',
      description: 'Building a blockchain-based system for secure and transparent supply chain management.',
      status: 'Not Started',
      teamMembers: ['Grace', 'Heidi', 'Ivan'],
    },
  ];

  return (
    <div className="projects-container">
      <h2>Projects</h2>
      <div className="projects-list">
        {projectData.map((project, index) => (
          <div key={index} className="project-card">
            <div className="top-section">
              <div className="border"></div>
            </div>
            <div className="bottom-section">
              <span className="title">{project.name}</span>
              <div className="row">
                <div className="item">
                  <span className="big-text">{project.status}</span>
                  <span className="regular-text">Status</span>
                </div>
                <div className="item">
                  <span className="big-text">{project.teamMembers.length}</span>
                  <span className="regular-text">Team</span>
                </div>
                <div className="item">
                  <span className="big-text">{project.teamMembers.join(', ')}</span>
                  <span className="regular-text">Members</span>
                </div>
              </div>
              <p>{project.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
