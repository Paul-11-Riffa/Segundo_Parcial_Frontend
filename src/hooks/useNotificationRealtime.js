import { useEffect, useCallback, useRef } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { onMessage } from 'firebase/messaging';
import { messaging } from '../services/firebase';

/**
 * Hook para monitoreo en tiempo real de notificaciones
 * Actualiza automáticamente cuando llegan nuevas notificaciones
 */
export const useNotificationRealtime = (options = {}) => {
  const {
    onNewNotification,
    autoRefreshInterval = 60000, // 1 minuto por defecto
    enableAutoRefresh = false
  } = options;

  const {
    notifications,
    unreadCount,
    refreshNotifications,
    isInitialized
  } = useNotifications();

  const intervalRef = useRef(null);
  const listenerRef = useRef(null);

  /**
   * Maneja notificaciones nuevas en tiempo real
   */
  const handleRealtimeMessage = useCallback((payload) => {
    console.log('[useNotificationRealtime] Nueva notificación en tiempo real:', payload);

    // Callback personalizado si se proporciona
    if (onNewNotification && typeof onNewNotification === 'function') {
      onNewNotification(payload);
    }

    // Auto-refresh de la lista
    refreshNotifications();
  }, [onNewNotification, refreshNotifications]);

  /**
   * Inicia el listener de mensajes en tiempo real
   */
  const startRealtimeListener = useCallback(() => {
    if (!messaging || listenerRef.current) {
      return;
    }

    try {
      // Escuchar mensajes de Firebase
      const unsubscribe = onMessage(messaging, handleRealtimeMessage);
      listenerRef.current = unsubscribe;
      console.log('[useNotificationRealtime] Listener de tiempo real iniciado');
    } catch (error) {
      console.error('[useNotificationRealtime] Error iniciando listener:', error);
    }
  }, [handleRealtimeMessage]);

  /**
   * Detiene el listener de tiempo real
   */
  const stopRealtimeListener = useCallback(() => {
    if (listenerRef.current) {
      listenerRef.current();
      listenerRef.current = null;
      console.log('[useNotificationRealtime] Listener de tiempo real detenido');
    }
  }, []);

  /**
   * Inicia el auto-refresh periódico
   */
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      return;
    }

    intervalRef.current = setInterval(() => {
      console.log('[useNotificationRealtime] Auto-refresh de notificaciones');
      refreshNotifications();
    }, autoRefreshInterval);

    console.log(`[useNotificationRealtime] Auto-refresh iniciado (cada ${autoRefreshInterval}ms)`);
  }, [autoRefreshInterval, refreshNotifications]);

  /**
   * Detiene el auto-refresh periódico
   */
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('[useNotificationRealtime] Auto-refresh detenido');
    }
  }, []);

  /**
   * Fuerza un refresh manual
   */
  const forceRefresh = useCallback(async () => {
    console.log('[useNotificationRealtime] Refresh manual solicitado');
    return await refreshNotifications();
  }, [refreshNotifications]);

  // ============= EFECTOS =============

  // Iniciar listener cuando el sistema esté inicializado
  useEffect(() => {
    if (isInitialized) {
      startRealtimeListener();
    }

    return () => {
      stopRealtimeListener();
    };
  }, [isInitialized, startRealtimeListener, stopRealtimeListener]);

  // Controlar auto-refresh
  useEffect(() => {
    if (enableAutoRefresh && isInitialized) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    return () => {
      stopAutoRefresh();
    };
  }, [enableAutoRefresh, isInitialized, startAutoRefresh, stopAutoRefresh]);

  // Cleanup general
  useEffect(() => {
    return () => {
      stopRealtimeListener();
      stopAutoRefresh();
    };
  }, [stopRealtimeListener, stopAutoRefresh]);

  return {
    notifications,
    unreadCount,
    forceRefresh,
    startAutoRefresh,
    stopAutoRefresh,
    isRealtimeActive: !!listenerRef.current,
    isAutoRefreshActive: !!intervalRef.current
  };
};

export default useNotificationRealtime;
