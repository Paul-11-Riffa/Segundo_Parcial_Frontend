// src/services/admin/categoryService.js
import api from '../api';

const CATEGORIES_URL = '/shop/categories/';

/**
 * Servicio para gestión de categorías
 */
const categoryService = {
  /**
   * Obtener todas las categorías
   * @returns {Promise<Array>} Lista de categorías
   */
  async getAll() {
    try {
      console.log('[categoryService] Fetching categories...');
      const response = await api.get(CATEGORIES_URL);
      console.log('[categoryService] Raw response:', response);
      console.log('[categoryService] Response data type:', typeof response.data);
      console.log('[categoryService] Response data:', response.data);
      
      // Asegurar que devolvemos un array
      const data = Array.isArray(response.data) ? response.data : [];
      console.log('[categoryService] Categories fetched:', data.length);
      return data;
    } catch (error) {
      console.error('[categoryService] Error fetching categories:', error);
      console.error('[categoryService] Error response:', error.response);
      throw error;
    }
  },

  /**
   * Obtener una categoría por slug
   * @param {string} slug - Slug de la categoría
   * @returns {Promise<Object>} Categoría
   */
  async getBySlug(slug) {
    try {
      console.log('[categoryService] Fetching category by slug:', slug);
      const response = await api.get(`${CATEGORIES_URL}${slug}/`);
      console.log('[categoryService] Category fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('[categoryService] Error fetching category:', error);
      throw error;
    }
  },

  /**
   * Crear una nueva categoría
   * @param {Object} categoryData - Datos de la categoría
   * @param {string} categoryData.name - Nombre
   * @param {string} categoryData.slug - Slug (único, sin espacios)
   * @returns {Promise<Object>} Categoría creada
   */
  async create(categoryData) {
    try {
      console.log('[categoryService] Creating category:', categoryData);
      const response = await api.post(CATEGORIES_URL, categoryData);
      console.log('[categoryService] Category created:', response.data);
      return response.data;
    } catch (error) {
      console.error('[categoryService] Error creating category:', error);
      throw error;
    }
  },

  /**
   * Actualizar una categoría existente
   * @param {string} slug - Slug de la categoría
   * @param {Object} categoryData - Datos a actualizar
   * @returns {Promise<Object>} Categoría actualizada
   */
  async update(slug, categoryData) {
    try {
      console.log('[categoryService] Updating category:', slug, categoryData);
      const response = await api.patch(`${CATEGORIES_URL}${slug}/`, categoryData);
      console.log('[categoryService] Category updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('[categoryService] Error updating category:', error);
      throw error;
    }
  },

  /**
   * Eliminar una categoría
   * @param {string} slug - Slug de la categoría
   * @returns {Promise<void>}
   */
  async delete(slug) {
    try {
      console.log('[categoryService] Deleting category:', slug);
      await api.delete(`${CATEGORIES_URL}${slug}/`);
      console.log('[categoryService] Category deleted successfully');
    } catch (error) {
      console.error('[categoryService] Error deleting category:', error);
      throw error;
    }
  },
};

export default categoryService;
