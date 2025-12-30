import api from './api';

export const inventoryService = {
  async getInventory(productId) {
    const response = await api.get(`/inventory/${productId}`);
    return response.data.data; // Extract data object
  },

  async createInventory(productId, totalStock) {
    const response = await api.post('/inventory/', {
      product_id: productId,
      total_stock: totalStock,
    });
    return response.data.data;
  },

  async updateInventory(productId, totalStock) {
    const response = await api.put(`/inventory/${productId}`, {
      total_stock: totalStock,
    });
    return response.data.data;
  },
};

