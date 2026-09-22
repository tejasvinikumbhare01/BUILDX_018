import axios from 'axios';

const host = typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
export const API_BASE_URL = `http://${host}:5000/api`;


export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT Bearer token if present in localStorage
api.interceptors.request.use((reqConfig) => {
  const token = localStorage.getItem('resqgrid_token');
  if (token && reqConfig.headers) {
    reqConfig.headers.Authorization = `Bearer ${token}`;
  }
  return reqConfig;
});

// Response interceptor to handle 401s gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Optional: Clean up token if expired
    }
    return Promise.reject(error);
  }
);
