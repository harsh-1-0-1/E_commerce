import api from './api';

export const cartService = {
  async getCart() {
    const response = await api.get('/cart/');
    return response.data.data; // Extract cart object
  },

  async addItem(productId, quantity) {
    const response = await api.post('/cart/items', {
      product_id: productId,
      quantity,
    });
    return response.data.data;
  },

  async updateItem(itemId, quantity) {
    const response = await api.patch(`/cart/items/${itemId}`, {
      quantity,
    });
    return response.data.data;
  },

  async removeItem(itemId) {
    await api.delete(`/cart/items/${itemId}`);
  },

  async clearCart() {
    await api.delete('/cart/');
  },
};

