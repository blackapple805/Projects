import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles.css';

const ReceiptList = () => {
  const [receipts, setReceipts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await axios.get('/api/receipts');
        setReceipts(response.data);
      } catch (err) {
        console.error('Error fetching receipts:', err);
        setError('Could not load receipts. Is the server running?');
      } finally {
        setLoading(false);
      }
    };
    fetchReceipts();
  }, []);

  return (
    <main className="m-page">
      <div className="m-label">The Record</div>
      <h2 className="m-page-title">Receipts</h2>
      <p className="m-page-sub">Every completed order, newest first.</p>

      {error && <p className="m-notice">{error}</p>}
      {loading && <p className="m-muted" style={{ marginTop: '24px' }}>Loading receipts…</p>}

      {!loading && !error && (
        receipts.length > 0 ? (
          <ul className="m-rows">
            {receipts.map((receipt) => (
              <li key={receipt.id}>
                <Link to={`/receipt/${receipt.id}`} className="m-row">
                  <span className="m-row-id">Nº {receipt.id}</span>
                  <span className="m-row-date">
                    {new Date(receipt.purchase_date).toLocaleString()}
                  </span>
                  <span className="m-row-total">
                    ${parseFloat(receipt.total).toFixed(2)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="m-muted" style={{ marginTop: '24px' }}>
            No receipts yet — they'll show up after the first sale.
          </p>
        )
      )}
    </main>
  );
};

export default ReceiptList;
