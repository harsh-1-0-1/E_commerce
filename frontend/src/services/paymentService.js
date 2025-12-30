import api from './api';

export const paymentService = {
  async createOrder(orderData = {}) {
    const response = await api.post('/orders/', {
      shipping_address: orderData.shipping_address || null,
      payment_method: orderData.payment_method || 'razorpay',
    });
    return response.data.data;
  },

  async createPaymentSession(orderId) {
    // Validate orderId
    if (!orderId) {
      throw new Error(`Invalid orderId: ${orderId}`);
    }
    
    // Ensure orderId is a number (convert string to number if needed)
    const numericOrderId = typeof orderId === 'string' ? parseInt(orderId, 10) : orderId;
    if (isNaN(numericOrderId) || numericOrderId <= 0) {
      throw new Error(`Invalid orderId: ${orderId}. Must be a positive number.`);
    }

    console.log('[PaymentService] Creating payment session for order:', numericOrderId);
  
    const response = await api.post('/payments/create-session', {
      order_id: numericOrderId,
    });
  
    console.log('[PaymentService] Payment session created:', response.data.data);
    return response.data.data;
  },
  

  async verifyPayment(paymentData) {
    const response = await api.post('/payments/verify', {
      order_id: paymentData.order_id,
      razorpay_order_id: paymentData.razorpay_order_id,
      razorpay_payment_id: paymentData.razorpay_payment_id,
      razorpay_signature: paymentData.razorpay_signature,
    });
    return response.data.data;
  },

  async getOrder(orderId) {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.data;
  },
};
