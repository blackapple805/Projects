import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'aos/dist/aos.css';
import AOS from 'aos';
import Home from './pages/Home'; 
import Products from './pages/Products'; 
import Register from './pages/Register'; 
import Header from './components/Header';
// Footer import removed
// import Footer from './components/Footer';

AOS.init({ duration: 800 });

function App() {
  return (
    <Router>
      {/* Removed dark backgrounds, using white instead */}
      <div className="flex flex-col min-h-screen bg-white text-black relative">
        <Header />
        {/* If you want the white background behind everything, no dark backgrounds here */}
        <main className="flex-grow p-4 pt-20 pb-20 bg-white"> 
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        {/* Footer removed */}
        {/* <Footer /> */}
      </div>
    </Router>
  );
}

export default App;


