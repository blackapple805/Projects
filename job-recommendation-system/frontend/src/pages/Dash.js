import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// Theme colors pulled from the CSS variables so charts match the rest of the UI.
const VIOLET = '#4f46e5';
const PLASMA = '#f59e0b';
const ORCHID = '#fb7185';
const CYAN = '#fbbf24';
const TEXT_SOFT = '#c3c8e0';
const TEXT_DIM = '#9197b8';
const GRID_LINE = 'rgba(165, 180, 252, 0.10)';

const STATS = [
  { icon: 'fa-clipboard-list', value: 45, label: 'Total Applications', tone: 'violet' },
  { icon: 'fa-calendar-check', value: 10, label: 'Interviews Scheduled', tone: 'cyan' },
  { icon: 'fa-envelope-open-text', value: 3, label: 'Offers Received', tone: 'plasma' },
  { icon: 'fa-circle-xmark', value: 5, label: 'Rejections', tone: 'dim' },
];

const Dash = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const applications = [10, 18, 6, 10, 4, 7, 8, 15, 12, 9, 13, 5];

  // Build a vertical gradient fill for the bars (created lazily from the canvas context).
  const barData = {
    labels: months,
    datasets: [
      {
        label: 'Applications',
        data: applications,
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 38,
        backgroundColor: (ctx) => {
          const { chart } = ctx;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return VIOLET;
          const g = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          g.addColorStop(0, 'rgba(124, 58, 237, 0.55)');
          g.addColorStop(1, PLASMA);
          return g;
        },
        hoverBackgroundColor: PLASMA,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 900, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(16, 20, 45, 0.96)',
        borderColor: 'rgba(216, 180, 254, 0.3)',
        borderWidth: 1,
        titleColor: '#eef1fb',
        bodyColor: TEXT_SOFT,
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: TEXT_DIM, font: { size: 12 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: GRID_LINE },
        border: { display: false },
        ticks: { color: TEXT_DIM, font: { size: 12 }, stepSize: 5 },
      },
    },
  };

  const doughnutData = {
    labels: ['Applications', 'Interviews', 'Offers', 'Rejections'],
    datasets: [
      {
        data: [45, 10, 3, 5],
        backgroundColor: [VIOLET, CYAN, PLASMA, ORCHID],
        borderColor: 'rgba(12, 5, 24, 0.4)',
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    animation: { animateRotate: true, duration: 900 },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: TEXT_SOFT, padding: 16, usePointStyle: true, pointStyle: 'circle', font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: 'rgba(16, 20, 45, 0.96)',
        borderColor: 'rgba(216, 180, 254, 0.3)',
        borderWidth: 1,
        titleColor: '#eef1fb',
        bodyColor: TEXT_SOFT,
        padding: 12,
        cornerRadius: 10,
      },
    },
  };

  return (
    <div className="overview">
      <div className="overview-head">
        <h2>Your application overview</h2>
        <p>A snapshot of how your job search is going.</p>
      </div>

      <div className="stat-grid">
        {STATS.map((s) => (
          <div key={s.label} className={`stat-card glass tone-${s.tone}`}>
            <span className="stat-icon"><i className={`fas ${s.icon}`}></i></span>
            <div className="stat-body">
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="chart-row">
        <div className="chart-card glass chart-wide">
          <div className="chart-card-head">
            <h3>Applications by month</h3>
            <span className="chart-tag">2025</span>
          </div>
          <div className="chart-body">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>

        <div className="chart-card glass chart-narrow">
          <div className="chart-card-head">
            <h3>Status breakdown</h3>
          </div>
          <div className="chart-body">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dash;
