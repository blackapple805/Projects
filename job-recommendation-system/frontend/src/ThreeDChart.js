// src/ThreeDChart.js
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, GridHelper } from '@react-three/drei';

const Bar = ({ position, args, color }) => (
  <mesh position={position}>
    <boxGeometry args={args} />
    <meshStandardMaterial color={color} />
  </mesh>
);

const ThreeDChart = () => {
  const data = [10, 18, 6, 10, 4, 7]; // Example data
  const colors = ['#8A2BE2', '#5F9EA0', '#7FFF00', '#D2691E', '#FF7F50', '#6495ED'];

  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <OrbitControls />
      <GridHelper args={[10, 10]} position={[0, 0, 0]} />
      {data.map((value, index) => (
        <Bar
          key={index}
          position={[index * 2 - 5, value / 2, 0]}
          args={[1, value, 1]}
          color={colors[index % colors.length]}
        />
      ))}
    </Canvas>
  );
};

export default ThreeDChart;
