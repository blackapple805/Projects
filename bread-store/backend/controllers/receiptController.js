const db = require('../config/db');

const saveReceipt = (req, res) => {
  try {
    const { cart, total } = req.body;
    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    const items = JSON.stringify(cart);
    const result = db
      .prepare('INSERT INTO receipts (items, total) VALUES (?, ?)')
      .run(items, parseFloat(total));
    res.status(201).json({
      message: 'Receipt saved successfully!',
      receiptId: Number(result.lastInsertRowid),
    });
  } catch (err) {
    console.error('Error saving receipt:', err);
    res.status(500).json({ message: 'Failed to save receipt' });
  }
};

const getReceiptById = (req, res) => {
  try {
    const receipt = db
      .prepare('SELECT * FROM receipts WHERE id = ?')
      .get(req.params.id);
    if (!receipt) {
      return res.status(404).json({ message: 'Receipt not found' });
    }
    res.json(receipt);
  } catch (err) {
    console.error('Error fetching receipt:', err);
    res.status(500).json({ message: 'Failed to fetch receipt' });
  }
};

const getAllReceipts = (req, res) => {
  try {
    const receipts = db
      .prepare('SELECT * FROM receipts ORDER BY purchase_date DESC')
      .all();
    res.json(receipts);
  } catch (err) {
    console.error('Error fetching receipts:', err);
    res.status(500).json({ message: 'Failed to fetch receipts' });
  }
};

const getReceiptsByDate = (req, res) => {
  try {
    const receipts = db
      .prepare(
        "SELECT * FROM receipts WHERE date(purchase_date) = ? ORDER BY purchase_date DESC"
      )
      .all(req.params.date);
    res.json(receipts);
  } catch (err) {
    console.error('Error fetching receipts by date:', err);
    res.status(500).json({ message: 'Failed to fetch receipts' });
  }
};

module.exports = {
  saveReceipt,
  getReceiptById,
  getAllReceipts,
  getReceiptsByDate,
};
