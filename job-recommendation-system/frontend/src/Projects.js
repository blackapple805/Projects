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
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <p><strong>Status:</strong> {project.status}</p>
            <p><strong>Team Members:</strong> {project.teamMembers.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
