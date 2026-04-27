// Product Service Module
const stockManager = require('./StockManager');

class ProductService {
  constructor() {
    this.products = [
      { id: 'P001', name: 'Organic Waste Bin', stock: 50, price: 299 },
      { id: 'P002', name: 'Recycling Bin', stock: 30, price: 399 },
      { id: 'P003', name: 'Smart Scheduler', stock: 10, price: 999 }
    ];
    this.initializeStock();
  }

  initializeStock() {
    this.products.forEach(product => {
      stockManager.addProduct(product.id, product.name, product.stock);
    });
  }

  getProducts() {
    return this.products;
  }

  getProductById(productId) {
    return this.products.find(p => p.id === productId);
  }

  placeOrder(productId, quantity) {
    const product = this.getProductById(productId);
    if (!product) {
      return { success: false, message: 'Product not found' };
    }
    
    try {
      const reservation = stockManager.reserveStock(productId, quantity);
      return { success: true, orderId: `ORD-${Date.now()}`, product, quantity, reservation };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  confirmOrderPayment(orderId, productId, quantity) {
    const result = stockManager.confirmOrder(productId, quantity);
    return { success: true, orderId, ...result };
  }

  cancelOrder(orderId, productId, quantity) {
    // BUG: Stock not being restored correctly
    const result = stockManager.cancelOrder(productId, quantity);
    return { success: true, orderId, ...result };
  }

  getStockStatus(productId) {
    return stockManager.getStock(productId);
  }
}

module.exports = new ProductService();
