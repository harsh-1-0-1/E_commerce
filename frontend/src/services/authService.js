import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/users/login', { email, password });
    // Response format: { status_code, message, data: { access_token, token_type } }
    const { data } = response.data;
    if (data && data.access_token) {
      localStorage.setItem('token', data.access_token);
      return data;
    }
    throw new Error('Invalid response from server');
  },

  async register(userData) {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  async getCurrentUser() {
    const response = await api.get('/users/me');
    return response.data.data; // Extract data from standardized response
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  },
};

