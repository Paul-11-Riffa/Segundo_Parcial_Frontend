import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { 
  requestNotificationPermission, 
  getFCMToken, 
  listenForMessages
} from '../services/firebaseMessagingService';
import {
  registerDeviceToken as registerToken,
  getNotifications as fetchNotifications,
  markAsRead as markNotificationRead,
  markAllAsRead as markAllNotificationsRead,
  deleteNotification as removeNotification,
  getPreferences as fetchPreferences,
  updatePreferences as savePreferences
} from '../services/notificationApiService';
import {
  cacheNotifications,
  getCachedNotifications,
  saveFCMToken,
  getSavedFCMToken,
  saveUnreadCount,
  getSavedUnreadCount,
  savePreferences as cachePreferences,
  getSavedPreferences as getCachedPreferences,
  clearNotificationCache
} from '../utils/notificationStorage';
import { filterNotifications, sortNotifications } from '../utils/notificationHelpers';

// Crear el contexto
const NotificationContext = createContext(null);

/**
 * Provider del contexto de notificaciones
 * Gestiona el estado global de notificaciones, permisos, tokens FCM y preferencias
 */
export const NotificationProvider = ({ children }) => {
  // ============= ESTADO =============
  const [notifications, setNotifications] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]); // Para toasts
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState('default'); // 'default', 'granted', 'denied'
  const [fcmToken, setFcmToken] = useState(null);
  const [preferences, setPreferences] = useState({
    email_enabled: true,
    push_enabled: true,
    notification_types: {
      SALE_CREATED: true,
      PRODUCT_LOW_STOCK: true,
      REPORT_GENERATED: true,
      ML_PREDICTION: true,
      SYSTEM: true
    }
  });
  const [isInitialized, setIsInitialized] = useState(false);

  // Referencias para evitar llamadas duplicadas
  const unsubscribeRef = useRef(null);
  const initializationRef = useRef(false);

  // ============= FUNCIONES DE INICIALIZACIÓN =============

  /**
   * Inicializa el sistema de notificaciones
   * - Verifica permisos
   * - Obtiene token FCM
   * - Registra token en backend
   * - Carga notificaciones
   * - Escucha mensajes en foreground
   */
  const initializeNotifications = useCallback(async () => {
    // Prevenir inicialización duplicada
    if (initializationRef.current) {
      console.log('[NotificationContext] Ya inicializado, saltando...');
      return;
    }

    initializationRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('[NotificationContext] Iniciando sistema de notificaciones...');

      // 1. Cargar preferencias (del cache o backend)
      await loadPreferences();

      // 2. Cargar notificaciones del cache primero (para UX rápida)
      const cachedNotifications = getCachedNotifications();
      const cachedUnread = getSavedUnreadCount();
      
      // Verificar que cachedNotifications no sea null o undefined
      if (cachedNotifications && Array.isArray(cachedNotifications) && cachedNotifications.length > 0) {
        setNotifications(cachedNotifications);
        setUnreadCount(cachedUnread);
        console.log(`[NotificationContext] Cargadas ${cachedNotifications.length} notificaciones del cache`);
      }

      // 3. Solicitar permiso de notificaciones
      const permissionStatus = await requestNotificationPermission();
      setPermission(permissionStatus);
      console.log(`[NotificationContext] Permiso: ${permissionStatus}`);

      if (permissionStatus === 'granted') {
        // 4. Obtener token FCM (no bloqueante si falla)
        try {
          let token = getSavedFCMToken();
          
          if (!token) {
            token = await getFCMToken();
            if (token) {
              saveFCMToken(token);
              console.log('[NotificationContext] Token FCM obtenido y guardado');
            }
          } else {
            console.log('[NotificationContext] Token FCM cargado del cache');
          }

          setFcmToken(token);

          // 5. Registrar token en el backend
          if (token) {
            try {
              await registerToken(token);
              console.log('[NotificationContext] Token registrado en backend');
            } catch (regError) {
              console.error('[NotificationContext] Error registrando token:', regError);
              // No bloqueamos la inicialización por este error
            }
          }

          // 6. Configurar listener de mensajes en foreground
          const unsubscribe = listenForMessages((payload) => {
            console.log('[NotificationContext] Mensaje recibido en foreground:', payload);
            handleForegroundMessage(payload);
          });

          unsubscribeRef.current = unsubscribe;
        } catch (fcmError) {
          console.warn('[NotificationContext] Firebase no disponible, continuando sin push notifications');
          console.warn('   Las notificaciones en base de datos funcionarán normalmente');
        }
      } else if (permissionStatus === 'denied') {
        console.warn('[NotificationContext] Permisos denegados por el usuario');
      }

      // 7. Cargar notificaciones del backend (SIEMPRE se ejecuta)
      await loadNotifications();

      setIsInitialized(true);
      console.log('[NotificationContext] Sistema de notificaciones inicializado ✓');

    } catch (err) {
      console.error('[NotificationContext] Error en inicialización:', err);
      setError(err.message || 'Error al inicializar notificaciones');
      // Aún así intentamos cargar las notificaciones
      try {
        await loadNotifications();
        setIsInitialized(true);
      } catch (loadErr) {
        console.error('[NotificationContext] Error crítico al cargar notificaciones:', loadErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Maneja mensajes recibidos en foreground
   */
  const handleForegroundMessage = useCallback((payload) => {
    console.log('[NotificationContext] Procesando mensaje foreground:', payload);

    // Crear objeto de notificación desde el payload
    const newNotification = {
      id: payload.messageId || `local-${Date.now()}`,
      title: payload.notification?.title || 'Nueva notificación',
      body: payload.notification?.body || '',
      type: payload.data?.type || 'SYSTEM',
      priority: payload.data?.priority || 'NORMAL',
      created_at: new Date().toISOString(),
      is_read: false,
      data: payload.data || {}
    };

    // Agregar la notificación al estado
    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      cacheNotifications(updated); // Actualizar cache
      return updated;
    });

    // Agregar a notificaciones recientes para toast (se auto-elimina después de 5s)
    setRecentNotifications(prev => [...prev, newNotification]);
    setTimeout(() => {
      setRecentNotifications(prev => prev.filter(n => n.id !== newNotification.id));
    }, 5000);

    // Incrementar contador de no leídas
    setUnreadCount(prev => {
      const newCount = prev + 1;
      saveUnreadCount(newCount);
      return newCount;
    });

    // Mostrar notificación nativa si es soportado
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(newNotification.title, {
        body: newNotification.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: newNotification.id,
        requireInteraction: newNotification.priority === 'HIGH'
      });
    }
  }, []);

  // ============= FUNCIONES DE CARGA =============

  /**
   * Carga notificaciones del backend
   */
  const loadNotifications = useCallback(async (filters = {}) => {
    try {
      // Verificar que el usuario esté autenticado
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('[NotificationContext] Usuario no autenticado, no se cargan notificaciones');
        return [];
      }

      console.log('🔵 [CONTEXT] Cargando notificaciones del backend (sin cache)...');
      
      const response = await fetchNotifications(filters);
      const fetchedNotifications = response.results || response || [];

      // 🔍 DEBUG: Ver TODAS las notificaciones con su estado is_read
      console.log('� [CONTEXT] TODAS las notificaciones recibidas del backend:');
      fetchedNotifications.forEach(n => {
        console.log(`  - ID ${n.id}: is_read=${n.is_read}, read_at=${n.read_at}, title="${n.title.substring(0, 30)}..."`);
      });

      setNotifications(fetchedNotifications);
      
      // Calcular no leídas
      const unread = fetchedNotifications.filter(n => !n.is_read).length;
      setUnreadCount(unread);

      // Actualizar cache
      cacheNotifications(fetchedNotifications);
      saveUnreadCount(unread);

      console.log(`✅ [CONTEXT] ${fetchedNotifications.length} notificaciones cargadas (${unread} no leídas)`);
      
      return fetchedNotifications;
    } catch (err) {
      // Si es 401, silenciosamente no hacer nada (evita bucle infinito)
      if (err.response?.status === 401) {
        console.warn('⚠️ [CONTEXT] No autorizado para cargar notificaciones');
        return [];
      }
      
      console.error('❌ [CONTEXT] Error cargando notificaciones:', err);
      setError(err.message || 'Error al cargar notificaciones');
      throw err;
    }
  }, []);

  /**
   * Carga preferencias de notificaciones
   */
  const loadPreferences = useCallback(async () => {
    try {
      // Intentar cargar del cache primero
      const cached = getCachedPreferences();
      if (cached) {
        setPreferences(cached);
        console.log('[NotificationContext] Preferencias cargadas del cache');
      }

      // Verificar que el usuario esté autenticado antes de llamar al backend
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('[NotificationContext] Usuario no autenticado, usando preferencias del cache');
        return cached;
      }

      // Luego cargar del backend
      const prefs = await fetchPreferences();
      setPreferences(prefs);
      cachePreferences(prefs);
      console.log('[NotificationContext] Preferencias actualizadas del backend');
      
      return prefs;
    } catch (err) {
      // Si falla (ej: 401), silenciosamente usar las del cache
      if (err.response?.status === 401) {
        console.warn('[NotificationContext] No autorizado para cargar preferencias, usando cache');
      } else {
        console.error('[NotificationContext] Error cargando preferencias:', err);
      }
      // NO re-lanzar el error, solo continuar con cache
      return getCachedPreferences();
    }
  }, []);

  // ============= ACCIONES DE NOTIFICACIONES =============

  /**
   * Marca una notificación como leída
   */
  const markAsRead = useCallback(async (notificationId) => {
    try {
      console.log(`🔵 [CONTEXT] Marcando notificación ${notificationId} como leída...`);
      
      const response = await markNotificationRead(notificationId);
      
      console.log(`✅ [CONTEXT] Respuesta del backend para mark_as_read:`, response);

      // Actualizar en memoria
      setNotifications(prev => {
        const updated = prev.map(n => 
          n.id === notificationId ? { ...n, is_read: true, status: 'READ' } : n
        );
        
        // 🔍 Ver la notificación actualizada
        const updatedNotif = updated.find(n => n.id === notificationId);
        console.log(`🔍 [CONTEXT] Notificación actualizada en estado local:`, {
          id: updatedNotif?.id,
          is_read: updatedNotif?.is_read,
          status: updatedNotif?.status
        });
        
        cacheNotifications(updated);
        return updated;
      });

      setUnreadCount(prev => {
        const newCount = Math.max(0, prev - 1);
        saveUnreadCount(newCount);
        return newCount;
      });

      // 🔍 VALIDACIÓN: Volver a consultar el backend para confirmar
      console.log(`🔍 [CONTEXT] Validando que el backend guardó correctamente...`);
      setTimeout(async () => {
        try {
          const validation = await fetchNotifications({});
          const validatedNotif = (validation.results || validation || []).find(n => n.id === notificationId);
          console.log(`🔍 [CONTEXT] Validación del backend - Notificación ${notificationId}:`, {
            is_read: validatedNotif?.is_read,
            read_at: validatedNotif?.read_at
          });
        } catch (valErr) {
          console.error('❌ [CONTEXT] Error en validación:', valErr);
        }
      }, 500);

      console.log(`✅ [CONTEXT] Notificación ${notificationId} marcada como leída`);
    } catch (err) {
      console.error('❌ [CONTEXT] Error marcando como leída:', err);
      throw err;
    }
  }, []);

  /**
   * Marca todas las notificaciones como leídas
   */
  const markAllAsRead = useCallback(async () => {
    try {
      console.log('🔵 [CONTEXT] Marcando TODAS las notificaciones como leídas...');
      
      const response = await markAllNotificationsRead();
      
      console.log('✅ [CONTEXT] Respuesta del backend para mark_all_as_read:', response);

      // Actualizar en memoria
      setNotifications(prev => {
        const updated = prev.map(n => ({ ...n, is_read: true, status: 'READ' }));
        cacheNotifications(updated);
        return updated;
      });

      setUnreadCount(0);
      saveUnreadCount(0);

      // 🔍 VALIDACIÓN: Volver a consultar el backend para confirmar
      console.log('🔍 [CONTEXT] Validando que el backend guardó TODAS correctamente...');
      setTimeout(async () => {
        try {
          const validation = await fetchNotifications({});
          const allNotifications = validation.results || validation || [];
          const stillUnread = allNotifications.filter(n => !n.is_read);
          
          console.log('🔍 [CONTEXT] Validación del backend después de mark_all:');
          console.log(`   Total notificaciones: ${allNotifications.length}`);
          console.log(`   Aún no leídas: ${stillUnread.length}`);
          
          if (stillUnread.length > 0) {
            console.warn('⚠️ [CONTEXT] PROBLEMA: El backend NO marcó todas como leídas:');
            stillUnread.forEach(n => {
              console.warn(`   - ID ${n.id}: is_read=${n.is_read}, title="${n.title.substring(0, 30)}..."`);
            });
          } else {
            console.log('✅ [CONTEXT] Validación exitosa: Todas las notificaciones están marcadas como leídas');
          }
        } catch (valErr) {
          console.error('❌ [CONTEXT] Error en validación:', valErr);
        }
      }, 500);

      console.log('✅ [CONTEXT] Todas las notificaciones marcadas como leídas en estado local');
    } catch (err) {
      console.error('❌ [CONTEXT] Error marcando todas como leídas:', err);
      throw err;
    }
  }, []);

  /**
   * Elimina una notificación
   */
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await removeNotification(notificationId);

      setNotifications(prev => {
        const notification = prev.find(n => n.id === notificationId);
        const updated = prev.filter(n => n.id !== notificationId);
        cacheNotifications(updated);

        // Si era no leída, decrementar contador
        if (notification && !notification.is_read) {
          setUnreadCount(prevCount => {
            const newCount = Math.max(0, prevCount - 1);
            saveUnreadCount(newCount);
            return newCount;
          });
        }

        return updated;
      });

      console.log(`[NotificationContext] Notificación ${notificationId} eliminada`);
    } catch (err) {
      console.error('[NotificationContext] Error eliminando notificación:', err);
      throw err;
    }
  }, []);

  /**
   * Actualiza las preferencias de notificaciones
   */
  const updatePreferences = useCallback(async (newPreferences) => {
    try {
      const updated = await savePreferences(newPreferences);
      setPreferences(updated);
      cachePreferences(updated);
      console.log('[NotificationContext] Preferencias actualizadas');
      return updated;
    } catch (err) {
      console.error('[NotificationContext] Error actualizando preferencias:', err);
      throw err;
    }
  }, []);

  /**
   * Recarga las notificaciones (pull to refresh)
   */
  const refreshNotifications = useCallback(async () => {
    console.log('[NotificationContext] Refrescando notificaciones...');
    return await loadNotifications();
  }, [loadNotifications]);

  /**
   * Limpia el cache local y recarga
   */
  const clearCache = useCallback(() => {
    clearNotificationCache();
    setNotifications([]);
    setUnreadCount(0);
    console.log('[NotificationContext] Cache limpiado');
  }, []);

  // ============= FUNCIONES DE UTILIDAD =============

  /**
   * Filtra notificaciones por criterios
   */
  const getFilteredNotifications = useCallback((filters) => {
    return filterNotifications(notifications, filters);
  }, [notifications]);

  /**
   * Obtiene solo notificaciones no leídas
   */
  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(n => !n.is_read);
  }, [notifications]);

  /**
   * Solicita permisos nuevamente (si fueron denegados)
   */
  const requestPermission = useCallback(async () => {
    const status = await requestNotificationPermission();
    setPermission(status);
    
    if (status === 'granted' && !fcmToken) {
      // Si acabamos de obtener permiso, inicializar FCM
      await initializeNotifications();
    }
    
    return status;
  }, [fcmToken, initializeNotifications]);

  /**
   * Elimina un toast de las notificaciones recientes
   */
  const dismissToast = useCallback((notificationId) => {
    setRecentNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  // ============= EFECTOS =============

  // Inicializar al montar
  useEffect(() => {
    initializeNotifications();

    // Cleanup al desmontar
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current(); // Llamar directamente a la función de unsubscribe
        console.log('[NotificationContext] Listener desuscrito');
      }
      initializationRef.current = false;
    };
  }, []); // Solo al montar

  // ============= VALOR DEL CONTEXTO =============

  const value = {
    // Estado
    notifications,
    recentNotifications,
    unreadCount,
    loading,
    error,
    permission,
    fcmToken,
    preferences,
    isInitialized,

    // Acciones
    loadNotifications,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updatePreferences,
    loadPreferences,
    requestPermission,
    clearCache,
    dismissToast,

    // Utilidades
    getFilteredNotifications,
    getUnreadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Hook personalizado para usar el contexto de notificaciones
 * @returns {object} Context value con estado y funciones
 * @throws {Error} Si se usa fuera del NotificationProvider
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications debe usarse dentro de un NotificationProvider');
  }
  
  return context;
};

export default NotificationContext;
