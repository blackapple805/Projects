const connection = require('../config/db');

const saveReceipt = (req, res) => {
  const { cart, total } = req.body;
  const items = JSON.stringify(cart);

  connection.query(
    'INSERT INTO receipts (items, total) VALUES (?, ?)',
    [items, total],
    (err, results) => {
      if (err) {
        console.error('Error saving receipt:', err);
        return res.status(500).send(err);
      }
      res.status(201).json({ message: 'Receipt saved successfully!', receiptId: results.insertId });
    }
  );
};

const getReceiptById = (req, res) => {
  const { id } = req.params;

  connection.query('SELECT * FROM receipts WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error fetching receipt:', err);
      return res.status(500).send(err);
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    res.json(results[0]);
  });
};

const getAllReceipts = (req, res) => {
  connection.query('SELECT * FROM receipts ORDER BY purchase_date DESC', (err, results) => {
    if (err) {
      console.error('Error fetching receipts:', err);
      return res.status(500).send(err);
    }
    res.json(results);
  });
};

const getReceiptsByDate = (req, res) => {
  const { date } = req.params;
  
  connection.query(
    'SELECT * FROM receipts WHERE DATE(purchase_date) = ? ORDER BY purchase_date DESC', 
    [date], 
    (err, results) => {
      if (err) {
        console.error('Error fetching receipts by date:', err);
        return res.status(500).send(err);
      }
      res.json(results);
    }
  );
};

module.exports = {
  saveReceipt,
  getReceiptById,
  getAllReceipts,
  getReceiptsByDate, // Add this function
};
