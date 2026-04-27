import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Dashboard() {
  const [vehicles, setVehicles] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchVehicles();
    fetchProducts();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/vehicles`);
      setVehicles(res.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products`);
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <div>
      <h1>SmartBinGo Dashboard</h1>
      
      <h2>Active Vehicles ({vehicles.length})</h2>
      <ul>
        {vehicles.map(v => (
          <li key={v.id}>{v.name} - Status: {v.status}</li>
        ))}
      </ul>
      
      <h2>Available Products ({products.length})</h2>
      <ul>
        {products.map(p => (
          <li key={p.id}>{p.name} - ₹{p.price} (Stock: {p.stock})</li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
