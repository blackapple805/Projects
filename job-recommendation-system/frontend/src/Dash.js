import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Line, Text } from '@react-three/drei';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import './Dash.css';

// Register necessary chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const CustomGrid = ({ size, divisions, position, rotation }) => {
  const grid = [];
  const step = size / divisions;

  for (let i = -size / 2; i <= size / 2; i += step) {
    grid.push(
      <Line key={`h-${i}`} points={[[-size / 2, 0, i], [size / 2, 0, i]]} color="gray" lineWidth={1} />,
      <Line key={`v-${i}`} points={[[i, 0, -size / 2], [i, 0, size / 2]]} color="gray" lineWidth={1} />
    );
  }

  return <group position={position} rotation={rotation}>{grid}</group>;
};

const Dash = () => {
  const data = [
    { label: 'January', value: 10 },
    { label: 'February', value: 18 },
    { label: 'March', value: 6 },
    { label: 'April', value: 10 },
    { label: 'May', value: 4 },
    { label: 'June', value: 7 },
    { label: 'July', value: 8 },
    { label: 'August', value: 15 },
    { label: 'September', value: 12 },
    { label: 'October', value: 9 },
    { label: 'November', value: 13 },
    { label: 'December', value: 5 },
  ];

  const maxValue = 20; // Cap the height of the bars
  const scaledData = data.map(item => ({ ...item, value: Math.min(item.value, maxValue) }));
  const colors = ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ac'];

  const barData = {
    labels: data.map(item => item.label),
    datasets: [{
      label: 'Applications',
      data: data.map(item => item.value),
      backgroundColor: colors,
    }],
  };

  const barOptions = {
    scales: {
      x: {
        ticks: {
          color: 'white', // Change X-axis labels to white
        },
      },
      y: {
        ticks: {
          color: 'white', // Change Y-axis labels to white
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: 'white', // Change legend text to white
        },
      },
    },
  };

  const doughnutData = {
    labels: ['Total Applications', 'Interviews Scheduled', 'Offers Received', 'Rejections'],
    datasets: [{
      label: 'My First Dataset',
      data: [45, 10, 3, 5],
      backgroundColor: ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2'],
      hoverOffset: 4,
    }],
  };

  const doughnutOptions = {
    plugins: {
      legend: {
        labels: {
          color: 'white', // Change legend text to white
        },
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
        <Canvas>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <OrbitControls />
          {/* Main bottom grid */}
          <CustomGrid size={20} divisions={20} position={[0, 0, 0]} rotation={[0, 0, 0]} />
          {/* Side grid 1 */}
          <CustomGrid size={20} divisions={10} position={[0, 10, -10]} rotation={[Math.PI / 2, 0, 0]} />
          {/* Side grid 2 */}
          <CustomGrid size={20} divisions={10} position={[10, 10, 0]} rotation={[0, 0, Math.PI / 2]} />
          {scaledData.map((item, index) => (
            <Box
              key={index}
              position={[index * 1.5 - 7.5, item.value / 2, -index * 1.5 + 7.5]}
              args={[1, item.value, 1]}
            >
              <meshStandardMaterial color={colors[index % colors.length]} />
            </Box>
          ))}
          {/* Month labels */}
          {data.map((item, index) => (
            <Text
              key={index}
              position={[index * 1.5 - 7.5, -1, 11]}
              rotation={[-Math.PI / 2, 0, Math.PI / 4]}
              fontSize={0.5}
              color="white"
            >
              {item.label}
            </Text>
          ))}
          {/* Number labels */}
          {Array.from({ length: 14 }, (_, i) => i * 5).map((value, index) => (
            <Text
              key={index}
              position={[-11, index * 1.5, -11]}
              rotation={[0, 0, 0]}
              fontSize={0.5}
              color="white"
            >
              {value}
            </Text>
          ))}
        </Canvas>
      </div>
      <div className="chart-container-2d">
        <Bar data={barData} options={barOptions} />
      </div>
      <div className="chart-container-2d">
        <Doughnut data={doughnutData} options={doughnutOptions} />
      </div>
    </div>
  );
};

export default Dash;
