import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Tracking from './components/Tracking';
import Inventory from './components/Inventory';
import Login from './components/Login';

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: '20px' }}>
        <nav>
          <Link to="/">Dashboard</Link> |{' '}
          <Link to="/products">Products</Link> |{' '}
          <Link to="/tracking">Vehicle Tracking</Link> |{' '}
          <Link to="/inventory">Inventory</Link>
        </nav>
        <hr />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
