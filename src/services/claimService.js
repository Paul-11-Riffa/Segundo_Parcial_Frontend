const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const CLAIMS_ENDPOINT = `${API_BASE_URL}/api/claims/`;

// Función helper para obtener headers de autenticación
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Token ${token}` : '',
  };
};

class ClaimService {
  /**
   * Listar todos los reclamos del usuario autenticado
   * @returns {Promise<Array>} Lista de reclamos
   */
  async getMyClaims() {
    try {
      const response = await fetch(`${CLAIMS_ENDPOINT}my_claims/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener mis reclamos:', error);
      throw error;
    }
  }

  /**
   * Listar reclamos con filtros y paginación
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Object>} Respuesta paginada con reclamos
   */
  async getClaims(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.damage_type) queryParams.append('damage_type', filters.damage_type);
      if (filters.assigned_to) queryParams.append('assigned_to', filters.assigned_to);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.ordering) queryParams.append('ordering', filters.ordering);
      if (filters.is_resolved !== undefined) queryParams.append('is_resolved', filters.is_resolved);
      if (filters.page) queryParams.append('page', filters.page);

      const url = `${CLAIMS_ENDPOINT}?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener reclamos:', error);
      throw error;
    }
  }

  /**
   * Obtener detalle completo de un reclamo
   * @param {number} claimId - ID del reclamo
   * @returns {Promise<Object>} Detalle del reclamo
   */
  async getClaimDetail(claimId) {
    try {
      const response = await fetch(`${CLAIMS_ENDPOINT}${claimId}/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Reclamo no encontrado');
        }
        if (response.status === 403) {
          throw new Error('No tienes permisos para ver este reclamo');
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener detalle del reclamo:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo reclamo
   * @param {Object} claimData - Datos del reclamo
   * @param {Array<File>} images - Imágenes de evidencia
   * @returns {Promise<Object>} Reclamo creado
   */
  async createClaim(claimData, images = []) {
    try {
      const formData = new FormData();
      
      formData.append('order_id', claimData.order_id);
      formData.append('product_id', claimData.product_id);
      formData.append('title', claimData.title);
      formData.append('description', claimData.description);
      formData.append('damage_type', claimData.damage_type);
      formData.append('priority', claimData.priority || 'MEDIUM');
      
      // Agregar imágenes
      images.forEach((image) => {
        formData.append('images', image);
      });

      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(CLAIMS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Token ${token}` : '',
          // NO incluir Content-Type para FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      return await response.json();
    } catch (error) {
      console.error('Error al crear reclamo:', error);
      throw error;
    }
  }

  /**
   * Agregar imágenes adicionales a un reclamo existente
   * @param {number} claimId - ID del reclamo
   * @param {Array<File>} images - Imágenes a agregar
   * @returns {Promise<Object>} Respuesta con imágenes agregadas
   */
  async addImages(claimId, images) {
    try {
      const formData = new FormData();
      
      images.forEach((image) => {
        formData.append('images', image);
      });

      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`${CLAIMS_ENDPOINT}${claimId}/add_images/`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Token ${token}` : '',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      return await response.json();
    } catch (error) {
      console.error('Error al agregar imágenes:', error);
      throw error;
    }
  }

  /**
   * Agregar feedback del cliente a un reclamo resuelto
   * @param {number} claimId - ID del reclamo
   * @param {number} rating - Calificación (1-5)
   * @param {string} feedback - Comentarios del cliente
   * @returns {Promise<Object>} Reclamo actualizado
   */
  async addFeedback(claimId, rating, feedback) {
    try {
      const response = await fetch(`${CLAIMS_ENDPOINT}${claimId}/add_feedback/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          customer_rating: rating,
          customer_feedback: feedback,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      return await response.json();
    } catch (error) {
      console.error('Error al agregar feedback:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de cambios de un reclamo
   * @param {number} claimId - ID del reclamo
   * @returns {Promise<Array>} Historial de cambios
   */
  async getHistory(claimId) {
    try {
      const response = await fetch(`${CLAIMS_ENDPOINT}${claimId}/history/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener historial:', error);
      throw error;
    }
  }

  /**
   * Eliminar un reclamo
   * @param {number} claimId - ID del reclamo
   * @returns {Promise<void>}
   */
  async deleteClaim(claimId) {
    try {
      const response = await fetch(`${CLAIMS_ENDPOINT}${claimId}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error al eliminar reclamo:', error);
      throw error;
    }
  }

  // ========== MÉTODOS PARA ADMINISTRADORES ==========

  /**
   * Listar TODOS los reclamos (ADMIN)
   * @param {Object} filters - Filtros opcionales
   * @returns {Promise<Array>} Lista de todos los reclamos
   */
  async getAllClaims(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.damage_type) queryParams.append('damage_type', filters.damage_type);
      if (filters.ordering) queryParams.append('ordering', filters.ordering);
      if (filters.page) queryParams.append('page', filters.page);

      const url = `${CLAIMS_ENDPOINT}?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener todos los reclamos:', error);
      throw error;
    }
  }

  /**
   * Actualizar estado y detalles de un reclamo (ADMIN)
   * @param {number} claimId - ID del reclamo
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Reclamo actualizado
   */
  async updateStatus(claimId, updateData) {
    try {
      const response = await fetch(`${CLAIMS_ENDPOINT}${claimId}/update_status/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(JSON.stringify(errorData));
      }

      return await response.json();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de reclamos (ADMIN)
   * @param {Object} params - Parámetros de filtro
   * @returns {Promise<Object>} Estadísticas
   */
  async getStatistics(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.days) queryParams.append('days', params.days);
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);

      const url = `${CLAIMS_ENDPOINT}statistics/?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }
}

// Constantes para uso en el frontend
export const DAMAGE_TYPES = {
  FACTORY_DEFECT: { value: 'FACTORY_DEFECT', label: 'Defecto de Fábrica' },
  SHIPPING_DAMAGE: { value: 'SHIPPING_DAMAGE', label: 'Daño en Envío' },
  WRONG_PRODUCT: { value: 'WRONG_PRODUCT', label: 'Producto Incorrecto' },
  MISSING_PARTS: { value: 'MISSING_PARTS', label: 'Piezas Faltantes' },
  NOT_AS_DESCRIBED: { value: 'NOT_AS_DESCRIBED', label: 'No Coincide con Descripción' },
  OTHER: { value: 'OTHER', label: 'Otro' },
};

export const CLAIM_STATUSES = {
  PENDING: { value: 'PENDING', label: 'Pendiente', color: 'yellow' },
  IN_REVIEW: { value: 'IN_REVIEW', label: 'En Revisión', color: 'blue' },
  REQUIRES_INFO: { value: 'REQUIRES_INFO', label: 'Requiere Información', color: 'orange' },
  APPROVED: { value: 'APPROVED', label: 'Aprobado', color: 'green' },
  REJECTED: { value: 'REJECTED', label: 'Rechazado', color: 'red' },
  RESOLVED: { value: 'RESOLVED', label: 'Resuelto', color: 'green' },
  CLOSED: { value: 'CLOSED', label: 'Cerrado', color: 'gray' },
};

export const PRIORITIES = {
  LOW: { value: 'LOW', label: 'Baja', color: 'gray' },
  MEDIUM: { value: 'MEDIUM', label: 'Media', color: 'blue' },
  HIGH: { value: 'HIGH', label: 'Alta', color: 'orange' },
  URGENT: { value: 'URGENT', label: 'Urgente', color: 'red' },
};

export const RESOLUTION_TYPES = {
  FULL_REFUND: { value: 'FULL_REFUND', label: 'Reembolso Total' },
  PARTIAL_REFUND: { value: 'PARTIAL_REFUND', label: 'Reembolso Parcial' },
  REPLACEMENT: { value: 'REPLACEMENT', label: 'Reemplazo del Producto' },
  REPAIR: { value: 'REPAIR', label: 'Reparación' },
  NONE: { value: 'NONE', label: 'Sin Resolución' },
};

export default new ClaimService();
