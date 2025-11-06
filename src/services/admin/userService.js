import api from '../apiConfig';

/**
 * userService - Servicio para gestión de usuarios (Admin)
 * Endpoints: /api/users/
 */

const userService = {
  /**
   * Obtener lista de todos los usuarios
   * GET /api/users/
   * 
   * @returns {Promise} Array de usuarios con sus perfiles
   */
  getAllUsers: async () => {
    try {
      const response = await api.get('/users/');
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  /**
   * Obtener un usuario específico por ID
   * GET /api/users/:id/
   * 
   * @param {number} userId - ID del usuario
   * @returns {Promise} Datos del usuario
   */
  getUserById: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Crear nuevo usuario
   * POST /api/users/
   * 
   * @param {Object} userData - Datos del usuario
   * @param {string} userData.username - Username (requerido, único)
   * @param {string} userData.email - Email (requerido, único)
   * @param {string} userData.password - Password (requerido)
   * @param {string} userData.first_name - Nombre
   * @param {string} userData.last_name - Apellido
   * @param {boolean} userData.is_active - Estado activo
   * @param {Object} userData.profile - Perfil del usuario
   * @param {string} userData.profile.role - Rol: 'ADMIN' o 'CLIENT'
   * @returns {Promise} Usuario creado
   */
  createUser: async (userData) => {
    try {
      const response = await api.post('/users/', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  /**
   * Actualizar usuario existente
   * PUT /api/users/:id/
   * 
   * @param {number} userId - ID del usuario
   * @param {Object} userData - Datos a actualizar
   * @returns {Promise} Usuario actualizado
   */
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/users/${userId}/`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error updating user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Actualizar parcialmente un usuario
   * PATCH /api/users/:id/
   * 
   * @param {number} userId - ID del usuario
   * @param {Object} userData - Campos a actualizar
   * @returns {Promise} Usuario actualizado
   */
  patchUser: async (userId, userData) => {
    try {
      const response = await api.patch(`/users/${userId}/`, userData);
      return response.data;
    } catch (error) {
      console.error(`Error patching user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar usuario
   * DELETE /api/users/:id/
   * 
   * @param {number} userId - ID del usuario a eliminar
   * @returns {Promise} Respuesta de eliminación
   */
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener solo clientes (role='CLIENT')
   * GET /api/users/clients/
   * 
   * @returns {Promise} Array de usuarios clientes
   */
  getClients: async () => {
    try {
      const response = await api.get('/users/clients/');
      return response.data;
    } catch (error) {
      console.error('Error fetching clients:', error);
      throw error;
    }
  },
};

export default userService;
