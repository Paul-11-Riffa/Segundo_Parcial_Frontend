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
      console.log('[productService] → is_active enviado:', productData.is_active);
      
      const response = await api.patch(`${PRODUCTS_URL}${id}/`, productData);
      
      console.log('[productService] Product updated:', response.data);
      console.log('[productService] → is_active en respuesta:', response.data.is_active);
      
      return response.data;
    } catch (error) {
      console.error('[productService] Error updating product:', error);
      throw error;
    }
  },

  /**
   * Toggle activo/inactivo de un producto (Endpoint dedicado)
   * @param {number} id - ID del producto
   * @param {boolean} forceState - (Opcional) Forzar un estado específico
   * @returns {Promise<Object>} Respuesta con estado actualizado
   */
  async toggleActive(id, forceState = undefined) {
    try {
      console.log('[productService] 🔄 Toggling active state for product:', id);
      console.log('[productService] 🔄 Force state:', forceState);
      
      const payload = forceState !== undefined ? { is_active: forceState } : {};
      console.log('[productService] 📤 Payload:', payload);
      
      const response = await api.post(`${PRODUCTS_URL}${id}/toggle_active/`, payload);
      
      console.log('[productService] ✅ Toggle response:', response.data);
      return response.data;
    } catch (error) {
      console.error('[productService] ❌ Error toggling product active state:', error);
      console.error('[productService] ❌ Error response:', error.response?.data);
      console.error('[productService] ❌ Error status:', error.response?.status);
      
      // ⭐ FALLBACK: Si el endpoint no existe (404), usar PATCH en su lugar
      if (error.response?.status === 404 || error.response?.status === 405) {
        console.log('[productService] 🔁 Endpoint toggle_active no existe, usando PATCH...');
        
        // Obtener el producto actual para conocer su estado
        const currentProduct = await this.getById(id);
        const newState = forceState !== undefined ? forceState : !currentProduct.is_active;
        
        console.log('[productService] 🔁 Estado actual:', currentProduct.is_active);
        console.log('[productService] 🔁 Nuevo estado:', newState);
        
        // Usar PATCH para actualizar
        const patchResponse = await this.update(id, { is_active: newState });
        
        console.log('[productService] ✅ PATCH response:', patchResponse);
        
        // Retornar en formato similar a toggle_active
        return {
          success: true,
          message: `Producto ${newState ? 'activado' : 'desactivado'} correctamente`,
          product: {
            id: patchResponse.id,
            name: patchResponse.name,
            is_active: patchResponse.is_active
          }
        };
      }
      
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

  // ==========================================
  // GESTIÓN DE MÚLTIPLES IMÁGENES
  // ==========================================

  /**
   * Subir múltiples imágenes para un producto (bulk upload)
   * @param {number} productId - ID del producto
   * @param {Array<Object>} images - Array de objetos con File y metadata
   * @returns {Promise<Object>} Respuesta con imágenes creadas
   */
  /**
   * Subir múltiples imágenes para un producto (bulk upload)
   * @param {number} productId - ID del producto
   * @param {Array<Object>} images - Array de objetos con File y metadata
   * @returns {Promise<Object>} Respuesta con imágenes creadas
   */
  async bulkUploadImages(productId, images) {
    try {
      console.log('[productService] Bulk uploading images for product:', productId);
      console.log('[productService] Images to upload:', images);
      
      const formData = new FormData();
      formData.append('product_id', productId);
      
      // Agregar solo los archivos con el key "images" (como espera el backend)
      images.forEach((img) => {
        if (img.file) {
          formData.append('images', img.file);
          console.log('[productService] Adding image file:', img.file.name);
        }
      });
      
      console.log('[productService] FormData product_id:', productId);
      console.log('[productService] Total files in FormData:', formData.getAll('images').length);
      
      const response = await api.post('/shop/product-images/bulk_upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('[productService] Images uploaded successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[productService] Error bulk uploading images:', error);
      console.error('[productService] Error response:', error.response?.data);
      throw error;
    }
  },

  /**
   * Obtener todas las imágenes de un producto
   * @param {number} productId - ID del producto
   * @returns {Promise<Array>} Array de imágenes
   */
  async getProductImages(productId) {
    try {
      console.log('[productService] 🖼️ Fetching images for product:', productId);
      console.log('[productService] 🖼️ URL:', '/shop/product-images/');
      console.log('[productService] 🖼️ Params:', { product: productId });

      const response = await api.get('/shop/product-images/', {
        params: { product: productId }
      });
      
      console.log('[productService] 📥 Images response:', response.data);
      console.log('[productService] 📊 Images count:', response.data?.length || 0);

      // ✅ NOTA: El backend filtra por product_id usando el query param 'product'
      // El ProductImageSerializer no incluye el campo 'product', pero el filtro se hace en el backend
      if (Array.isArray(response.data) && response.data.length > 0) {
        console.log('[productService] 🔍 Primeras 2 imágenes:');
        console.log('  [0]', { id: response.data[0]?.id, order: response.data[0]?.order, is_primary: response.data[0]?.is_primary });
        if (response.data[1]) {
          console.log('  [1]', { id: response.data[1]?.id, order: response.data[1]?.order, is_primary: response.data[1]?.is_primary });
        }
        console.log('[productService] ✅ Imágenes recibidas (confiando en filtro del backend)');
      }
      
      return response.data;
    } catch (error) {
      console.error('[productService] ❌ Error fetching images:', error);
      console.error('[productService] ❌ Error response:', error.response?.data);
      throw error;
    }
  },

  /**
   * Marcar una imagen como principal
   * @param {number} imageId - ID de la imagen
   * @returns {Promise<Object>} Imagen actualizada
   */
  async setImageAsPrimary(imageId) {
    try {
      console.log('[productService] Setting image as primary:', imageId);
      const response = await api.post(`/shop/product-images/${imageId}/set_primary/`);
      console.log('[productService] Image set as primary:', response.data);
      return response.data;
    } catch (error) {
      console.error('[productService] Error setting primary image:', error);
      throw error;
    }
  },

  /**
   * Reordenar imágenes
   * @param {Array<Object>} imageOrders - Array con {id, order}
   * @returns {Promise<Object>} Resultado
   */
  async reorderImages(imageOrders) {
    try {
      console.log('[productService] Reordering images:', imageOrders);
      const response = await api.post('/shop/product-images/reorder/', {
        reorder_data: imageOrders  // Backend espera "reorder_data", no "image_orders"
      });
      console.log('[productService] Images reordered:', response.data);
      return response.data;
    } catch (error) {
      console.error('[productService] Error reordering images:', error);
      throw error;
    }
  },

  /**
   * Actualizar alt text de una imagen
   * @param {number} imageId - ID de la imagen
   * @param {string} altText - Nuevo alt text
   * @returns {Promise<Object>} Imagen actualizada
   */
  async updateImageAltText(imageId, altText) {
    try {
      console.log('[productService] Updating image alt text:', imageId);
      const response = await api.patch(`/shop/product-images/${imageId}/`, {
        alt_text: altText
      });
      console.log('[productService] Alt text updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('[productService] Error updating alt text:', error);
      throw error;
    }
  },

  /**
   * Eliminar una imagen específica
   * @param {number} imageId - ID de la imagen
   * @returns {Promise<void>}
   */
  async deleteProductImage(imageId) {
    try {
      console.log('[productService] Deleting image:', imageId);
      await api.delete(`/shop/product-images/${imageId}/`);
      console.log('[productService] Image deleted successfully');
    } catch (error) {
      console.error('[productService] Error deleting image:', error);
      throw error;
    }
  },
};

export default productService;
