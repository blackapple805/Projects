import React from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink, Link } from 'react-router-dom';
import BreadList from './components/BreadList';
import Receipt from './components/Receipt';
import ReceiptList from './components/ReceiptList';
import ReceiptHistory from './components/ReceiptHistory';
import './styles.css';

const App = () => {
  return (
    <Router>
      <header className="m-header">
        <div>
          <h1 className="m-wordmark" style={{ margin: 0 }}>
            <Link to="/">MIGA</Link>
          </h1>
          <div className="m-wordmark-sub">Bread Atelier · Ventura, Calif.</div>
        </div>
        <nav className="m-nav">
          <NavLink to="/" end>Shop</NavLink>
          <NavLink to="/receipts">Receipts</NavLink>
          <NavLink to="/receipts-history">Ledger</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<BreadList />} />
        <Route path="/receipt/:receiptId" element={<Receipt />} />
        <Route path="/receipts" element={<ReceiptList />} />
        <Route path="/receipts-history" element={<ReceiptHistory />} />
      </Routes>
    </Router>
  );
};

export default App;
