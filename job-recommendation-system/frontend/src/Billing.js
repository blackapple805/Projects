import React, { useState } from 'react';
import './Billing.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Billing() {
  const [formData, setFormData] = useState({
    card_holder_name: '',
    card_number: '',
    expiry_date: '',
    cvv: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const { card_holder_name, card_number, expiry_date, cvv } = formData;

    if (!card_holder_name) {
      return 'Card holder name is required';
    }
    if (card_number.length !== 16) {
      return 'Card number must be 16 digits';
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry_date)) {
      return 'Expiry date must be in MM/YY format';
    }
    if (cvv.length < 3 || cvv.length > 4) {
      return 'CVV must be 3 or 4 digits';
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      const email = localStorage.getItem('email'); // Assuming email is stored in localStorage
      const token = localStorage.getItem('token'); // Assuming token is stored in localStorage
      const response = await fetch('/billing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, email })
      });

      if (!response.ok) {
        throw new Error('Failed to save billing details');
      }

      toast.success('Checkout complete');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error saving billing details');
    }
  };

  return (
    <div className="billing-container">
      <h2>Billing</h2>
      <p>Enter your credit card details to upgrade your plan or remove it.</p>
      <form className="form" onSubmit={handleSubmit}>
        <label className="label">
          <span className="title">Card holder full name</span>
          <input
            className="input-field"
            type="text"
            name="card_holder_name"
            placeholder="Enter your full name"
            value={formData.card_holder_name}
            onChange={handleChange}
          />
        </label>
        <label className="label">
          <span className="title">Card Number</span>
          <input
            className="input-field"
            type="text"
            name="card_number"
            placeholder="0000 0000 0000 0000"
            value={formData.card_number}
            onChange={handleChange}
          />
        </label>
        <div className="split">
          <label className="label">
            <span className="title">Expiry Date</span>
            <input
              className="input-field"
              type="text"
              name="expiry_date"
              placeholder="MM/YY"
              value={formData.expiry_date}
              onChange={handleChange}
            />
          </label>
          <label className="label">
            <span className="title">CVV</span>
            <input
              className="input-field"
              type="text"
              name="cvv"
              placeholder="CVV"
              value={formData.cvv}
              onChange={handleChange}
            />
          </label>
        </div>
        <button className="checkout-btn" type="submit">Checkout</button>
      </form>
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default Billing;
