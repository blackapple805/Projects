import React from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const VIOLET = '#4f46e5';
const PLASMA = '#f59e0b';
const ORCHID = '#fb7185';
const CYAN = '#fbbf24';
const TEXT_SOFT = '#c3c8e0';
const TEXT_DIM = '#9197b8';
const GRID = 'rgba(165, 180, 252, 0.10)';

const baseScales = {
  x: { grid: { display: false }, border: { display: false }, ticks: { color: TEXT_DIM, font: { size: 11 } } },
  y: { grid: { color: GRID }, border: { display: false }, ticks: { color: TEXT_DIM, font: { size: 11 } } },
};
const tooltip = {
  backgroundColor: 'rgba(16, 20, 45, 0.96)', borderColor: 'rgba(165,180,252,0.3)', borderWidth: 1,
  titleColor: '#eef1fb', bodyColor: TEXT_SOFT, padding: 12, cornerRadius: 10,
};

const Reporting = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  const barData = {
    labels: months,
    datasets: [
      { label: 'Sales', data: [65, 59, 80, 81, 56, 55], backgroundColor: VIOLET, borderRadius: 6, maxBarThickness: 28 },
      { label: 'Expenses', data: [28, 48, 40, 19, 86, 27], backgroundColor: PLASMA, borderRadius: 6, maxBarThickness: 28 },
    ],
  };

  const lineData = {
    labels: months,
    datasets: [{
      label: 'Revenue', data: [150, 200, 180, 220, 170, 250],
      borderColor: CYAN, backgroundColor: 'rgba(245, 158, 11, 0.14)',
      fill: true, tension: 0.4, pointBackgroundColor: CYAN, pointRadius: 4,
    }],
  };

  const doughnutData = {
    labels: ['Sales', 'Expenses', 'Net Profit'],
    datasets: [{
      data: [120000, 45000, 75000],
      backgroundColor: [VIOLET, PLASMA, ORCHID],
      borderColor: 'rgba(12,5,24,0.4)', borderWidth: 3, hoverOffset: 8,
    }],
  };

  const barOptions = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 800 },
    plugins: { legend: { labels: { color: TEXT_SOFT, usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 12 } } }, tooltip },
    scales: baseScales,
  };
  const lineOptions = { ...barOptions, plugins: { ...barOptions.plugins, legend: { display: false } } };
  const doughnutOptions = {
    responsive: true, maintainAspectRatio: false, cutout: '65%', animation: { animateRotate: true, duration: 800 },
    plugins: { legend: { position: 'bottom', labels: { color: TEXT_SOFT, usePointStyle: true, pointStyle: 'circle', padding: 16, font: { size: 12 } } }, tooltip },
  };

  return (
    <div>
      <div className="page-head">
        <h2>Reporting</h2>
        <p>Performance at a glance.</p>
      </div>

      <div className="report-stats">
        <div className="report-stat ui-card">
          <span className="lbl">Total Sales</span>
          <div className="val up">$120,000</div>
        </div>
        <div className="report-stat ui-card">
          <span className="lbl">Total Expenses</span>
          <div className="val down">$45,000</div>
        </div>
        <div className="report-stat ui-card">
          <span className="lbl">Net Profit</span>
          <div className="val">$75,000</div>
        </div>
      </div>

      <div className="report-charts">
        <div className="report-chart ui-card full">
          <h3>Sales vs expenses</h3>
          <div className="chart-body"><Bar data={barData} options={barOptions} /></div>
        </div>
        <div className="report-chart ui-card">
          <h3>Revenue trend</h3>
          <div className="chart-body"><Line data={lineData} options={lineOptions} /></div>
        </div>
        <div className="report-chart ui-card">
          <h3>Profit breakdown</h3>
          <div className="chart-body"><Doughnut data={doughnutData} options={doughnutOptions} /></div>
        </div>
      </div>
    </div>
  );
};

export default Reporting;
