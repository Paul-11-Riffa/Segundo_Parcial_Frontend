/**
 * Servicio para gestionar el carrito de compras
 * Maneja todas las peticiones relacionadas con /api/sales/
 * 
 * IMPORTANTE: Usa el mismo formato de token que el resto de la API (Token, no Bearer)
 */

import axios from 'axios';

// ✅ CORREGIDO: Base URL específica para el módulo de ventas/carrito
const SALES_API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api/sales`
  : 'http://localhost:8000/api/sales';

/**
 * Obtiene los headers de autenticación con formato Token (Django REST Framework)
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    throw new Error('No hay token de autenticación. Por favor, inicia sesión.');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Token ${token}` // ✅ Token (igual que apiConfig.js)
  };
};

/**
 * Maneja errores de API de forma consistente
 * @param {Error} error - Error de axios
 * @returns {never} - Lanza un error formateado
 */
const handleApiError = (error) => {
  // Error de red (sin respuesta del servidor)
  if (!error.response) {
    throw new Error('Error de conexión. Verifica tu conexión a internet.');
  }

  const { status, data } = error.response;

  // Errores específicos por código HTTP
  switch (status) {
    case 401:
      // ⚠️ NO desloguear automáticamente aquí
      // El interceptor de apiConfig.js ya maneja esto de forma global
      // Solo lanzar el error para que el componente lo maneje
      throw new Error('No autorizado. Verifica tu sesión.');
    
    case 403:
      throw new Error('No tienes permisos para realizar esta acción.');
    
    case 404:
      throw new Error(data.error || 'Recurso no encontrado.');
    
    case 400:
      // Errores de validación del backend
      throw new Error(data.error || 'Datos inválidos. Verifica la información.');
    
    case 500:
      throw new Error('Error del servidor. Intenta nuevamente más tarde.');
    
    default:
      throw new Error(data.error || 'Error desconocido al procesar la solicitud.');
  }
};

// ============================================================================
// SERVICIO DEL CARRITO
// ============================================================================

const cartService = {
  /**
   * Obtiene el carrito actual del usuario
   * Si no existe, el backend crea uno nuevo automáticamente
   * 
   * @returns {Promise<Order>} - Carrito actual (estado PENDING)
   * @throws {Error} - Si no está autenticado o hay error del servidor
   */
  getCart: async () => {
    try {
      const response = await axios.get(`${SALES_API_BASE_URL}/cart/`, {
        headers: getAuthHeaders(),
        // ✅ Anti-cache: Forzar petición fresca
        params: {
          _cacheBust: Date.now()
        }
      });

      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Añade un producto al carrito
   * Si el producto ya existe, incrementa la cantidad
   * 
   * @param {number} productId - ID del producto a añadir
   * @param {number} quantity - Cantidad a añadir (default: 1)
   * @returns {Promise<Order>} - Carrito actualizado
   * @throws {Error} - Si no hay stock suficiente o producto no existe
   */
  addToCart: async (productId, quantity = 1) => {
    try {
      const response = await axios.post(
        `${SALES_API_BASE_URL}/cart/`,
        {
          product_id: productId,
          quantity: quantity
        },
        {
          headers: getAuthHeaders()
        }
      );
      
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Actualiza la cantidad de un item en el carrito
   * Si quantity es 0, el item se elimina automáticamente
   * 
   * @param {number} itemId - ID del OrderItem a actualizar
   * @param {number} quantity - Nueva cantidad (0 = eliminar)
   * @returns {Promise<Order>} - Carrito actualizado
   * @throws {Error} - Si no hay stock suficiente o item no existe
   */
  updateItemQuantity: async (itemId, quantity) => {
    try {
      const response = await axios.put(
        `${SALES_API_BASE_URL}/cart/items/${itemId}/`,
        { quantity },
        {
          headers: getAuthHeaders()
        }
      );
      
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Elimina un item del carrito
   * 
   * @param {number} itemId - ID del OrderItem a eliminar
   * @returns {Promise<Order>} - Carrito actualizado sin el item
   * @throws {Error} - Si el item no existe o no pertenece al usuario
   */
  removeItem: async (itemId) => {
    try {
      const response = await axios.delete(
        `${SALES_API_BASE_URL}/cart/items/${itemId}/`,
        {
          headers: getAuthHeaders()
        }
      );
      
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Inicia el proceso de checkout (pago)
   * Cambia el estado de la orden a PROCESSING y crea sesión de Stripe
   * 
   * @returns {Promise<{checkout_url: string}>} - URL de Stripe Checkout
   * @throws {Error} - Si el carrito está vacío o hay error al crear sesión
   */
  checkout: async () => {
    try {
      const response = await axios.post(
        `${SALES_API_BASE_URL}/checkout/`,
        {},
        {
          headers: getAuthHeaders()
        }
      );
      
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Completa una orden después del pago exitoso en Stripe
   * Solo debe llamarse desde la página de éxito (/order/success)
   * Cambia el estado a COMPLETED, reduce stock y crea nuevo carrito vacío
   * 
   * @returns {Promise<{success: boolean, message: string, order_id: number}>}
   * @throws {Error} - Si no hay orden para completar o ya fue completada
   */
  completeOrder: async () => {
    try {
      const response = await axios.post(
        `${SALES_API_BASE_URL}/complete-order/`,
        {},
        {
          headers: getAuthHeaders()
        }
      );
      
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  /**
   * Obtiene el historial de órdenes del usuario
   * Solo retorna órdenes completadas o canceladas (no carritos pendientes)
   * 
   * @returns {Promise<Order[]>} - Array de órdenes ordenadas por fecha
   * @throws {Error} - Si hay error al obtener el historial
   */
  getOrderHistory: async () => {
    try {
      const response = await axios.get(
        `${SALES_API_BASE_URL}/my-orders/`,
        {
          headers: getAuthHeaders()
        }
      );
      
      console.log('🔍 CartService - Response status:', response.status);
      console.log('🔍 CartService - Response data:', response.data);
      console.log('🔍 CartService - Data type:', typeof response.data);
      console.log('🔍 CartService - Is array?', Array.isArray(response.data));
      
      return response.data;
    } catch (error) {
      console.error('❌ CartService - Error en getOrderHistory:', error);
      console.error('❌ CartService - Error response:', error.response?.data);
      handleApiError(error);
    }
  },

  /**
   * Descarga el comprobante PDF de una orden completada
   * 
   * @param {number} orderId - ID de la orden
   * @returns {Promise<{success: boolean}>} - Resultado de la descarga
   * @throws {Error} - Si la orden no existe o no es COMPLETED
   */
  downloadReceipt: async (orderId) => {
    try {
      console.log('🔐 Intentando descargar comprobante para orden:', orderId);
      console.log('🔑 Headers:', getAuthHeaders());
      
      const response = await axios.get(
        `${SALES_API_BASE_URL}/sales-history/${orderId}/receipt/`,
        {
          headers: getAuthHeaders(),
          responseType: 'blob' // 🔴 CRÍTICO: Debe ser blob para archivos binarios
        }
      );

      console.log('✅ Comprobante descargado exitosamente');

      // Crear un blob del PDF
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Crear URL temporal
      const url = window.URL.createObjectURL(blob);
      
      // Crear link temporal y simular click
      const link = document.createElement('a');
      link.href = url;
      link.download = `comprobante_orden_${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error al descargar comprobante:', error);
      console.error('📊 Error response:', error.response);
      console.error('📊 Error status:', error.response?.status);
      console.error('📊 Error data:', error.response?.data);
      
      if (error.response?.status === 404) {
        throw new Error('Comprobante no disponible para esta orden');
      }
      
      if (error.response?.status === 403) {
        // Intentar leer el mensaje de error del backend (aunque sea blob)
        if (error.response.data instanceof Blob) {
          try {
            const text = await error.response.data.text();
            console.log('📄 Mensaje del backend:', text);
            const errorData = JSON.parse(text);
            console.log('📄 Error parseado:', errorData);
            throw new Error(errorData.error || errorData.detail || errorData.message || 'No tienes permisos para descargar este comprobante');
          } catch (parseError) {
            console.log('⚠️ No se pudo parsear el error:', parseError);
            throw new Error('Esta orden no te pertenece o no está completada');
          }
        }
        throw new Error('No tienes permisos para descargar este comprobante');
      }
      
      handleApiError(error);
    }
  }
};

export default cartService;
