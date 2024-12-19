import React from 'react';
import { useNavigate } from 'react-router-dom';

function Favorites() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    // Navigate to the login/register page
    navigate('/register');
  };

  return (
    <div style={{ width: '100%', backgroundColor: '#ffffff' }}>
      {/* First horizontal line after header */}
      <hr 
        style={{
          width: '100%',
          border: 'none',
          borderTop: '1px solid #ccc',
          margin: '0'
        }} 
      />

      <div 
        style={{ 
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center',
          padding: '60px 20px' 
        }}
      >
        <h1 
          style={{ 
            fontSize: '24px', 
            marginBottom: '20px', 
            fontWeight: 'normal'
          }}
        >
          Your wishlist is empty.
        </h1>
        <p 
          style={{ 
            marginBottom: '30px', 
            lineHeight: '1.5', 
            fontSize: '16px', 
            color: '#000000'
          }}
        >
          Save products and styles to your wishlist and share them.<br/>
          Need some inspiration?
        </p>
        <button 
          onClick={handleLoginClick}
          style={{ 
            padding: '10px 20px', 
            borderRadius: '20px', 
            backgroundColor: 'black', 
            color: 'white', 
            border: 'none', 
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Login
        </button>
      </div>

      {/* Second horizontal line below wishlist content */}
      <hr 
        style={{
          width: '100%',
          border: 'none',
          borderTop: '1px solid #ccc',
          margin: '0'
        }} 
      />
    </div>
  );
}

export default Favorites;

