/**
 * Servicio del Dashboard Administrativo
 * Maneja todas las operaciones del dashboard de ML:
 * - Estadísticas en tiempo real
 * - Predicciones de ventas
 * - Alertas de stock
 * - Entrenamiento de modelos ML
 * - Reportes avanzados
 * - Sistema de auditoría
 */

import api from './apiConfig';

const dashboardService = {
  
  // ========== DASHBOARD EN TIEMPO REAL ==========
  
  /**
   * Obtiene estadísticas en tiempo real del negocio
   * GET /api/orders/dashboard/realtime/
   * Caché: 5 minutos | Permisos: Solo admin
   * @returns {Promise<Object>} - KPIs en tiempo real del negocio
   */
  getDashboardRealtime: async () => {
    try {
      const response = await api.get('/orders/dashboard/realtime/');
      return response.data;
    } catch (error) {
      // Propagar el error completo para que el hook pueda manejarlo mejor
      if (error.response) {
        // Error de respuesta del servidor (4xx, 5xx)
        throw error;
      } else if (error.request) {
        // La petición se hizo pero no hubo respuesta (servidor caído)
        throw error;
      } else {
        // Error al configurar la petición
        throw error;
      }
    }
  },

  /**
   * Invalida el caché del dashboard para forzar actualización
   * POST /api/orders/dashboard/invalidate-cache/
   * @returns {Promise<Object>} - Confirmación de invalidación
   */
  invalidateDashboardCache: async () => {
    try {
      const response = await api.post('/orders/dashboard/invalidate-cache/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al invalidar caché' };
    }
  },

  /**
   * Obtiene análisis de rendimiento de productos
   * @param {number|null} productId - ID del producto específico (opcional)
   * @returns {Promise<Object>} - Análisis de productos
   */
  getProductsAnalysis: async (productId = null) => {
    try {
      const url = productId 
        ? `/orders/dashboard/products/${productId}/`
        : '/orders/dashboard/products/';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener análisis de productos' };
    }
  },

  /**
   * Obtiene insights de comportamiento de clientes
   * @param {number|null} customerId - ID del cliente específico (opcional)
   * @returns {Promise<Object>} - Análisis de clientes
   */
  getCustomersAnalysis: async (customerId = null) => {
    try {
      const url = customerId
        ? `/orders/dashboard/customers/${customerId}/`
        : '/orders/dashboard/customers/';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener análisis de clientes' };
    }
  },

  // ========== PREDICCIONES ML DE VENTAS ==========

  /**
   * Entrena un nuevo modelo de predicción ML
   * POST /api/orders/ml/train/
   * @param {Object|string} params - Parámetros de entrenamiento o notas (compatibilidad)
   * @param {number} params.training_days - Número de días de datos históricos
   * @param {string} params.notes - Notas sobre el entrenamiento
   * @param {string} params.version - Versión del modelo
   * @returns {Promise<Object>} - Resultado del entrenamiento
   */
  trainMLModel: async (params = {}) => {
    try {
      // Compatibilidad: si params es string, convertir a objeto con notes
      const body = typeof params === 'string' 
        ? { notes: params } 
        : params;

      const response = await api.post('/orders/ml/train/', body);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al entrenar modelo ML' };
    }
  },

  /**
   * Obtiene predicciones de ventas futuras
   * @param {Object|number} params - Parámetros de predicción o número de días
   * @param {number} params.days - Número de días a predecir (1-365)
   * @param {boolean} params.include_historical - Incluir datos históricos
   * @param {boolean} params.chart_format - Formato para gráficas
   * @returns {Promise<Object>} - Predicciones de ventas
   */
  getMLPredictions: async (params = {}) => {
    try {
      // Compatibilidad: si params es un número, convertir a objeto
      const queryParams = typeof params === 'number'
        ? { days: params }
        : params;

      const response = await api.get('/orders/ml/predictions/', {
        params: queryParams
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener predicciones ML' };
    }
  },

  /**
   * Dashboard principal de predicciones optimizado para gráficas
   * @param {Object} params - Parámetros de configuración
   * @param {boolean} params.includeHistorical - Incluir datos históricos
   * @param {boolean} params.chartFormat - Formato para gráficas
   * @returns {Promise<Object>} - Dashboard de predicciones
   */
  getPredictionsSalesDashboard: async (params = {}) => {
    try {
      const { includeHistorical = true, chartFormat = true } = params;
      const response = await api.get('/orders/dashboard/predictions/sales/', {
        params: {
          include_historical: includeHistorical,
          chart_format: chartFormat,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener predicciones de ventas' };
    }
  },

  /**
   * Ranking de productos que se predice venderán más
   * @param {Object} params - Parámetros de filtrado
   * @param {number} params.limit - Número máximo de productos
   * @param {string|null} params.category - Filtrar por categoría
   * @param {boolean} params.chartFormat - Formato para gráficas
   * @returns {Promise<Object>} - Top productos predichos
   */
  getTopProductsPredictions: async (params = {}) => {
    try {
      const { limit = 10, category = null, chartFormat = true } = params;
      const queryParams = {
        limit,
        chart_format: chartFormat,
      };
      if (category) queryParams.category = category;

      const response = await api.get('/orders/dashboard/predictions/top-products/', {
        params: queryParams,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener top productos predichos' };
    }
  },

  /**
   * Dashboard combinado con métricas generales del modelo ML
   * @returns {Promise<Object>} - Dashboard completo de ML
   */
  getMLDashboard: async () => {
    try {
      const response = await api.get('/orders/ml/dashboard/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener dashboard ML' };
    }
  },

  /**
   * Genera datos demo para el modelo ML (solo desarrollo)
   * @returns {Promise<Object>} - Confirmación de generación
   */
  generateDemoData: async () => {
    try {
      const response = await api.post('/orders/ml/generate-demo-data/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al generar datos demo' };
    }
  },

  // ========== PREDICCIONES POR PRODUCTO ==========

  /**
   * Predicción de ventas de un producto específico
   * @param {number} productId - ID del producto
   * @param {Object} params - Parámetros de predicción
   * @param {number} params.days - Días a predecir
   * @param {boolean} params.confidence - Incluir intervalo de confianza
   * @returns {Promise<Object>} - Predicción del producto
   */
  getProductPrediction: async (productId, params = {}) => {
    try {
      const { days = 30, confidence = true } = params;
      const response = await api.get(`/orders/predictions/product/${productId}/`, {
        params: { days, confidence },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener predicción del producto' };
    }
  },

  /**
   * Predicción agregada de ventas de una categoría
   * @param {number} categoryId - ID de la categoría
   * @param {number} days - Días a predecir
   * @returns {Promise<Object>} - Predicción de la categoría
   */
  getCategoryPrediction: async (categoryId, days = 30) => {
    try {
      const response = await api.get(`/orders/predictions/category/${categoryId}/`, {
        params: { days },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener predicción de categoría' };
    }
  },

  /**
   * Lista de productos con alertas de stock
   * @returns {Promise<Array>} - Productos con stock bajo
   */
  getStockAlerts: async () => {
    try {
      const response = await api.get('/orders/predictions/stock-alerts/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener alertas de stock' };
    }
  },

  /**
   * Compara predicciones entre múltiples productos
   * @param {Array<number>|string} productIds - IDs de productos a comparar
   * @param {number} days - Días a predecir
   * @returns {Promise<Object>} - Comparación de predicciones
   */
  comparePredictions: async (productIds = [], days = 30) => {
    try {
      const productsParam = Array.isArray(productIds) ? productIds.join(',') : productIds;
      const response = await api.get('/orders/predictions/compare/', {
        params: { products: productsParam, days },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al comparar predicciones' };
    }
  },

  // ========== RECOMENDACIONES Y TENDENCIAS ==========

  /**
   * Recomendaciones personalizadas para el usuario actual
   * @returns {Promise<Array>} - Productos recomendados
   */
  getRecommendations: async () => {
    try {
      const response = await api.get('/orders/ml/recommendations/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener recomendaciones' };
    }
  },

  /**
   * Productos similares basados en ML
   * @param {number} productId - ID del producto de referencia
   * @returns {Promise<Array>} - Productos similares
   */
  getSimilarProducts: async (productId) => {
    try {
      const response = await api.get(`/orders/ml/similar-products/${productId}/`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener productos similares' };
    }
  },

  /**
   * Productos en tendencia (más vendidos recientemente)
   * @returns {Promise<Array>} - Productos en tendencia
   */
  getTrendingProducts: async () => {
    try {
      const response = await api.get('/orders/ml/trending/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener productos en tendencia' };
    }
  },

  // ========== REPORTES AVANZADOS ==========

  /**
   * Análisis RFM (Recency, Frequency, Monetary) de clientes
   * @param {Object} params - Parámetros del reporte
   * @param {string} params.startDate - Fecha inicio
   * @param {string} params.endDate - Fecha fin
   * @param {string} params.format - Formato: 'json'|'excel'|'pdf'
   * @returns {Promise<Object|Blob>} - Reporte de análisis
   */
  getCustomerAnalysisReport: async (params = {}) => {
    try {
      const { startDate, endDate, format = 'json' } = params;
      const response = await api.post('/orders/reports/customer-analysis/', {
        start_date: startDate,
        end_date: endDate,
        format,
      }, {
        responseType: format !== 'json' ? 'blob' : 'json',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener análisis de clientes' };
    }
  },

  /**
   * Análisis ABC de productos (Principio de Pareto)
   * @param {Object} params - Parámetros del reporte
   * @returns {Promise<Object|Blob>} - Reporte ABC
   */
  getProductABCReport: async (params = {}) => {
    try {
      const { startDate, endDate, format = 'json' } = params;
      const response = await api.post('/orders/reports/product-abc/', {
        start_date: startDate,
        end_date: endDate,
        format,
      }, {
        responseType: format !== 'json' ? 'blob' : 'json',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener análisis ABC' };
    }
  },

  /**
   * Reporte comparativo entre períodos
   * @param {Object} params - Parámetros del reporte
   * @param {string} params.comparison - Tipo: 'previous_month'|'previous_period'
   * @returns {Promise<Object|Blob>} - Reporte comparativo
   */
  getComparativeReport: async (params = {}) => {
    try {
      const { startDate, endDate, comparison = 'previous_month', format = 'json' } = params;
      const response = await api.post('/orders/reports/comparative/', {
        start_date: startDate,
        end_date: endDate,
        comparison,
        format,
      }, {
        responseType: format !== 'json' ? 'blob' : 'json',
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener reporte comparativo' };
    }
  },

  /**
   * Dashboard ejecutivo con KPIs principales
   * @param {Object} params - Parámetros del dashboard
   * @param {string} params.startDate - Fecha inicio
   * @param {string} params.endDate - Fecha fin
   * @returns {Promise<Object>} - Dashboard ejecutivo
   */
  getExecutiveDashboard: async (params = {}) => {
    try {
      const { startDate, endDate } = params;
      const response = await api.post('/orders/reports/dashboard/', {
        start_date: startDate,
        end_date: endDate,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener dashboard ejecutivo' };
    }
  },

  // ========== SISTEMA DE AUDITORÍA ==========

  /**
   * Lista de logs de auditoría con filtros
   * @param {Object} filters - Filtros de búsqueda
   * @param {string} filters.action_type - Tipo de acción
   * @param {number} filters.user - ID del usuario
   * @param {string} filters.start_date - Fecha inicio
   * @param {string} filters.end_date - Fecha fin
   * @param {number} filters.page - Número de página
   * @returns {Promise<Object>} - Logs paginados
   */
  getAuditLogs: async (filters = {}) => {
    try {
      const response = await api.get('/orders/audit/logs/', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener logs de auditoría' };
    }
  },

  /**
   * Estadísticas de auditoría
   * @returns {Promise<Object>} - Estadísticas generales
   */
  getAuditStatistics: async () => {
    try {
      const response = await api.get('/orders/audit/statistics/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener estadísticas de auditoría' };
    }
  },

  /**
   * Sesiones activas en el sistema
   * @returns {Promise<Array>} - Lista de sesiones activas
   */
  getActiveSessions: async () => {
    try {
      const response = await api.get('/orders/audit/sessions/active/');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Error al obtener sesiones activas' };
    }
  },
};

export default dashboardService;
