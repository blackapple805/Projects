import React from 'react';
import './Billing.css';

function Billing() {
  return (
    <div className="billing-container">
      <h2>Billing</h2>
      <p>Enter your credit card details to upgrade your plan or remove it.</p>
      <form className="form">
        <label className="label">
          <span className="title">Card holder full name</span>
          <input className="input-field" type="text" placeholder="Enter your full name" />
        </label>
        <label className="label">
          <span className="title">Card Number</span>
          <input className="input-field" type="number" placeholder="0000 0000 0000 0000" />
        </label>
        <div className="split">
          <label className="label">
            <span className="title">Expiry Date</span>
            <input className="input-field" type="text" placeholder="MM/YY" />
          </label>
          <label className="label">
            <span className="title">CVV</span>
            <input className="input-field" type="number" placeholder="CVV" />
          </label>
        </div>
        <input className="checkout-btn" type="button" value="Checkout" />
      </form>
    </div>
  );
}

export default Billing;
