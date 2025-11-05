import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardService } from '../services/api';

/**
 * Hook para obtener predicciones de ventas ML
 * Incluye caché con TTL de 30 minutos y manejo de múltiples periodos
 * 
 * @param {Object} options - Opciones de configuración
 * @param {number} options.days - Días a predecir (7, 14, 30, 90)
 * @param {boolean} options.includeHistorical - Incluir datos históricos
 * @param {boolean} options.chartFormat - Formatear para gráficos
 * @param {boolean} options.fetchOnMount - Fetch al montar (default: true)
 * @param {number} options.cacheTTL - TTL del caché en ms (default: 1800000 = 30 min)
 * 
 * @returns {Object} Predicciones y funciones
 * 
 * @example
 * const { predictions, loading, error, refetch, isStale } = useSalesPredictions({
 *   days: 30,
 *   includeHistorical: true
 * });
 */
const useSalesPredictions = ({
  days = 30,
  includeHistorical = false,
  chartFormat = false,
  fetchOnMount = true,
  cacheTTL = 1800000, // 30 minutos
} = {}) => {
  console.log('🎯 useSalesPredictions hook initialized with:', {
    days,
    includeHistorical,
    chartFormat,
    fetchOnMount,
    cacheTTL
  });
  
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  
  const isMountedRef = useRef(true);
  const cacheRef = useRef({});
  const fetchingRef = useRef(false); // ✅ Nuevo: ref para controlar fetching
  const initialFetchDone = useRef(false); // ✅ Prevenir múltiples fetches iniciales

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
  const getCacheKey = useCallback(() => {
    return `predictions_${days}_${includeHistorical}_${chartFormat}`;
  }, [days, includeHistorical, chartFormat]);

  /**
   * Verifica si los datos están obsoletos
   */
  const isStale = useCallback(() => {
    if (!lastFetch) return true;
    const now = Date.now();
    const age = now - lastFetch.getTime();
    return age > cacheTTL;
  }, [lastFetch, cacheTTL]);

  /**
   * Función principal para obtener predicciones
   */
  const fetchPredictions = useCallback(async (forceRefresh = false) => {
    // Generar cache key inline
    const cacheKey = `predictions_${days}_${includeHistorical}_${chartFormat}`;

    // Verificar caché inline
    const cached = cacheRef.current[cacheKey];
    const isCacheValid = cached && (Date.now() - cached.timestamp) < cacheTTL;

    // Usar caché si está vigente y no se fuerza refresh
    if (!forceRefresh && isCacheValid) {
      console.log('📦 Using cached data');
      setPredictions(cached.data);
      setLastFetch(new Date(cached.timestamp));
      return;
    }

    // Evitar múltiples llamadas simultáneas usando ref
    if (fetchingRef.current) {
      console.log('⏳ Fetch already in progress, skipping...');
      return;
    }

    console.log('🚀 Starting fetch predictions...');
    fetchingRef.current = true; // Marcar como fetching
    setLoading(true);
    setError(null);

    try {
      let response;
      let processedData;
      
      // Si se solicitan datos históricos o formato para gráficas, usar el dashboard endpoint
      if (includeHistorical || chartFormat) {
        const dashboardResponse = await dashboardService.getPredictionsSalesDashboard({
          includeHistorical,
          chartFormat,
        });
        
        // El dashboard devuelve múltiples periodos, extraer el seleccionado
        const periodKey = `predictions_${days}d`;
        const periodData = dashboardResponse.data?.[periodKey];
        
        if (periodData) {
          // Adaptar el formato del dashboard al formato esperado por el componente
          // Transformar daily_predictions al formato esperado por chart_data
          const transformedChartData = (periodData.daily_predictions || []).map(item => ({
            date: item.date,
            predicted_sales: item.value,
            predicted_value: item.value, // Alias para otros componentes
            actual_sales: null, // No hay datos históricos en predicciones futuras
            confidence_upper: item.upper_bound,
            confidence_lower: item.lower_bound,
            upper_bound: item.upper_bound, // Alias
            lower_bound: item.lower_bound, // Alias
          }));
          
          // Adaptar summary con los nombres que espera el componente
          const adaptedSummary = {
            total_predicted: periodData.summary?.total_sales,
            total_sales: periodData.summary?.total_sales, // Alias
            daily_average: periodData.summary?.average_daily,
            average_daily: periodData.summary?.average_daily, // Alias
            growth_rate: periodData.summary?.growth_rate,
            confidence_level: periodData.summary?.confidence_level,
            start_date: periodData.summary?.start_date,
            end_date: periodData.summary?.end_date,
            historical_average: periodData.summary?.historical_average,
            difference_vs_historical: periodData.summary?.difference_vs_historical,
            trend: periodData.summary?.growth_rate > 0 ? 'Creciente' : 
                   periodData.summary?.growth_rate < 0 ? 'Decreciente' : 'Estable',
          };
          
          processedData = {
            chart_data: transformedChartData,
            predictions: transformedChartData, // Alias para compatibilidad
            summary: adaptedSummary,
            model_info: periodData.model_info || {},
            historical_data: dashboardResponse.data?.historical_data || null,
          };
        } else {
          // Si no se encuentra el período, usar el response completo
          processedData = dashboardResponse.data || dashboardResponse;
        }
        
        response = processedData;
      } else {
        // Usar el endpoint simple para predicciones básicas
        const params = {
          days,
          include_historical: includeHistorical,
          chart_format: chartFormat,
        };
        const simpleResponse = await dashboardService.getMLPredictions(params);
        response = simpleResponse.data || simpleResponse;
      }
      
      // Solo actualizar si el componente sigue montado
      console.log('🔍 Pre-setState check:', {
        isMounted: isMountedRef.current,
        hasResponse: !!response,
        responseType: typeof response,
        responseKeys: response ? Object.keys(response) : null,
        responseSize: response ? JSON.stringify(response).length : 0
      });
      
      if (isMountedRef.current) {
        console.log('✅ Component mounted, calling setPredictions...');
        setPredictions(response);
        console.log('✅ setPredictions called successfully');
        setLastFetch(new Date());
        setError(null);

        // Guardar en caché
        cacheRef.current[cacheKey] = {
          data: response,
          timestamp: Date.now(),
        };
        console.log('💾 Cache updated');
      } else {
        console.warn('⚠️ Component unmounted, skipping state update');
      }
    } catch (err) {
      console.error('❌ Error in fetchPredictions catch block:', err);
      console.error('Error stack:', err.stack);
      if (isMountedRef.current) {
        console.error('❌ Error fetching sales predictions:', err);
        setError(err.response?.data?.message || 'Error al cargar predicciones');
      }
    } finally {
      console.log('🏁 Finally block executing...');
      if (isMountedRef.current) {
        console.log('🏁 Setting loading to false and releasing fetchingRef');
        setLoading(false);
        fetchingRef.current = false;
      } else {
        console.log('⚠️ Component unmounted in finally block');
      }
    }
  }, [days, includeHistorical, chartFormat, cacheTTL]); // ✅ Solo dependencias primitivas

  /**
   * Función para refrescar forzando actualización
   */
  const refetch = useCallback(() => {
    fetchPredictions(true);
  }, [fetchPredictions]);

  /**
   * Función para limpiar caché
   */
  const clearCache = useCallback(() => {
    cacheRef.current = {};
    setPredictions(null);
    setLastFetch(null);
  }, []);

  /**
   * Fetch inicial al montar o cuando cambian los parámetros
   */
  useEffect(() => {
    console.log('🔄 useEffect triggered', {
      fetchOnMount,
      loading,
      fetchingRef: fetchingRef.current,
      initialFetchDone: initialFetchDone.current,
      days,
      includeHistorical,
      chartFormat
    });
    
    // Reset isMounted al montar
    isMountedRef.current = true;
    
    if (fetchOnMount && !initialFetchDone.current) {
      console.log('✅ First mount, calling fetchPredictions');
      initialFetchDone.current = true;
      fetchPredictions();
    } else if (fetchOnMount && initialFetchDone.current) {
      console.log('🔄 Parameters changed, calling fetchPredictions');
      fetchPredictions();
    } else {
      console.log('⏭️ fetchOnMount is false, skipping fetch');
    }

    // Cleanup: marcar como desmontado SOLO al desmontar realmente
    return () => {
      console.log('🧹 Cleanup: marking component as unmounted');
      isMountedRef.current = false;
    };
  }, [fetchOnMount, days, includeHistorical, chartFormat]); // ❌ NO incluir fetchPredictions

  return {
    predictions,
    loading,
    error,
    lastFetch,
    refetch,
    clearCache,
    isStale: isStale(),
  };
};

export default useSalesPredictions;
