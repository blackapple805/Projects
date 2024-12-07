// frontend/src/components/HeroSection.jsx
export default function HeroSection() {
    return (
      <div className="relative h-[80vh] bg-cover bg-center" style={{ backgroundImage: "url('https://your-image.jpg')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-center text-white p-4">
          <h1 className="text-5xl font-display font-bold mb-4">Discover Luxury</h1>
          <p className="text-lg mb-6 font-body">Indulge in handcrafted pieces and timeless style.</p>
          <a href="/products" className="bg-white text-black px-6 py-3 transition-transform transform hover:scale-105">Explore Collections</a>
        </div>
      </div>
    );
  }
  