// frontend/src/components/HeroSection.jsx
import React, { useState, useEffect } from 'react';
import heroImage1 from '../assets/hero-image-1.jpg';
import heroImage2 from '../assets/hero-image-2.jpg';
import heroImage3 from '../assets/hero-image-3.jpg';

export default function HeroSection() {
  const images = [heroImage1, heroImage2, heroImage3];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images]);

  return (
    <div className="relative h-[80vh] overflow-hidden">
      <div
        className="w-full h-full absolute top-0 left-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ backgroundImage: `url(${images[currentIndex]})` }}
      />
      {/* Overlay and its contents have been completely removed */}
    </div>
  );
}
