// Front/src/services/axios.ts
import axios from 'axios';

const apiClient = axios.create({
  // Utilise VITE_API_URL pour être raccord avec Vercel et api.ts
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://demotada.onrender.com',
  withCredentials: true 
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;