// Payment Gateway Module
// Handles payment processing, Razorpay integration

class PaymentGateway {
  constructor() {
    this.payments = new Map();
  }

  // Process payment
  processPayment(orderId, amount, method) {
    console.log(`💰 Processing payment of ₹${amount} for order ${orderId} via ${method}`);
    
    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        const paymentId = `PAY-${Date.now()}`;
        this.payments.set(paymentId, { orderId, amount, method, status: 'success', timestamp: new Date() });
        resolve({ success: true, paymentId, message: 'Payment successful' });
      }, 1000);
    });
  }

  // Refund payment
  refundPayment(paymentId, amount) {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      return { success: false, message: 'Payment not found' };
    }
    
    payment.status = 'refunded';
    payment.refundAmount = amount;
    payment.refundedAt = new Date();
    
    console.log(`🔄 Refunded ₹${amount} for payment ${paymentId}`);
    return { success: true, message: 'Refund processed successfully' };
  }

  getPaymentStatus(paymentId) {
    const payment = this.payments.get(paymentId);
    if (!payment) {
      return { success: false, message: 'Payment not found' };
    }
    return { success: true, status: payment.status, payment };
  }
}

module.exports = new PaymentGateway();
