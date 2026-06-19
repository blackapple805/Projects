import React from 'react';

const STATUS_TONE = { 'In Progress': 'amber', 'Completed': 'green', 'Not Started': 'gray' };

const Projects = () => {
  const projects = [
    { name: 'Alpha', description: 'AI-driven chatbot to enhance customer service for an e-commerce platform.', status: 'In Progress', team: ['Alice', 'Bob', 'Charlie'] },
    { name: 'Beta', description: 'Mobile app to track fitness activities and provide personalized workout plans.', status: 'Completed', team: ['Dave', 'Eve', 'Frank'] },
    { name: 'Gamma', description: 'Blockchain-based system for secure, transparent supply chain management.', status: 'Not Started', team: ['Grace', 'Heidi', 'Ivan'] },
  ];

  return (
    <div>
      <div className="page-head">
        <h2>Projects</h2>
        <p>What your team is building right now.</p>
      </div>
      <div className="card-grid">
        {projects.map((p, i) => (
          <article key={i} className="project-card ui-card">
            <div className="project-top">
              <h3>{p.name}</h3>
              <span className={`badge ${STATUS_TONE[p.status] || 'gray'}`}>{p.status}</span>
            </div>
            <p>{p.description}</p>
            <div className="project-members">
              <div className="stack">
                {p.team.map((m, j) => <span key={j} className="pip" title={m}>{m[0]}</span>)}
              </div>
              <span className="count">{p.team.length} members</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Projects;
