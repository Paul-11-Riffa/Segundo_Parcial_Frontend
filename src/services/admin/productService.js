// src/services/admin/productService.js
import api from '../api';

const PRODUCTS_URL = '/shop/products/';

/**
 * Servicio para gestión de productos (inventario)
 */
const productService = {
  /**
   * Obtener lista de productos con filtros opcionales
   * @param {Object} params - Parámetros de filtrado
   * @param {string} params.search - Búsqueda en nombre/descripción
   * @param {string} params.category_slug - Filtrar por categoría
   * @param {number} params.price_min - Precio mínimo
   * @param {number} params.price_max - Precio máximo
   * @param {number} params.stock_min - Stock mínimo
   * @param {boolean} params.in_stock - Solo productos disponibles
   * @param {string} params.ordering - Campo de ordenamiento (price, -price, name, -name, stock, -stock, created_at, -created_at)
   * @returns {Promise<Array>} Lista de productos
   */
  async getAll(params = {}) {
    try {
      console.log('[productService] Fetching products with params:', params);
      
      // Limpiar parámetros undefined
      const cleanParams = Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
      );
      
      const response = await api.get(PRODUCTS_URL, { params: cleanParams });
      console.log('[productService] Raw response:', response);
      console.log('[productService] Response data type:', typeof response.data);
      console.log('[productService] Response data:', response.data);
      
      // Asegurar que devolvemos un array
      const data = Array.isArray(response.data) ? response.data : [];
      console.log('[productService] Products fetched:', data.length);
      return data;
    } catch (error) {
      console.error('[productService] Error fetching products:', error);
      console.error('[productService] Error response:', error.response);
      throw error;
    }
  },

  /**
   * Obtener un producto por ID
   * @param {number} id - ID del producto
   * @returns {Promise<Object>} Producto
   */
  async getById(id) {
    try {
      console.log('[productService] Fetching product:', id);
      const response = await api.get(`${PRODUCTS_URL}${id}/`);
      console.log('[productService] Product fetched:', response.data);
      return response.data;
    } catch (error) {
      console.error('[productService] Error fetching product:', error);
      throw error;
    }
  },

  /**
   * Crear un nuevo producto
   * @param {Object} productData - Datos del producto
   * @param {string} productData.name - Nombre
   * @param {string} productData.description - Descripción
   * @param {number} productData.price - Precio
   * @param {number} productData.stock - Stock
   * @param {number} productData.category - ID de categoría
   * @returns {Promise<Object>} Producto creado
   */
  async create(productData) {
    try {
      console.log('[productService] Creating product:', productData);
      const response = await api.post(PRODUCTS_URL, productData);
      console.log('[productService] Product created:', response.data);
      return response.data;
    } catch (error) {
      console.error('[productService] Error creating product:', error);
      throw error;
    }
  },

  /**
   * Actualizar un producto existente
   * @param {number} id - ID del producto
   * @param {Object} productData - Datos a actualizar
   * @returns {Promise<Object>} Producto actualizado
   */
  async update(id, productData) {
    try {
      console.log('[productService] Updating product:', id, productData);
      const response = await api.patch(`${PRODUCTS_URL}${id}/`, productData);
      console.log('[productService] Product updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('[productService] Error updating product:', error);
      throw error;
    }
  },

  /**
   * Eliminar un producto
   * @param {number} id - ID del producto
   * @returns {Promise<void>}
   */
  async delete(id) {
    try {
      console.log('[productService] Deleting product:', id);
      await api.delete(`${PRODUCTS_URL}${id}/`);
      console.log('[productService] Product deleted successfully');
    } catch (error) {
      console.error('[productService] Error deleting product:', error);
      throw error;
    }
  },

  /**
   * Subir o actualizar imagen de un producto
   * @param {number} id - ID del producto
   * @param {File} imageFile - Archivo de imagen
   * @returns {Promise<Object>} Producto con imagen actualizada
   */
  async uploadImage(id, imageFile) {
    try {
      console.log('[productService] Uploading image for product:', id);
      
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await api.post(`${PRODUCTS_URL}${id}/upload_image/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('[productService] Image uploaded:', response.data);
      return response.data.product; // Backend retorna { message, product }
    } catch (error) {
      console.error('[productService] Error uploading image:', error);
      throw error;
    }
  },

  /**
   * Eliminar imagen de un producto
   * @param {number} id - ID del producto
   * @returns {Promise<Object>} Respuesta del servidor
   */
  async deleteImage(id) {
    try {
      console.log('[productService] Deleting image for product:', id);
      const response = await api.delete(`${PRODUCTS_URL}${id}/delete_image/`);
      console.log('[productService] Image deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('[productService] Error deleting image:', error);
      throw error;
    }
  },

  /**
   * Limpiar imágenes rotas de todos los productos
   * @returns {Promise<Object>} Resultado de la limpieza
   */
  async cleanBrokenImages() {
    try {
      console.log('[productService] Cleaning broken images...');
      const response = await api.post(`${PRODUCTS_URL}clean_broken_images/`);
      console.log('[productService] Broken images cleaned:', response.data);
      return response.data;
    } catch (error) {
      console.error('[productService] Error cleaning broken images:', error);
      throw error;
    }
  },

  /**
   * Obtener productos con stock bajo (< 10)
   * @returns {Promise<Array>} Productos con stock bajo
   */
  async getLowStock() {
    try {
      console.log('[productService] Fetching low stock products...');
      const response = await api.get(PRODUCTS_URL, {
        params: { stock_min: 1, ordering: 'stock' }
      });
      
      // Filtrar en el cliente productos con stock < 10
      const lowStockProducts = response.data.filter(p => p.stock < 10);
      console.log('[productService] Low stock products:', lowStockProducts.length);
      return lowStockProducts;
    } catch (error) {
      console.error('[productService] Error fetching low stock products:', error);
      throw error;
    }
  },

  /**
   * Obtener productos sin stock (= 0)
   * @returns {Promise<Array>} Productos sin stock
   */
  async getOutOfStock() {
    try {
      console.log('[productService] Fetching out of stock products...');
      const response = await api.get(PRODUCTS_URL, {
        params: { ordering: 'name' }
      });
      
      // Filtrar productos con stock = 0
      const outOfStockProducts = response.data.filter(p => p.stock === 0);
      console.log('[productService] Out of stock products:', outOfStockProducts.length);
      return outOfStockProducts;
    } catch (error) {
      console.error('[productService] Error fetching out of stock products:', error);
      throw error;
    }
  },

  /**
   * Actualizar solo el stock de un producto
   * @param {number} id - ID del producto
   * @param {number} newStock - Nuevo valor de stock
   * @returns {Promise<Object>} Producto actualizado
   */
  async updateStock(id, newStock) {
    try {
      console.log('[productService] Updating stock for product:', id, 'New stock:', newStock);
      const response = await api.patch(`${PRODUCTS_URL}${id}/`, { stock: newStock });
      console.log('[productService] Stock updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('[productService] Error updating stock:', error);
      throw error;
    }
  },
};

export default productService;
