/**
 * Configuración base de Axios para todas las peticiones API
 * Este archivo centraliza la configuración HTTP y los interceptores
 */

import axios from 'axios';

// Base URL de la API - Se obtiene de las variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:8000/api';

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // ✅ AJUSTADO: 60 segundos para Neon Database (plan gratuito puede tardar ~30s en despertar)
  timeout: 60000, // 60 segundos (era 30s)
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
      // Obtener la URL que causó el error
      const requestUrl = error.config?.url || '';
      
      // NO desloguear si el error 401 viene del carrito
      // El carrito puede devolver 401 por otros motivos (carrito vacío, etc.)
      if (requestUrl.includes('/sales/cart')) {
        console.warn('[API] Error 401 en carrito, pero manteniendo sesión');
        return Promise.reject(error);
      }
      
      // Para otros endpoints, si es 401 significa token inválido
      // Solo desloguear si NO es una petición de login
      if (!requestUrl.includes('/login/') && !requestUrl.includes('/register/')) {
        console.warn('[API] Token inválido o expirado, cerrando sesión');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
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
