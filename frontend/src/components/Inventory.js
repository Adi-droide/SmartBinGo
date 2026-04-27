import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Inventory() {
  const [products, setProducts] = useState([]);
  const [orderId, setOrderId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/products`);
      setProducts(res.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const placeOrder = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/orders/place`, {
        productId,
        quantity: parseInt(quantity)
      });
      setOrderId(res.data.orderId);
      alert(`Order placed! Order ID: ${res.data.orderId}`);
      fetchProducts();
    } catch (error) {
      alert('Order failed: ' + error.response?.data?.message);
    }
  };

  const cancelOrder = async () => {
    if (!orderId) {
      alert('No order to cancel');
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/api/orders/cancel`, {
        orderId,
        productId,
        quantity: parseInt(quantity)
      });
      alert(`Order cancelled! Stock restored`);
      setOrderId('');
      fetchProducts();
    } catch (error) {
      alert('Cancel failed: ' + error.response?.data?.message);
    }
  };

  return (
    <div>
      <h1>Inventory Management</h1>
      
      <h2>Current Stock</h2>
      <table border="1" cellPadding="5">
        <thead>
          <tr><th>Product</th><th>Stock</th><th>Price</th></tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.stock}</td>
              <td>₹{p.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <h2>Place Order</h2>
      <select onChange={(e) => setProductId(e.target.value)}>
        <option value="">Select Product</option>
        {products.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" />
      <button onClick={placeOrder}>Place Order</button>
      
      {orderId && (
        <div>
          <h3>Order #{orderId}</h3>
          <button onClick={cancelOrder}>Cancel Order (Test Stock Restoration)</button>
          <p>⚠️ When you cancel, stock should restore automatically!</p>
        </div>
      )}
    </div>
  );
}

export default Inventory;
