// Dash.js
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Line } from '@react-three/drei';
import './Dash.css';

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
  ];

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
          {data.map((item, index) => (
            <Box
              key={index}
              position={[index * 2 - 5, item.value / 2, 0]}
              args={[1, item.value, 1]}
            >
              <meshStandardMaterial color={`hsl(${(index * 60) % 360}, 100%, 50%)`} />
            </Box>
          ))}
        </Canvas>
      </div>
    </div>
  );
};

export default Dash;
