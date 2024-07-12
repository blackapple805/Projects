import React from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import './Reporting.css';

// Register necessary chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

const Reporting = () => {
  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Sales',
        data: [65, 59, 80, 81, 56, 55],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Expenses',
        data: [28, 48, 40, 19, 86, 27],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };

  const lineData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    datasets: [
      {
        label: 'Revenue',
        data: [150, 200, 180, 220, 170, 250],
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
      },
    ],
  };

  const doughnutData = {
    labels: ['Sales', 'Expenses', 'Net Profit'],
    datasets: [
      {
        data: [120000, 45000, 75000],
        backgroundColor: ['rgba(75, 192, 192, 0.6)', 'rgba(255, 99, 132, 0.6)', 'rgba(153, 102, 255, 0.6)'],
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        labels: {
          color: 'white',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white',
        },
      },
      y: {
        ticks: {
          color: 'white',
        },
      },
    },
  };

  return (
    <div className="reporting-container">
      <h2>Reporting</h2>
      <div className="metrics-container">
        <div className="metric-card-3d">
          <div className="card-3d">
            <div className="content-box-3d">
              <h3>Total Sales</h3>
              <p>$120,000</p>
            </div>
          </div>
        </div>
        <div className="metric-card-3d">
          <div className="card-3d">
            <div className="content-box-3d">
              <h3>Total Expenses</h3>
              <p>$45,000</p>
            </div>
          </div>
        </div>
        <div className="metric-card-3d">
          <div className="card-3d">
            <div className="content-box-3d">
              <h3>Net Profit</h3>
              <p>$75,000</p>
            </div>
          </div>
        </div>
      </div>
      <div className="chart-container-3d">
        <div className="chart-3d">
          <div className="chart-content-3d">
            <Bar data={data} options={options} />
          </div>
        </div>
      </div>
      <div className="chart-container-3d">
        <div className="chart-3d">
          <div className="chart-content-3d">
            <Line data={lineData} options={options} />
          </div>
        </div>
      </div>
      <div className="chart-container-3d">
        <div className="chart-3d">
          <div className="chart-content-3d">
            <Doughnut data={doughnutData} options={options} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reporting;
