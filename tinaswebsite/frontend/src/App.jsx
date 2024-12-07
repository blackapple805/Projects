// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'aos/dist/aos.css';
import AOS from 'aos';
import Home from './pages/Home'; 
import Products from './pages/Products'; 
import Register from './pages/Register'; 
import Header from './components/Header';
import Footer from './components/Footer';

AOS.init({ duration: 800 });

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-900 text-white relative">
        <Header />
        <main className="flex-grow p-4 pt-20 pb-20">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
