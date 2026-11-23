import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach Firebase token if present
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('drivair_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors centrally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and handle session expiration if necessary
      console.warn('Unauthorized request. User may need to sign in again.');
    }
    return Promise.reject(error);
  }
);

export default api;
