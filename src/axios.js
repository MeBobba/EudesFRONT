// src/axios.js
import axios from 'axios';
import router from './router';

const api = axios.create({
    baseURL: process.env.VUE_APP_API_URL || 'http://localhost:3000',
});

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            // Token invalide ou expiré, forcer la déconnexion
            localStorage.removeItem('token');
            router.push('/login');
        }
        return Promise.reject(error);
    }
);

export default api;
