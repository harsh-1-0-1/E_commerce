import api from './api';

export const productService = {
  async getProducts(params = {}) {
    const response = await api.get('/products/', { params });
    return response.data.data; // Extract data array from standardized response
  },

  async getProduct(productId) {
    const response = await api.get(`/products/${productId}`);
    return response.data.data; // Extract data object
  },
};

