import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import '../styles.css';

const BreadList = () => {
  const [breads, setBreads] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBreads = async () => {
      try {
        const response = await axios.get('/api/breads');
        // Ensure that prices are numbers
        const breadsData = response.data.map(bread => ({
          ...bread,
          price: parseFloat(bread.price) // Convert price to number
        }));
        setBreads(breadsData);
      } catch (error) {
        console.error('Failed to fetch breads:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBreads();
  }, []);

  const addToCart = useCallback((bread) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (newCart[bread.id]) {
        newCart[bread.id].quantity += 0.5;
      } else {
        newCart[bread.id] = { ...bread, quantity: 1 };
      }
      return newCart;
    });
  }, []);

  const removeFromCart = useCallback((breadId) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (newCart[breadId].quantity > 1) {
        newCart[breadId].quantity -= 0.5;
      } else {
        delete newCart[breadId];
      }
      return newCart;
    });
  }, []);

  const clearCart = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, clear it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setCart({});
        Swal.fire(
          'Cleared!',
          'Your cart has been cleared.',
          'success'
        );
      }
    });
  };

  const calculateTotal = useCallback(() => {
    return Object.values(cart)
      .reduce((total, bread) => total + bread.price * bread.quantity, 0)
      .toFixed(2);
  }, [cart]);

  const handlePurchase = async () => {
    const total = calculateTotal();
    try {
      const response = await axios.post('/api/receipts', {
        cart: Object.values(cart),
        total,
      });
      navigate(`/receipt/${response.data.receiptId}`);
    } catch (error) {
      alert('Failed to save the receipt. Please try again.');
    }
  };

  if (loading) {
    return <p>Loading breads...</p>;
  }

  return (
    <div className="container">
      <div className="wrapper">
        <div className="circle-1"></div>
        <div className="circle-2"></div>
        <div className="card">
          <section className="top">
            <span className="u-l">Available Breads:</span>
          </section>
          <section className="bottom">
            <ul className="users">
              {breads.length > 0 ? (
                breads.map(bread => (
                  <li key={bread.id} className="user">
                    <span className="user-name">{bread.name}</span>
                    <span className="user-occupation">${bread.price.toFixed(2)}</span>
                    <button onClick={() => addToCart(bread)}>Add to Cart</button>
                  </li>
                ))
              ) : (
                <p>No breads available.</p>
              )}
            </ul>
          </section>
        </div>
      </div>

      <div className="cart-section">
        <h2>Your Cart</h2>
        {Object.keys(cart).length > 0 ? (
          <>
            <ul>
              {Object.values(cart).map((bread) => (
                <li key={bread.id} className="user">
                  <span className="user-name">{bread.name}</span>
                  <span className="user-occupation">${bread.price.toFixed(2)} x {bread.quantity}</span>
                  <button onClick={() => removeFromCart(bread.id)} className="remove-btn">Remove</button>
                </li>
              ))}
            </ul>
            <h3 className="total">Total: ${calculateTotal()}</h3>
            <button onClick={handlePurchase}>Purchase</button>
            <button onClick={clearCart} className="clear-btn" style={{ marginLeft: '10px' }}>
              Clear Cart
            </button>
          </>
        ) : (
          <p>No items in cart.</p>
        )}
      </div>
    </div>
  );
};

export default BreadList;
