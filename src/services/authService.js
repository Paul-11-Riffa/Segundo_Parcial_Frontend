/**
 * Servicio de Autenticación
 * Maneja todas las operaciones relacionadas con usuarios:
 * - Registro, login, logout
 * - Gestión de perfil
 * - Recuperación de contraseña
 */

import api from './apiConfig';

const authService = {
  // ========== REGISTRO Y LOGIN ==========
  
  /**
   * Registra un nuevo usuario en el sistema
   * @param {Object} userData - Datos del usuario (username, email, password, etc.)
   * @returns {Promise<Object>} - Datos del usuario registrado y token
   */
  register: async (userData) => {
    try {
      // 1. Registro para obtener el token
      const response = await api.post('/register/', userData);

      if (response.data.token) {
        const token = response.data.token;
        localStorage.setItem('authToken', token);

        // 2. Obtener perfil con rol (petición adicional)
        const profileResponse = await api.get('/profile/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });

        const profileData = profileResponse.data;
        const role = profileData.profile?.role || 'CLIENT'; // Por defecto: CLIENT

        // 3. Guardar usuario con rol
        const user = {
          id: response.data.user_id,
          email: response.data.email,
          username: response.data.username,
          role: role,
          isAdmin: role === 'ADMIN',
        };

        localStorage.setItem('user', JSON.stringify(user));

        return {
          ...response.data,
          role: role,
          isAdmin: role === 'ADMIN',
        };
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error en el registro' };
    }
  },

  /**
   * Inicia sesión de un usuario
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} - Datos del usuario y token
   */
  login: async (username, password) => {
    try {
      // 1. Login para obtener el token
      const response = await api.post('/login/', { username, password });

      if (response.data.token) {
        const token = response.data.token;
        localStorage.setItem('authToken', token);

        // 2. Obtener perfil con rol (petición adicional requerida por el backend)
        const profileResponse = await api.get('/profile/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });

        const profileData = profileResponse.data;
        const role = profileData.profile?.role || 'CLIENT'; // Rol del backend: "ADMIN" o "CLIENT"

        // 3. Guardar usuario con rol
        const userData = {
          id: response.data.user_id,
          email: response.data.email,
          username: response.data.username,
          role: role,
          isAdmin: role === 'ADMIN', // Comparar con "ADMIN" según el backend
        };

        localStorage.setItem('user', JSON.stringify(userData));

        // Retornar datos completos
        return {
          ...response.data,
          role: role,
          isAdmin: role === 'ADMIN',
        };
      }

      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error en el login' };
    }
  },

  /**
   * Cierra la sesión del usuario actual
   */
  logout: async () => {
    try {
      await api.post('/logout/');
    } catch (error) {
      console.error('Error al hacer logout:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
  },

  // ========== GESTIÓN DE PERFIL ==========

  /**
   * Obtiene el perfil del usuario actual
   * @returns {Promise<Object>} - Datos del perfil del usuario
   */
  getProfile: async () => {
    try {
      const response = await api.get('/profile/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener el perfil' };
    }
  },

  /**
   * Actualiza el perfil del usuario actual
   * @param {Object} profileData - Datos del perfil a actualizar
   * @returns {Promise<Object>} - Datos del perfil actualizado
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/profile/', profileData);

      // Actualizar datos en localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const role = response.data.profile?.role || currentUser.role || 'CLIENT';

      const updatedUser = {
        ...currentUser,
        id: response.data.id,
        username: response.data.username,
        email: response.data.email,
        role: role,
        isAdmin: role === 'ADMIN',
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al actualizar el perfil' };
    }
  },

  // ========== RECUPERACIÓN DE CONTRASEÑA ==========

  /**
   * Solicita un reset de contraseña por email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object>} - Mensaje de confirmación y URL de reset
   */
  requestPasswordReset: async (email) => {
    try {
      const response = await api.post('/password-reset/', { email });
      return response.data; // Retorna { detail, reset_url }
    } catch (error) {
      throw error.response?.data || { message: 'Error al solicitar reset de contraseña' };
    }
  },

  /**
   * Confirma el reset de contraseña con token
   * @param {string} uidb64 - ID del usuario codificado en base64
   * @param {string} token - Token de seguridad
   * @param {string} password - Nueva contraseña
   * @returns {Promise<Object>} - Mensaje de confirmación
   */
  confirmPasswordReset: async (uidb64, token, password) => {
    try {
      const response = await api.post('/password-reset/confirm/', {
        uidb64,
        token,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al resetear la contraseña' };
    }
  },

  // ========== UTILIDADES ==========

  /**
   * Verifica si hay un usuario autenticado
   * @returns {boolean} - true si hay token válido
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  /**
   * Obtiene el usuario actual del localStorage
   * @returns {Object|null} - Datos del usuario o null
   */
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Verifica si el usuario actual es administrador
   * @returns {boolean} - true si es admin
   */
  isAdmin: () => {
    const user = authService.getCurrentUser();
    return user?.isAdmin || user?.role === 'ADMIN';
  },
};

export default authService;
