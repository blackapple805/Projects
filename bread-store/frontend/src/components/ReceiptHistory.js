import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles.css';

const ReceiptHistory = () => {
  const [date, setDate] = useState('');
  const [receipts, setReceipts] = useState([]);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const fetchReceipts = useCallback(async () => {
    setError(null);
    try {
      const response = await axios.get(`/api/receipts/date/${date}`);
      setReceipts(response.data);
      setSearched(true);
    } catch (err) {
      console.error('Error fetching receipts:', err);
      setError('Could not load receipts for that date.');
    }
  }, [date]);

  useEffect(() => {
    if (date) {
      fetchReceipts();
    }
  }, [date, fetchReceipts]);

  const dayTotal = receipts
    .reduce((sum, r) => sum + parseFloat(r.total), 0)
    .toFixed(2);

  return (
    <main className="m-page">
      <div className="m-label">The Ledger</div>
      <h2 className="m-page-title">Sales by day</h2>
      <p className="m-page-sub">Choose a date to see that day's orders and takings.</p>

      <div className="m-date-field">
        <label className="m-label m-label--ink" htmlFor="sales-date">Date</label>
        <input
          id="sales-date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {error && <p className="m-notice">{error}</p>}

      {searched && !error && (
        receipts.length > 0 ? (
          <>
            <div className="m-day-summary">
              <span className="m-label">
                {receipts.length} order{receipts.length === 1 ? '' : 's'} · day total
              </span>
              <strong>${dayTotal}</strong>
            </div>
            <ul className="m-rows" style={{ marginTop: '18px' }}>
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
          </>
        ) : (
          <p className="m-muted" style={{ marginTop: '24px' }}>No sales on this date.</p>
        )
      )}
    </main>
  );
};

export default ReceiptHistory;
