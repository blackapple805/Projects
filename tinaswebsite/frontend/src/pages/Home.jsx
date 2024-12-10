import React from 'react';
import './Home.css'; 
import heroImage1 from '../assets/hero-image-1.jpg';
import heroImage2 from '../assets/hero-image-2.jpg';
import heroImage3 from '../assets/hero-image-3.jpg';

export default function Home() {
  return (
    <div className="home-container text-white relative">
      <h1 className="home-heading text-4xl md:text-5xl font-bold mb-4">Welcome to the Fashion Site</h1>
      <p className="home-text text-lg md:text-xl text-gray-300">
        Discover our latest collections and products!
      </p>

      <div className="relative mt-8 overflow-hidden">
        {/* Left gradient fade */}
        <div className="pointer-events-none absolute top-0 left-0 h-full w-16 bg-gradient-to-r from-[#242424] to-transparent z-10" />
        {/* Right gradient fade */}
        <div className="pointer-events-none absolute top-0 right-0 h-full w-16 bg-gradient-to-l from-[#242424] to-transparent z-10" />

        <div className="flex space-x-8 overflow-x-auto snap-x snap-mandatory scrollbar-none px-4 py-2 items-center justify-center">
          <img 
            src={heroImage1} 
            alt="Fashion Look 1" 
            className="h-auto w-[300px] flex-shrink-0 snap-start rounded-lg object-cover transition-transform duration-300 hover:scale-105" 
          />
          <img 
            src={heroImage2} 
            alt="Fashion Look 2" 
            className="h-auto w-[300px] flex-shrink-0 snap-start rounded-lg object-cover transition-transform duration-300 hover:scale-105" 
          />
          <img 
            src={heroImage3} 
            alt="Fashion Look 3" 
            className="h-auto w-[300px] flex-shrink-0 snap-start rounded-lg object-cover transition-transform duration-300 hover:scale-105" 
          />
        </div>
      </div>
    </div>
  );
}
