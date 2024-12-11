// frontend/src/components/Footer.jsx
import React from 'react';
import './Footer.css'; // New CSS file for footer

export default function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <p>© {new Date().getFullYear()} YourBrand. All rights reserved.</p>
      </div>
    </footer>
  );
}
