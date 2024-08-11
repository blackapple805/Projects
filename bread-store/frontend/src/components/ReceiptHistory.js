import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const ReceiptHistory = () => {
  const [date, setDate] = useState('');
  const [receipts, setReceipts] = useState([]);
  const [error, setError] = useState(null);

  const handleDateChange = (e) => {
    setDate(e.target.value);
  };

  const fetchReceipts = useCallback(async () => {
    try {
      const response = await axios.get(`/api/receipts/date/${date}`);
      setReceipts(response.data);
    } catch (error) {
      console.error('Error fetching receipts:', error);
      setError('Failed to fetch receipts');
    }
  }, [date]);

  useEffect(() => {
    if (date) {
      fetchReceipts();
    }
  }, [date, fetchReceipts]);

  return (
    <div>
      <h1>Sales History</h1>
      <input 
        type="date" 
        value={date} 
        onChange={handleDateChange} 
        placeholder="Select a date" 
      />
      <ul>
        {receipts.length > 0 ? (
          receipts.map((receipt) => (
            <li key={receipt.id}>
              Receipt ID: {receipt.id} - Date: {new Date(receipt.purchase_date).toLocaleString()} - Total: ${receipt.total}
            </li>
          ))
        ) : (
          <p>No receipts found for this date.</p>
        )}
      </ul>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default ReceiptHistory;
