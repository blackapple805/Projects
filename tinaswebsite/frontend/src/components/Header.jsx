// frontend/src/components/Header.jsx
import React from 'react';
import './Header.css'; // Import the CSS file

function Header() {
  return (
    <header className="header-container">
      <div className="header-content">
        <div className="header-brand">YourBrand</div>
        <nav className="header-nav">
          <a href="/" className="header-link">Home</a>
          <a href="/products" className="header-link">Products</a>
          <a href="/register" className="header-link">Register</a>
        </nav>
      </div>
    </header>
  );
}

export default Header;
