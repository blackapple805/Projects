import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles.css';

const ReceiptList = () => {
  const [receipts, setReceipts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const response = await axios.get('/api/receipts');
        setReceipts(response.data);
      } catch (error) {
        console.error('Error fetching receipts:', error);
        setError('Failed to fetch receipts');
      }
    };

    fetchReceipts();
  }, []);

  return (
    <div>
      <h1>Receipts History</h1>
      {error && <p>{error}</p>}
      <ul>
        {receipts.length > 0 ? (
          receipts.map((receipt) => (
            <li key={receipt.id}>
              <Link to={`/receipt/${receipt.id}`}>
                Receipt ID: {receipt.id} - Date: {new Date(receipt.purchase_date).toLocaleString()} - Total: ${receipt.total}
              </Link>
            </li>
          ))
        ) : (
          <p>No receipts found.</p>
        )}
      </ul>
    </div>
  );
};

export default ReceiptList;
