/**
 * Configuración base de Axios para todas las peticiones API
 * Este archivo centraliza la configuración HTTP y los interceptores
 */

import axios from 'axios';

// Base URL de la API
const API_BASE_URL = 'http://localhost:8000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos de timeout para evitar que se quede colgado
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Si el token es inválido, limpiar el localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Usuario no tiene permisos (no es admin)
      console.error('Acceso denegado: Permisos insuficientes');
      // No redirigir automáticamente, dejar que el componente maneje el error
      // Esto permite mostrar un mensaje personalizado
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
