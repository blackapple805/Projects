import React from 'react';
import './Tasks.css';

const Tasks = () => {
  const tasks = [
    {
      title: 'Implement User Authentication',
      description: 'Set up user authentication with JWT tokens.',
      status: 'In Progress',
      dueDate: '2024-07-01',
      assignees: ['Alice', 'Bob'],
    },
    {
      title: 'Create Dashboard UI',
      description: 'Design and implement the dashboard user interface.',
      status: 'Completed',
      dueDate: '2024-06-15',
      assignees: ['Charlie', 'Dave'],
    },
    {
      title: 'Integrate Payment Gateway',
      description: 'Integrate Stripe payment gateway for transactions.',
      status: 'Pending',
      dueDate: '2024-07-10',
      assignees: ['Eve', 'Frank'],
    },
    // Add more tasks here if needed
  ];

  return (
    <div className="tasks-container">
      <h2>Tasks</h2>
      <div className="tasks-list">
        {tasks.map((task, index) => (
          <div className="task-card" key={index}>
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p><strong>Status:</strong> {task.status}</p>
            <p><strong>Due Date:</strong> {task.dueDate}</p>
            <p><strong>Assignees:</strong> {task.assignees.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
