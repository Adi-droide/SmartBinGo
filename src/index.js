// SmartBinGo - Main Application Entry Point
const express = require('express');
const dotenv = require('dotenv');

// Import modules
const loginHandler = require('./modules/auth/Login');
const productService = require('./modules/inventory/ProductService');
const paymentGateway = require('./modules/payment/PaymentGateway');
const vehicleTracker = require('./modules/tracking/VehicleTracker');

dotenv.config();

const app = express();
app.use(express.json());

// API Routes

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const result = loginHandler.login(email, password);
  res.json(result);
});

app.post('/api/auth/otp/send', (req, res) => {
  const { phone } = req.body;
  const result = loginHandler.generateOTP(phone);
  res.json(result);
});

app.post('/api/auth/otp/verify', (req, res) => {
  const { phone, otp } = req.body;
  const result = loginHandler.verifyOTP(phone, otp);
  res.json(result);
});

// Products & Inventory
app.get('/api/products', (req, res) => {
  res.json(productService.getProducts());
});

app.post('/api/orders/place', (req, res) => {
  const { productId, quantity } = req.body;
  const result = productService.placeOrder(productId, quantity);
  res.json(result);
});

app.post('/api/orders/cancel', (req, res) => {
  const { orderId, productId, quantity } = req.body;
  const result = productService.cancelOrder(orderId, productId, quantity);
  res.json(result);
});

app.get('/api/inventory/:productId', (req, res) => {
  const result = productService.getStockStatus(req.params.productId);
  res.json(result);
});

// Payment
app.post('/api/payments/process', async (req, res) => {
  const { orderId, amount, method } = req.body;
  const result = await paymentGateway.processPayment(orderId, amount, method);
  res.json(result);
});

app.post('/api/payments/refund', (req, res) => {
  const { paymentId, amount } = req.body;
  const result = paymentGateway.refundPayment(paymentId, amount);
  res.json(result);
});

// Vehicle Tracking
app.get('/api/vehicles', (req, res) => {
  res.json(vehicleTracker.getVehicles());
});

app.get('/api/vehicles/:vehicleId/location', (req, res) => {
  const result = vehicleTracker.getVehicleLocation(req.params.vehicleId);
  res.json(result);
});

app.post('/api/vehicles/:vehicleId/update-location', (req, res) => {
  const { lat, lng } = req.body;
  const result = vehicleTracker.updateLocation(req.params.vehicleId, lat, lng);
  res.json(result);
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 SmartBinGo Server running on port ${PORT}`);
  console.log(`📦 Inventory Management Module Loaded`);
  console.log(`🔐 Authentication Module Loaded`);
  console.log(`💳 Payment Module Loaded`);
  console.log(`📍 Vehicle Tracking Module Loaded`);
});
