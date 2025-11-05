import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardService } from '../services/api';

/**
 * Hook para obtener predicción de un producto específico
 * Incluye caché con TTL de 20 minutos y validación de confianza
 * 
 * @param {Object} options - Opciones de configuración
 * @param {number|string} options.productId - ID del producto
 * @param {number} options.days - Días a predecir (default: 30)
 * @param {number} options.minConfidence - Confianza mínima (0-100, default: 70)
 * @param {boolean} options.includeHistorical - Incluir datos históricos
 * @param {boolean} options.fetchOnMount - Fetch al montar (default: false - requiere productId)
 * @param {number} options.cacheTTL - TTL del caché en ms (default: 1200000 = 20 min)
 * 
 * @returns {Object} Predicción y funciones
 * 
 * @example
 * const { prediction, loading, error, fetchPrediction, isHighConfidence } = useProductPrediction({
 *   productId: 123,
 *   days: 30,
 *   minConfidence: 80
 * });
 */
const useProductPrediction = ({
  productId = null,
  days = 30,
  minConfidence = 70,
  includeHistorical = false,
  fetchOnMount = false,
  cacheTTL = 1200000, // 20 minutos
} = {}) => {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  
  const isMountedRef = useRef(true);
  const cacheRef = useRef({});

  /**
   * Verifica si el caché está vigente
   */
  const isCacheValid = useCallback((cacheKey) => {
    const cached = cacheRef.current[cacheKey];
    if (!cached) return false;

    const now = Date.now();
    const age = now - cached.timestamp;
    return age < cacheTTL;
  }, [cacheTTL]);

  /**
   * Genera la key del caché basada en parámetros
   */
  const getCacheKey = useCallback((prodId) => {
    return `product_${prodId}_${days}_${includeHistorical}`;
  }, [days, includeHistorical]);

  /**
   * Verifica si la predicción tiene alta confianza
   */
  const isHighConfidence = useCallback(() => {
    if (!prediction || !prediction.confidence) return false;
    return prediction.confidence >= minConfidence;
  }, [prediction, minConfidence]);

  /**
   * Obtiene el nivel de confianza como texto
   */
  const getConfidenceLevel = useCallback(() => {
    if (!prediction || !prediction.confidence) return 'Sin datos';
    
    const conf = prediction.confidence;
    if (conf >= 90) return 'Muy Alta';
    if (conf >= 80) return 'Alta';
    if (conf >= 70) return 'Media';
    if (conf >= 60) return 'Baja';
    return 'Muy Baja';
  }, [prediction]);

  /**
   * Función principal para obtener predicción del producto
   */
  const fetchPrediction = useCallback(async (prodId = null, forceRefresh = false) => {
    const targetProductId = prodId || productId;

    // Validar que tenemos un ID de producto
    if (!targetProductId) {
      setError('Se requiere un ID de producto');
      return;
    }

    const cacheKey = getCacheKey(targetProductId);

    // Usar caché si está vigente y no se fuerza refresh
    if (!forceRefresh && isCacheValid(cacheKey)) {
      setPrediction(cacheRef.current[cacheKey].data);
      setLastFetch(new Date(cacheRef.current[cacheKey].timestamp));
      return;
    }

    // Evitar múltiples llamadas simultáneas
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        days,
        min_confidence: minConfidence,
        include_historical: includeHistorical,
      };

      const response = await dashboardService.getProductPrediction(targetProductId, params);
      
      // Solo actualizar si el componente sigue montado
      if (isMountedRef.current) {
        setPrediction(response);
        setLastFetch(new Date());
        setError(null);

        // Guardar en caché
        cacheRef.current[cacheKey] = {
          data: response,
          timestamp: Date.now(),
        };
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('Error fetching product prediction:', err);
        setError(err.response?.data?.message || 'Error al cargar predicción del producto');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [productId, days, minConfidence, includeHistorical, loading, getCacheKey, isCacheValid]);

  /**
   * Función para refrescar forzando actualización
   */
  const refetch = useCallback((prodId = null) => {
    fetchPrediction(prodId, true);
  }, [fetchPrediction]);

  /**
   * Función para limpiar caché
   */
  const clearCache = useCallback(() => {
    cacheRef.current = {};
    setPrediction(null);
    setLastFetch(null);
  }, []);

  /**
   * Función para limpiar estado actual
   */
  const reset = useCallback(() => {
    setPrediction(null);
    setError(null);
    setLastFetch(null);
  }, []);

  /**
   * Fetch inicial al montar o cuando cambia el productId
   */
  useEffect(() => {
    if (fetchOnMount && productId) {
      fetchPrediction(productId);
    }

    // Cleanup: marcar como desmontado
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchOnMount, productId, fetchPrediction]);

  return {
    prediction,
    loading,
    error,
    lastFetch,
    fetchPrediction,
    refetch,
    clearCache,
    reset,
    isHighConfidence: isHighConfidence(),
    confidenceLevel: getConfidenceLevel(),
  };
};

export default useProductPrediction;
