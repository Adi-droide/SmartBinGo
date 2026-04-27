import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

function Products() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

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

  const addToCart = (product) => {
    setCart([...cart, product]);
    alert(`Added ${product.name} to cart`);
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }
    
    try {
      const res = await axios.post(`${API_URL}/api/orders/place`, {
        productId: cart[0].id,
        quantity: cart.length
      });
      alert(`Order placed! Order ID: ${res.data.orderId}`);
      setCart([]);
      fetchProducts();
    } catch (error) {
      alert('Order failed: ' + error.response?.data?.message);
    }
  };

  return (
    <div>
      <h1>Products</h1>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {products.map(p => (
          <div key={p.id} style={{ border: '1px solid #ccc', padding: '10px', width: '200px' }}>
            <h3>{p.name}</h3>
            <p>Price: ₹{p.price}</p>
            <p>Stock: {p.stock}</p>
            <button onClick={() => addToCart(p)}>Add to Cart</button>
          </div>
        ))}
      </div>
      
      <h2>Cart ({cart.length} items)</h2>
      <button onClick={placeOrder}>Place Order</button>
    </div>
  );
}

export default Products;
