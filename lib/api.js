// ReviewBoostMobile/lib/api.js

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'https://bloating-jarring-yanking.ngrok-free.dev';
const API_URL = BASE_URL + '/api';

console.log('API URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

// ✅ Add token to EVERY request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = 'Bearer ' + token;
        console.log('Token added to request:', config.url);
      } else {
        console.warn('No token found for request:', config.url);
      }
    } catch (error) {
      console.error('Token error:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
    });

    if (error.response?.status === 401) {
      console.warn('401 - Token invalid or expired');
      await AsyncStorage.multiRemove(['token', 'user']);
    }

    return Promise.reject(error);
  }
);

export const reviewAPI = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/mobile-login', {
      email,
      password,
    });
    return data;
  },

  sendRequest: async (customerData) => {
    const { data } = await api.post('/reviews/send', customerData);
    return data;
  },

  getStats: async () => {
    const { data } = await api.get('/user/stats');
    return data;
  },

  getCustomers: async (params) => {
    const { data } = await api.get('/customers', { params });
    return data;
  },

  deleteCustomer: async (id) => {
    const { data } = await api.delete('/customers/' + id);
    return data;
  },

  updateSettings: async (settingsData) => {
    const { data } = await api.put('/user/update', settingsData);
    return data;
  },

  getProfile: async () => {
    const { data } = await api.get('/user/profile');
    return data;
  },
};

export default api;