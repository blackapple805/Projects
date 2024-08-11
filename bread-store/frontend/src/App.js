import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import BreadList from './components/BreadList';
import Receipt from './components/Receipt';
import ReceiptList from './components/ReceiptList';
import ReceiptHistory from './components/ReceiptHistory'; // Import the new component

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<BreadList />} />
        <Route path="/receipt/:receiptId" element={<Receipt />} />
        <Route path="/receipts" element={<ReceiptList />} />
        <Route path="/receipts-history" element={<ReceiptHistory />} /> {/* New route */}
      </Routes>
    </Router>
  );
};

export default App;
