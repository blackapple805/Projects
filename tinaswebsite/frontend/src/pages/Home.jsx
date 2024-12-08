// frontend/src/pages/Home.jsx
import React from 'react';
import './Home.css'; 
import heroImage1 from '../assets/hero-image-1.jpg';
import heroImage2 from '../assets/hero-image-2.jpg';
import heroImage3 from '../assets/hero-image-3.jpg';

export default function Home() {
  return (
    <div className="home-container">
      <h1 className="home-heading">Welcome to the Fashion Site</h1>
      <p className="home-text">Discover our latest collections and products!</p>
      
      {/* Display all three images stacked vertically */}
      <div className="mt-8 space-y-8">
        <img src={heroImage1} alt="Fashion Look 1" className="w-full h-auto" />
        <img src={heroImage2} alt="Fashion Look 2" className="w-full h-auto" />
        <img src={heroImage3} alt="Fashion Look 3" className="w-full h-auto" />
      </div>
    </div>
  );
}
