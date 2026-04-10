import axios from 'axios';

const api = axios.create({
  // Utilise la variable d'env Vercel, ou l'URL Render en secours
  baseURL: 'https://demotada.onrender.com',
  timeout: 30000,
  withCredentials: true 
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