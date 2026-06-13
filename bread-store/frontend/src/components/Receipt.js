import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles.css';

const Receipt = () => {
  const { receiptId } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const response = await axios.get(`/api/receipts/${receiptId}`);
        setReceipt(response.data);
      } catch (err) {
        console.error('Error fetching receipt:', err);
        setError('This receipt could not be found.');
      }
    };
    fetchReceipt();
  }, [receiptId]);

  if (error) {
    return (
      <main className="m-page">
        <p className="m-notice">{error}</p>
      </main>
    );
  }

  if (!receipt) {
    return (
      <main className="m-page">
        <p className="m-muted">Loading receipt…</p>
      </main>
    );
  }

  const { items, total, purchase_date } = receipt;
  const breadItems = JSON.parse(items);

  return (
    <main className="m-receipt-wrap">
      <div className="m-receipt">
        <div className="m-wordmark">MIGA</div>
        <div className="m-wordmark-sub">Bread Atelier · Ventura, Calif.</div>
        <div className="m-receipt-meta">
          Receipt Nº {receiptId} — {new Date(purchase_date).toLocaleString()}
        </div>

        <hr className="m-order-rule" />

        <ul className="m-lines">
          {breadItems.map((bread, index) => (
            <li key={index} className="m-line">
              <span className="m-line-name">
                {bread.name} × {bread.quantity}
              </span>
              <span className="m-amount">
                ${(parseFloat(bread.price) * bread.quantity).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>

        <hr className="m-order-rule" />

        <div className="m-total">
          <span className="m-label m-label--ink">Total</span>
          <span className="m-total-figure">${parseFloat(total).toFixed(2)}</span>
        </div>

        <div className="m-label m-receipt-foot">
          Baked before dawn · sold the same day
        </div>
      </div>

      <button className="m-back" onClick={() => navigate('/')}>
        Back to the shop
      </button>
    </main>
  );
};

export default Receipt;
