import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BreadList = () => {
  const [breads, setBreads] = useState([]);
  const [cart, setCart] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // For navigating to the receipt page

  useEffect(() => {
    const fetchBreads = async () => {
      try {
        console.log('Fetching data from API...');
        const response = await axios.get('/api/breads');
        console.log('Data fetched:', response.data);
        setBreads(response.data);
      } catch (error) {
        console.error('There was an error fetching the breads!', error);
        setError('Failed to fetch breads');
      } finally {
        setLoading(false);
      }
    };

    fetchBreads();
  }, []);

  const addToCart = useCallback((bread) => {
    setCart((prevCart) => [...prevCart, bread]);
  }, []);

  const removeFromCart = useCallback((index) => {
    if (window.confirm('Are you sure you want to remove this item from the cart?')) {
      setCart((prevCart) => prevCart.filter((_, i) => i !== index));
    }
  }, []);

  const clearCart = () => {
    if (window.confirm('Are you sure you want to clear the entire cart?')) {
      setCart([]);
    }
  };

  const calculateTotal = useCallback(() => {
    return cart.reduce((total, bread) => total + parseFloat(bread.price), 0).toFixed(2);
  }, [cart]);

  const handlePurchase = async () => {
    const total = calculateTotal();

    try {
      const response = await axios.post('/api/receipts', {
        cart,
        total,
      });

      // Navigate to the receipt page with the receipt ID
      navigate(`/receipt/${response.data.receiptId}`);
    } catch (error) {
      console.error('There was an error saving the receipt!', error);
      alert('Failed to save the receipt. Please try again.');
    }
  };

  if (loading) {
    return <p>Loading breads...</p>;
  }

  return (
    <div>
      <h1>Available Breads</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {breads.length > 0 ? (
          breads.map(bread => (
            <li key={bread.id}>
              {bread.name} - ${bread.price}
              <button onClick={() => addToCart(bread)}>Add to Cart</button>
            </li>
          ))
        ) : (
          <p>No breads available.</p>
        )}
      </ul>

      <h2>Your Cart</h2>
      {cart.length > 0 ? (
        <>
          <ul>
            {cart.map((bread, index) => (
              <li key={index}>
                {bread.name} - ${bread.price}
                <button onClick={() => removeFromCart(index)}>Remove</button>
              </li>
            ))}
          </ul>
          <h3>Total: ${calculateTotal()}</h3>
          <button onClick={handlePurchase}>Purchase</button>
          <button onClick={clearCart} style={{ marginLeft: '10px', backgroundColor: 'red', color: 'white' }}>
            Clear Cart
          </button>
        </>
      ) : (
        <p>No items in cart.</p>
      )}
    </div>
  );
};

export default BreadList;
