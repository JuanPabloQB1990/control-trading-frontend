import axios from 'axios';

const apiBaseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/$/, '');

const api = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000
});

export default api;
