import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardService } from '../services/api';
import { sortAlertsByPriority, filterAlertsByLevel, countAlertsByLevel } from '../utils/stockAlertHelpers';

/**
 * Hook para obtener alertas de stock
 * Incluye auto-refresh cada 15 minutos y funciones de filtrado
 * 
 * @param {Object} options - Opciones de configuración
 * @param {string[]} options.filterLevels - Niveles a filtrar (CRITICAL, WARNING, CAUTION, OK)
 * @param {boolean} options.autoRefresh - Habilitar auto-refresh (default: true)
 * @param {number} options.refreshInterval - Intervalo en ms (default: 900000 = 15 min)
 * @param {boolean} options.fetchOnMount - Fetch al montar (default: true)
 * @param {boolean} options.autoSort - Ordenar por prioridad (default: true)
 * 
 * @returns {Object} Alertas y funciones
 * 
 * @example
 * const { alerts, loading, error, counts, refresh } = useStockAlerts({
 *   filterLevels: ['CRITICAL', 'WARNING'],
 *   autoRefresh: true
 * });
 */
const useStockAlerts = ({
  filterLevels = null,
  autoRefresh = true,
  refreshInterval = 900000, // 15 minutos
  fetchOnMount = true,
  autoSort = true,
} = {}) => {
  const [allAlerts, setAllAlerts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [counts, setCounts] = useState({
    CRITICAL: 0,
    WARNING: 0,
    CAUTION: 0,
    OK: 0,
    total: 0,
  });
  
  const intervalRef = useRef(null);
  const isMountedRef = useRef(true);

  /**
   * Procesa y filtra las alertas según configuración
   */
  const processAlerts = useCallback((rawAlerts) => {
    let processed = [...rawAlerts];

    // Ordenar por prioridad si está habilitado
    if (autoSort) {
      processed = sortAlertsByPriority(processed);
    }

    // Filtrar por niveles si se especificaron
    if (filterLevels && filterLevels.length > 0) {
      processed = filterAlertsByLevel(processed, filterLevels);
    }

    return processed;
  }, [autoSort, filterLevels]);

  /**
   * Función principal para obtener alertas
   */
  const fetchAlerts = useCallback(async () => {
    // Evitar múltiples llamadas simultáneas
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await dashboardService.getStockAlerts();
      
      // Solo actualizar si el componente sigue montado
      if (isMountedRef.current) {
        const alertsData = response.alerts || response || [];
        
        // Guardar todas las alertas sin filtrar
        setAllAlerts(alertsData);
        
        // Procesar y filtrar alertas
        const processedAlerts = processAlerts(alertsData);
        setAlerts(processedAlerts);
        
        // Calcular contadores (sobre todas las alertas, no las filtradas)
        const alertCounts = countAlertsByLevel(alertsData);
        setCounts(alertCounts);
        
        setLastFetch(new Date());
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('Error fetching stock alerts:', err);
        setError(err.response?.data?.message || 'Error al cargar alertas de stock');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [loading, processAlerts]);

  /**
   * Función para refrescar manualmente
   */
  const refresh = useCallback(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  /**
   * Función para aplicar nuevos filtros sin refetch
   */
  const applyFilters = useCallback((newFilterLevels) => {
    const filtered = newFilterLevels && newFilterLevels.length > 0
      ? filterAlertsByLevel(allAlerts, newFilterLevels)
      : allAlerts;
    
    const processed = autoSort ? sortAlertsByPriority(filtered) : filtered;
    setAlerts(processed);
  }, [allAlerts, autoSort]);

  /**
   * Función para obtener alertas de un nivel específico
   */
  const getAlertsByLevel = useCallback((level) => {
    return filterAlertsByLevel(allAlerts, [level]);
  }, [allAlerts]);

  /**
   * Configurar auto-refresh
   */
  useEffect(() => {
    if (autoRefresh && !loading) {
      // Limpiar intervalo anterior si existe
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Crear nuevo intervalo
      intervalRef.current = setInterval(() => {
        fetchAlerts();
      }, refreshInterval);
    }

    // Cleanup: limpiar intervalo al desmontar o cambiar dependencias
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefresh, refreshInterval, fetchAlerts, loading]);

  /**
   * Re-procesar alertas cuando cambian los filtros
   */
  useEffect(() => {
    if (allAlerts.length > 0) {
      const processed = processAlerts(allAlerts);
      setAlerts(processed);
    }
  }, [filterLevels, autoSort, allAlerts, processAlerts]);

  /**
   * Fetch inicial al montar el componente
   */
  useEffect(() => {
    if (fetchOnMount) {
      fetchAlerts();
    }

    // Cleanup: marcar como desmontado
    return () => {
      isMountedRef.current = false;
    };
  }, [fetchOnMount, fetchAlerts]);

  return {
    alerts,
    allAlerts,
    loading,
    error,
    lastFetch,
    counts,
    refresh,
    applyFilters,
    getAlertsByLevel,
  };
};

export default useStockAlerts;
