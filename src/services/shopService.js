/**
 * Shop Service
 * Servicios para obtener productos de la tienda
 */

import api from './apiConfig';

/**
 * Obtener todos los productos
 * @returns {Promise<Array>} Lista de productos
 */
export const getAllProducts = async () => {
  try {
    const response = await api.get('/shop/products/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

/**
 * Obtener producto por ID
 * @param {number} productId - ID del producto
 * @returns {Promise<Object>} Datos del producto
 */
export const getProductById = async (productId) => {
  try {
    const response = await api.get(`/shop/products/${productId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener producto ${productId}:`, error);
    throw error;
  }
};

/**
 * Buscar productos
 * @param {string} query - Término de búsqueda
 * @returns {Promise<Array>} Productos que coinciden
 */
export const searchProducts = async (query) => {
  try {
    const response = await api.get('/shop/products/', {
      params: { search: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error al buscar productos:', error);
    throw error;
  }
};

/**
 * Filtrar productos por categoría
 * @param {number} categoryId - ID de la categoría
 * @returns {Promise<Array>} Productos de la categoría
 */
export const getProductsByCategory = async (categoryId) => {
  try {
    const response = await api.get('/shop/products/', {
      params: { category: categoryId }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    throw error;
  }
};

/**
 * Obtener categorías
 * @returns {Promise<Array>} Lista de categorías
 */
export const getCategories = async () => {
  try {
    const response = await api.get('/shop/categories/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error;
  }
};
