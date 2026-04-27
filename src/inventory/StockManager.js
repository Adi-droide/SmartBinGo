// Inventory Management Module - Stock Manager
// This module handles product stock, inventory updates, and order cancellations

class StockManager {
  constructor() {
    this.products = new Map();
  }

  // Add product to inventory
  addProduct(productId, name, stock) {
    this.products.set(productId, { name, stock, reserved: 0 });
    console.log(`✅ Product ${name} added with stock ${stock}`);
    return { success: true, productId, stock };
  }

  // Reserve stock when order is placed
  reserveStock(productId, quantity) {
    const product = this.products.get(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }
    if (product.stock - product.reserved < quantity) {
      throw new Error(`Insufficient stock for product ${product.name}`);
    }
    product.reserved += quantity;
    console.log(`📦 Reserved ${quantity} of ${product.name}. Remaining: ${product.stock - product.reserved}`);
    return { success: true, reserved: product.reserved };
  }

  // Confirm order and reduce actual stock
  confirmOrder(productId, quantity) {
    const product = this.products.get(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }
    product.stock -= quantity;
    product.reserved -= quantity;
    console.log(`✅ Order confirmed. ${product.name} stock now: ${product.stock}`);
    return { success: true, stock: product.stock };
  }

  // Cancel order and restore stock
  cancelOrder(productId, quantity) {
    const product = this.products.get(productId);
    if (!product) {
      throw new Error(`Product ${productId} not found`);
    }
    product.reserved -= quantity;
    // BUG FIX: Stock should be restored on cancellation
    product.stock += quantity;
    console.log(`🔄 Order cancelled. ${product.name} stock restored to: ${product.stock}`);
    return { success: true, stock: product.stock };
  }

  // Get current stock
  getStock(productId) {
    const product = this.products.get(productId);
    if (!product) {
      return { success: false, message: 'Product not found' };
    }
    return { success: true, productName: product.name, stock: product.stock, reserved: product.reserved };
  }
}

module.exports = new StockManager();
