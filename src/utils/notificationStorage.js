/**
 * Notification Storage
 * 
 * Maneja el almacenamiento local de notificaciones y tokens
 * Utiliza localStorage para persistencia
 * 
 * @module utils/notificationStorage
 */

// ============================================================
// CONSTANTES
// ============================================================

const STORAGE_KEYS = {
  NOTIFICATIONS: 'app_notifications',
  FCM_TOKEN: 'fcm_token',
  UNREAD_COUNT: 'unread_count',
  PREFERENCES: 'notification_preferences',
  LAST_SYNC: 'notifications_last_sync'
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// ============================================================
// NOTIFICACIONES
// ============================================================

/**
 * Guarda notificaciones en localStorage
 * 
 * @param {Array} notifications - Array de notificaciones
 */
export function cacheNotifications(notifications) {
  try {
    const data = {
      notifications,
      timestamp: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data));
    console.log(`💾 ${notifications.length} notificaciones guardadas en cache`);
  } catch (error) {
    console.error('❌ Error al guardar notificaciones en cache:', error);
  }
}

/**
 * Obtiene notificaciones de localStorage si no están expiradas
 * 
 * @returns {Array|null} Array de notificaciones o null si expiró
 */
export function getCachedNotifications() {
  try {
    const cached = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!cached) return null;
    
    const data = JSON.parse(cached);
    const isExpired = Date.now() - data.timestamp > CACHE_DURATION;
    
    if (isExpired) {
      console.log('⏰ Cache de notificaciones expirado');
      clearNotificationCache();
      return null;
    }
    
    console.log(`✅ ${data.notifications.length} notificaciones obtenidas del cache`);
    return data.notifications;
  } catch (error) {
    console.error('❌ Error al leer cache de notificaciones:', error);
    return null;
  }
}

/**
 * Limpia el cache de notificaciones
 */
export function clearNotificationCache() {
  try {
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    console.log('🗑️ Cache de notificaciones limpiado');
  } catch (error) {
    console.error('❌ Error al limpiar cache:', error);
  }
}

/**
 * Actualiza una notificación específica en el cache
 * 
 * @param {number} notificationId - ID de la notificación
 * @param {Object} updates - Campos a actualizar
 */
export function updateCachedNotification(notificationId, updates) {
  try {
    const cached = getCachedNotifications();
    if (!cached) return;
    
    const index = cached.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      cached[index] = { ...cached[index], ...updates };
      cacheNotifications(cached);
      console.log(`✅ Notificación ${notificationId} actualizada en cache`);
    }
  } catch (error) {
    console.error('❌ Error al actualizar notificación en cache:', error);
  }
}

/**
 * Agrega una nueva notificación al cache
 * 
 * @param {Object} notification - Nueva notificación
 */
export function addNotificationToCache(notification) {
  try {
    const cached = getCachedNotifications() || [];
    cached.unshift(notification); // Agregar al inicio
    cacheNotifications(cached);
    console.log(`✅ Nueva notificación agregada al cache`);
  } catch (error) {
    console.error('❌ Error al agregar notificación al cache:', error);
  }
}

// ============================================================
// TOKEN FCM
// ============================================================

/**
 * Guarda el token FCM en localStorage
 * 
 * @param {string} token - Token FCM
 */
export function saveFCMToken(token) {
  try {
    localStorage.setItem(STORAGE_KEYS.FCM_TOKEN, token);
    console.log('💾 Token FCM guardado');
  } catch (error) {
    console.error('❌ Error al guardar token FCM:', error);
  }
}

/**
 * Obtiene el token FCM de localStorage
 * 
 * @returns {string|null} Token FCM o null
 */
export function getSavedFCMToken() {
  try {
    return localStorage.getItem(STORAGE_KEYS.FCM_TOKEN);
  } catch (error) {
    console.error('❌ Error al obtener token FCM:', error);
    return null;
  }
}

/**
 * Elimina el token FCM de localStorage
 */
export function clearFCMToken() {
  try {
    localStorage.removeItem(STORAGE_KEYS.FCM_TOKEN);
    console.log('🗑️ Token FCM eliminado');
  } catch (error) {
    console.error('❌ Error al eliminar token FCM:', error);
  }
}

/**
 * Verifica si hay un token FCM guardado
 * 
 * @returns {boolean} True si hay token guardado
 */
export function hasSavedFCMToken() {
  return !!getSavedFCMToken();
}

// ============================================================
// CONTADOR DE NO LEÍDAS
// ============================================================

/**
 * Guarda el contador de notificaciones no leídas
 * 
 * @param {number} count - Número de notificaciones no leídas
 */
export function saveUnreadCount(count) {
  try {
    localStorage.setItem(STORAGE_KEYS.UNREAD_COUNT, count.toString());
  } catch (error) {
    console.error('❌ Error al guardar contador de no leídas:', error);
  }
}

/**
 * Obtiene el contador de notificaciones no leídas
 * 
 * @returns {number} Número de notificaciones no leídas
 */
export function getSavedUnreadCount() {
  try {
    const count = localStorage.getItem(STORAGE_KEYS.UNREAD_COUNT);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('❌ Error al obtener contador de no leídas:', error);
    return 0;
  }
}

/**
 * Incrementa el contador de no leídas
 * 
 * @param {number} increment - Cantidad a incrementar (default: 1)
 */
export function incrementUnreadCount(increment = 1) {
  const current = getSavedUnreadCount();
  saveUnreadCount(current + increment);
}

/**
 * Decrementa el contador de no leídas
 * 
 * @param {number} decrement - Cantidad a decrementar (default: 1)
 */
export function decrementUnreadCount(decrement = 1) {
  const current = getSavedUnreadCount();
  const newCount = Math.max(0, current - decrement);
  saveUnreadCount(newCount);
}

/**
 * Resetea el contador de no leídas a 0
 */
export function resetUnreadCount() {
  saveUnreadCount(0);
}

// ============================================================
// PREFERENCIAS
// ============================================================

/**
 * Guarda las preferencias de notificaciones
 * 
 * @param {Object} preferences - Objeto de preferencias
 */
export function savePreferences(preferences) {
  try {
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    console.log('💾 Preferencias guardadas');
  } catch (error) {
    console.error('❌ Error al guardar preferencias:', error);
  }
}

/**
 * Obtiene las preferencias de notificaciones
 * 
 * @returns {Object|null} Objeto de preferencias o null
 */
export function getSavedPreferences() {
  try {
    const prefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return prefs ? JSON.parse(prefs) : null;
  } catch (error) {
    console.error('❌ Error al obtener preferencias:', error);
    return null;
  }
}

/**
 * Limpia las preferencias guardadas
 */
export function clearPreferences() {
  try {
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    console.log('🗑️ Preferencias eliminadas');
  } catch (error) {
    console.error('❌ Error al eliminar preferencias:', error);
  }
}

// ============================================================
// ÚLTIMA SINCRONIZACIÓN
// ============================================================

/**
 * Guarda el timestamp de la última sincronización
 */
export function saveLastSyncTime() {
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());
  } catch (error) {
    console.error('❌ Error al guardar última sincronización:', error);
  }
}

/**
 * Obtiene el timestamp de la última sincronización
 * 
 * @returns {number|null} Timestamp o null
 */
export function getLastSyncTime() {
  try {
    const time = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
    return time ? parseInt(time, 10) : null;
  } catch (error) {
    console.error('❌ Error al obtener última sincronización:', error);
    return null;
  }
}

/**
 * Verifica si es necesario sincronizar
 * 
 * @param {number} interval - Intervalo mínimo en ms (default: 60000 = 1 minuto)
 * @returns {boolean} True si es necesario sincronizar
 */
export function shouldSync(interval = 60000) {
  const lastSync = getLastSyncTime();
  if (!lastSync) return true;
  
  return Date.now() - lastSync > interval;
}

// ============================================================
// LIMPIEZA GENERAL
// ============================================================

/**
 * Limpia todos los datos de notificaciones del localStorage
 */
export function clearAllNotificationData() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    console.log('🗑️ Todos los datos de notificaciones eliminados');
  } catch (error) {
    console.error('❌ Error al limpiar datos:', error);
  }
}

/**
 * Obtiene el tamaño total del storage de notificaciones
 * 
 * @returns {number} Tamaño en bytes
 */
export function getStorageSize() {
  let total = 0;
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        total += item.length * 2; // UTF-16 uses 2 bytes per character
      }
    });
  } catch (error) {
    console.error('❌ Error al calcular tamaño de storage:', error);
  }
  return total;
}

/**
 * Verifica si el localStorage está disponible
 * 
 * @returns {boolean} True si está disponible
 */
export function isLocalStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
}

// ============================================================
// MIGRACIÓN Y COMPATIBILIDAD
// ============================================================

/**
 * Migra datos antiguos a nuevo formato si es necesario
 */
export function migrateOldData() {
  try {
    // Aquí puedes agregar lógica para migrar formatos antiguos
    // Por ejemplo, si cambias la estructura de los datos
    
    console.log('✅ Migración de datos completada');
  } catch (error) {
    console.error('❌ Error al migrar datos:', error);
  }
}

// ============================================================
// EXPORTAR CONSTANTES
// ============================================================

export { STORAGE_KEYS, CACHE_DURATION };
