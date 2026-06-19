import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Billing() {
  const [formData, setFormData] = useState({ card_holder_name: '', card_number: '', expiry_date: '', cvv: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const validateForm = () => {
    const { card_holder_name, card_number, expiry_date, cvv } = formData;
    if (!card_holder_name) return 'Card holder name is required.';
    if (card_number.replace(/\s/g, '').length !== 16) return 'Card number must be 16 digits.';
    if (!/^\d{2}\/\d{2}$/.test(expiry_date)) return 'Expiry date must be in MM/YY format.';
    if (cvv.length < 3 || cvv.length > 4) return 'CVV must be 3 or 4 digits.';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) { toast.error(error); return; }
    try {
      const email = localStorage.getItem('email');
      const res = await fetch('/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, email }),
      });
      if (!res.ok) throw new Error('Failed to save billing details');
      toast.success('Payment details saved.');
    } catch (err) {
      console.error('Error:', err);
      toast.error('Could not save billing details.');
    }
  };

  const masked = formData.card_number
    ? formData.card_number.replace(/\s/g, '').padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim()
    : '•••• •••• •••• ••••';

  return (
    <div>
      <div className="page-head">
        <h2>Billing</h2>
        <p>Add a card to upgrade your plan.</p>
      </div>
      <div className="billing-wrap">
        <div className="card-preview">
          <div className="chip"></div>
          <div className="pan">{masked}</div>
          <div className="row">
            <div><span className="lbl">Card holder</span>{formData.card_holder_name || 'YOUR NAME'}</div>
            <div><span className="lbl">Expires</span>{formData.expiry_date || 'MM/YY'}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <span>Card holder full name</span>
            <input type="text" name="card_holder_name" placeholder="Enter your full name" value={formData.card_holder_name} onChange={handleChange} />
          </div>
          <div className="field">
            <span>Card number</span>
            <input type="text" name="card_number" placeholder="0000 0000 0000 0000" value={formData.card_number} onChange={handleChange} />
          </div>
          <div className="split-2">
            <div className="field">
              <span>Expiry date</span>
              <input type="text" name="expiry_date" placeholder="MM/YY" value={formData.expiry_date} onChange={handleChange} />
            </div>
            <div className="field">
              <span>CVV</span>
              <input type="text" name="cvv" placeholder="123" value={formData.cvv} onChange={handleChange} />
            </div>
          </div>
          <button className="btn btn-primary" type="submit"><i className="fas fa-lock"></i> Save payment method</button>
        </form>
      </div>
      <ToastContainer position="bottom-right" theme="dark" />
    </div>
  );
}

export default Billing;