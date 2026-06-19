import React from 'react';

const STATUS_TONE = { 'In Progress': 'amber', 'Completed': 'green', 'Pending': 'gray' };

const Tasks = () => {
  const tasks = [
    { title: 'Implement user authentication', description: 'Set up user authentication with JWT tokens.', status: 'In Progress', dueDate: 'Jul 1, 2024', assignees: ['Alice', 'Bob'] },
    { title: 'Create dashboard UI', description: 'Design and implement the dashboard user interface.', status: 'Completed', dueDate: 'Jun 15, 2024', assignees: ['Charlie', 'Dave'] },
    { title: 'Integrate payment gateway', description: 'Integrate Stripe payment gateway for transactions.', status: 'Pending', dueDate: 'Jul 10, 2024', assignees: ['Eve', 'Frank'] },
  ];

  return (
    <div>
      <div className="page-head">
        <h2>Tasks</h2>
        <p>Track everything that needs to get done.</p>
      </div>
      <div className="card-grid">
        {tasks.map((t, i) => (
          <article key={i} className="task-card ui-card">
            <div className="task-top">
              <h3>{t.title}</h3>
              <span className={`badge ${STATUS_TONE[t.status] || 'gray'}`}>{t.status}</span>
            </div>
            <p className="desc">{t.description}</p>
            <div className="task-foot">
              <span className="task-due"><i className="fas fa-calendar-day"></i> {t.dueDate}</span>
              <div className="task-assignees">
                {t.assignees.map((a, j) => <span key={j} className="pip" title={a}>{a[0]}</span>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
