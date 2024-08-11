const express = require('express');
const { saveReceipt, getReceiptById, getAllReceipts, getReceiptsByDate } = require('../controllers/receiptController');
const router = express.Router();

router.post('/receipts', saveReceipt);
router.get('/receipts/:id', getReceiptById);
router.get('/receipts', getAllReceipts);
router.get('/receipts/date/:date', getReceiptsByDate);  // New route to get receipts by date

module.exports = router;
