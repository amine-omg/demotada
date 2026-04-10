import axios from 'axios';

const api = axios.create({
  // Vérifie bien que VITE_API_URL est utilisé ici
  baseURL: import.meta.env.VITE_API_URL || 'https://demotada.onrender.com',
  timeout: 30000,
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;