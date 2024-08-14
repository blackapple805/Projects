import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles.css';

const Receipt = () => {
  const { receiptId } = useParams(); // Get receiptId from the URL
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // For navigating back to the bread list

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const response = await axios.get(`/api/receipts/${receiptId}`);
        setReceipt(response.data);
      } catch (error) {
        console.error('Error fetching receipt:', error);
        setError('Failed to fetch receipt');
      }
    };

    fetchReceipt();
  }, [receiptId]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!receipt) {
    return <p>Loading...</p>;
  }

  const { items, total, purchase_date } = receipt;
  const breadItems = JSON.parse(items);

  return (
    <div className="receipt-container">
      <h1>Receipt</h1>
      <p>Receipt ID: {receiptId}</p>
      <p>Purchase Date: {new Date(purchase_date).toLocaleString()}</p>
      <ul>
        {breadItems.map((bread, index) => (
          <li key={index}>
            {bread.name} - ${bread.price} <span>×{bread.quantity}</span>
          </li>
        ))}
      </ul>
      <h3 className="total-text">Total: ${total}</h3>
      <button onClick={() => navigate('/')} className="back-button">Back to Bread List</button>
    </div>
  );
};

export default Receipt;
