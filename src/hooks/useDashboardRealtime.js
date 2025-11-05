import { useState, useEffect, useCallback, useRef } from 'react';
import { dashboardService } from '../services/api';

/**
 * Hook para obtener datos del dashboard en tiempo real
 * Incluye auto-refresh cada 5 minutos y funciones para invalidar caché
 * 
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.autoRefresh - Habilitar auto-refresh (default: true)
 * @param {number} options.refreshInterval - Intervalo en ms (default: 300000 = 5 min)
 * @param {boolean} options.fetchOnMount - Fetch al montar (default: true)
 * 
 * @returns {Object} Estado y funciones del dashboard
 * 
 * @example
 * const { data, loading, error, refresh, invalidateCache } = useDashboardRealtime({
 *   autoRefresh: true,
 *   refreshInterval: 300000
 * });
 */
const useDashboardRealtime = ({
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutos
  fetchOnMount = true,
} = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const intervalRef = useRef(null);
  const isMountedRef = useRef(false); // Inicia como false, se marca true en el useEffect
  const fetchingRef = useRef(false); // ← Ref para rastrear si hay una petición en progreso

  /**
   * Función principal para obtener datos del dashboard
   */
  const fetchDashboard = useCallback(async () => {
    // Evitar múltiples llamadas simultáneas usando ref (no state)
    if (fetchingRef.current) {
      console.log('Fetch ya en progreso, ignorando llamada duplicada');
      return;
    }

    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('[Dashboard] Fetching data...');
      const response = await dashboardService.getDashboardRealtime();
      console.log('[Dashboard] Data received:', response);

      // Solo actualizar si el componente sigue montado
      if (isMountedRef.current) {
        setData(response);
        setLastFetch(new Date());
        setError(null);
        console.log('[Dashboard] State updated successfully');
      } else {
        console.warn('[Dashboard] Component unmounted, skipping state update');
      }
    } catch (err) {
      if (isMountedRef.current) {
        console.error('Error fetching dashboard realtime:', err);

        // Determinar el mensaje de error apropiado
        let errorMessage = 'Error al cargar el dashboard';

        if (err.code === 'ECONNABORTED') {
          errorMessage = 'El servidor tardó demasiado en responder';
        } else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
          errorMessage = 'No se pudo conectar con el servidor. ¿Está el backend corriendo en http://localhost:8000?';
        } else if (err.response?.status === 403) {
          errorMessage = 'No tienes permisos para acceder al dashboard';
        } else if (err.response?.status === 401) {
          errorMessage = 'Tu sesión expiró. Por favor, inicia sesión nuevamente';
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.response?.data?.detail) {
          errorMessage = err.response.data.detail;
        }

        setError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      fetchingRef.current = false; // ← Liberar el lock
    }
  }, []);

  /**
   * Función para refrescar manualmente
   */
  const refresh = useCallback(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  /**
   * Función para invalidar caché y refrescar
   */
  const invalidateCache = useCallback(async () => {
    setData(null);
    await fetchDashboard();
  }, [fetchDashboard]);

  /**
   * Fetch inicial al montar el componente y configurar auto-refresh
   */
  useEffect(() => {
    // Marcar como montado ANTES de hacer cualquier cosa
    isMountedRef.current = true;
    console.log('[Dashboard] Component mounted, isMountedRef.current =', isMountedRef.current);

    // 1. Fetch inicial
    if (fetchOnMount) {
      fetchDashboard();
    }

    // 2. Configurar auto-refresh DESPUÉS del fetch inicial
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchDashboard();
      }, refreshInterval);
    }

    // Cleanup: limpiar intervalo y marcar como desmontado
    return () => {
      console.log('[Dashboard] Component unmounting...');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar una vez al montar

  return {
    data,
    loading,
    error,
    lastFetch,
    refresh,
    invalidateCache,
  };
};

export default useDashboardRealtime;
