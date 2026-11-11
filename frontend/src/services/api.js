import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach Bearer token if stored in localStorage
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('dulia_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses for clear error messages
API.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = error.response?.data?.message;

    if (!message) {
      if (error.response?.status === 404) {
        message = 'Cannot connect to API backend (404 Not Found). Please verify that the backend server is running on port 5001.';
      } else if (error.code === 'ERR_NETWORK' || !error.response) {
        message = 'Backend server is not reachable. Please ensure the backend server is started.';
      } else {
        message = error.message || 'Something went wrong. Please check your connection and try again.';
      }
    }

    return Promise.reject(new Error(message));
  }
);

export default API;
