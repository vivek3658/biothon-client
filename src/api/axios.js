import axios from 'axios';

const VERCEL_API_HOST = 'https://arogyax-server.vercel.app';
const BASE_URL = import.meta.env.VITE_API_URL || VERCEL_API_HOST;

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT token dynamically
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && token !== 'null' && token.trim() !== '') {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Extract error message & handle network retry fallback
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if ((error.code === 'ERR_NETWORK' || !error.response) && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        originalRequest.baseURL = 'http://127.0.0.1:3000';
        return await axios(originalRequest);
      } catch (retryErr) {
        return Promise.reject(retryErr);
      }
    }
    const message = error.response?.data?.error || error.response?.data?.details || error.message || 'API request failed';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
