import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import BreadArt from './BreadArt';
import '../styles.css';

// SweetAlert theme matched to the MIGA design tokens
const swalTheme = {
  confirmButtonColor: '#1d1a16',
  cancelButtonColor: '#8c8478',
  background: '#fffefb',
  color: '#1d1a16',
};

const BreadList = () => {
  const [breads, setBreads] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBreads = async () => {
      try {
        const response = await axios.get('/api/breads');
        const breadsData = response.data.map((bread) => ({
          ...bread,
          price: parseFloat(bread.price),
        }));
        setBreads(breadsData);
      } catch (error) {
        console.error('Failed to fetch breads:', error);
        setLoadError('Could not load the bread list. Is the server running?');
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
        newCart[bread.id] = {
          ...newCart[bread.id],
          quantity: newCart[bread.id].quantity + 1,
        };
      } else {
        newCart[bread.id] = { ...bread, quantity: 1 };
      }
      return newCart;
    });
  }, []);

  const removeFromCart = useCallback((breadId) => {
    setCart((prevCart) => {
      const newCart = { ...prevCart };
      if (!newCart[breadId]) return prevCart;
      if (newCart[breadId].quantity > 1) {
        newCart[breadId] = {
          ...newCart[breadId],
          quantity: newCart[breadId].quantity - 1,
        };
      } else {
        delete newCart[breadId];
      }
      return newCart;
    });
  }, []);

  const clearCart = () => {
    Swal.fire({
      title: 'Clear the order?',
      text: 'Everything in the order will be removed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Clear it',
      cancelButtonText: 'Keep it',
      ...swalTheme,
    }).then((result) => {
      if (result.isConfirmed) {
        setCart({});
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
      Swal.fire({
        title: 'Purchase failed',
        text: 'The receipt could not be saved. Try again.',
        icon: 'error',
        ...swalTheme,
      });
    }
  };

  const cartItems = Object.values(cart);

  return (
    <main>
      {/* Hero */}
      <section className="m-hero">
        <div className="m-label">San Buenaventura · Est. MMXIX</div>
        <h1>From our hearth, <em>raised slowly,</em> baked before dawn.</h1>
        <p>
          Flour, water, salt and time — nothing else. Every loaf is naturally
          leavened over two days and drawn from the oven the morning you buy it,
          a few blocks from the Ventura pier.
        </p>
      </section>

      <hr className="m-rule" />

      <div className="m-shop">
        {/* Product grid */}
        <div>
          <div className="m-label m-label--ink" style={{ marginBottom: '34px' }}>
            The Day's Bake
          </div>

          {loadError && <p className="m-notice">{loadError}</p>}
          {loading && <p className="m-muted">Loading breads…</p>}

          {!loading && (
            <ul className="m-grid">
              {breads.length > 0 ? (
                breads.map((bread) => (
                  <li key={bread.id} className="m-card">
                    <div className="m-art">
                      {bread.image ? (
                        <img src={bread.image} alt={bread.name} loading="lazy" />
                      ) : (
                        <BreadArt name={bread.name} />
                      )}
                    </div>
                    <span className="m-card-name">{bread.name}</span>
                    <span className="m-card-price">$ {bread.price.toFixed(2)}</span>
                    <button className="m-card-add" onClick={() => addToCart(bread)}>
                      Add to order
                    </button>
                  </li>
                ))
              ) : (
                !loadError && <p className="m-muted">No breads available right now.</p>
              )}
            </ul>
          )}
        </div>

        {/* Order panel */}
        <aside className="m-order">
          <div className="m-label m-order-title">Your Order</div>
          <hr className="m-order-rule" />

          {cartItems.length > 0 ? (
            <>
              <ul className="m-lines">
                {cartItems.map((bread) => (
                  <li key={bread.id} className="m-line">
                    <span className="m-line-name">{bread.name}</span>
                    <span className="m-qty">
                      <button
                        onClick={() => removeFromCart(bread.id)}
                        aria-label={`Remove one ${bread.name}`}
                      >
                        −
                      </button>
                      {bread.quantity}
                      <button
                        onClick={() => addToCart(bread)}
                        aria-label={`Add one ${bread.name}`}
                      >
                        +
                      </button>
                    </span>
                    <span className="m-amount">
                      ${(bread.price * bread.quantity).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
              <hr className="m-order-rule" />
              <div className="m-total">
                <span className="m-label m-label--ink">Total</span>
                <span className="m-total-figure">${calculateTotal()}</span>
              </div>
              <button className="m-cta" onClick={handlePurchase}>
                Complete purchase
              </button>
              <button className="m-quiet" onClick={clearCart}>
                Clear order
              </button>
            </>
          ) : (
            <p className="m-empty">Nothing here yet — add some bread.</p>
          )}
        </aside>
      </div>
    </main>
  );
};

export default BreadList;
