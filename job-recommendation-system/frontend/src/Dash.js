import React from 'react';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import './Dashboard.css';

const Dash = () => {
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Job Applications',
        data: [10, 18, 6, 10, 4, 7],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="dash-container">
      <h2>Dash</h2>
      <div className="stats-container">
        <div className="stat-card">
          <h3>Total Applications</h3>
          <p>45</p>
        </div>
        <div className="stat-card">
          <h3>Interviews Scheduled</h3>
          <p>10</p>
        </div>
        <div className="stat-card">
          <h3>Offers Received</h3>
          <p>3</p>
        </div>
        <div className="stat-card">
          <h3>Rejections</h3>
          <p>5</p>
        </div>
      </div>
      <div className="chart-container">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default Dash;
