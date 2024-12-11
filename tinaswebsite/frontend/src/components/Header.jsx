import React, { useState, useEffect } from 'react';
import { AiOutlineMenu, AiOutlineSearch, AiOutlineHeart, AiOutlineUser, AiOutlineShopping, AiOutlineClose } from 'react-icons/ai';
import './Header.css';

function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleSearch = () => setSearchOpen(prev => !prev);

  // Close search when pressing Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = e.target.search.value.trim();
    if (query) {
      console.log("Searching for:", query);
      // Implement your search logic here
    }
    setSearchOpen(false);
  };

  return (
    <>
      <header className={`header-container ${searchOpen ? 'search-active' : ''}`}>
        <div className="header-content">
          {/* Left Section: Menu and Search */}
          <div className="left-section flex items-center gap-4">
            <div 
              className="flex items-center gap-1 hover:text-gray-700 transition-colors cursor-pointer" 
              onClick={toggleSidebar}
            >
              <AiOutlineMenu size={20} />
              <span className="text-sm">Menu</span>
            </div>
            <div className="flex items-center gap-1 hover:text-gray-700 transition-colors cursor-pointer" onClick={toggleSearch}>
              <AiOutlineSearch size={20} />
              <span className="text-sm">Search for your gifts</span>
            </div>
          </div>

          {/* Center: Brand */}
          <div className="header-brand font-display">
            TINA SHAYESTE
          </div>

          {/* Right Section: Contact and Icons */}
          <div className="right-section flex items-center gap-3">
            <a href="/contact" className="text-sm hover:text-gray-700 transition-colors whitespace-nowrap">
              Contact us
            </a>
            <a href="/favorites" className="hover:text-gray-700 transition-colors">
              <AiOutlineHeart size={20} />
            </a>
            <a href="/profile" className="hover:text-gray-700 transition-colors">
              <AiOutlineUser size={20} />
            </a>
            <a href="/cart" className="hover:text-gray-700 transition-colors relative">
              <AiOutlineShopping size={20} />
              <span className="cart-quantity-bubble">0</span>
            </a>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleSidebar}></div>
      )}

      {/* Sidebar Menu */}
      <div 
        className={`fixed top-0 left-0 h-full bg-white w-64 p-4 z-50 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <button 
          onClick={toggleSidebar} 
          className="sidebar-close mb-4 text-gray-600 hover:text-black text-sm flex items-center gap-2"
        >
          <span className="text-base">×</span> 
          <span>Close</span>
        </button>
        <nav className="flex flex-col gap-3 text-sm">
          <a href="#" className="sidebar-link">Gifts</a>
          <a href="#" className="sidebar-link">What's new</a>
          <a href="#" className="sidebar-link">Bags and Small Leather Goods</a>
          <a href="#" className="sidebar-link">Women</a>
          <a href="#" className="sidebar-link">Man</a>
          <a href="#" className="sidebar-link">Jewelry</a>
          <a href="#" className="sidebar-link">Watches</a>
          <a href="#" className="sidebar-link">Perfumes</a>
          <a href="#" className="sidebar-link">Trunks, Travel and Home</a>
          <a href="#" className="sidebar-link">Services</a>
          <a href="#" className="sidebar-link">The House of TINA</a>
        </nav>
        
        <div className="mt-auto pt-4 sidebar-link cursor-pointer">
          Sustainable Development
        </div>
      </div>

      {/* Full-page Search Overlay with Transition */}
      <div className={`search-overlay ${searchOpen ? 'open' : ''}`}>
        {/* Brand inside search overlay */}
        <div className="search-overlay-brand font-display">
          TINA SHAYESTE
        </div>
        
        {/* Close icon top-right */}
        <div className="close-button-container">
          <AiOutlineClose className="close-icon" onClick={() => setSearchOpen(false)} />
        </div>

        {/* Search input near the top as well */}
        <form onSubmit={handleSearchSubmit} className="search-form">
          <AiOutlineSearch className="search-icon" />
          <input 
            type="text" 
            name="search"
            placeholder='Type to search...'
            className="search-input"
          />
          <button type="submit" className="search-submit">
            Go
          </button>
        </form>
      </div>
    </>
  );
}

export default Header;


















