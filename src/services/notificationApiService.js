/**
 * Notification API Service
 * 
 * Servicio para comunicarse con el backend de Django
 * Maneja todos los endpoints relacionados con notificaciones
 * 
 * @module services/notificationApiService
 */

// Importar configuración de API (asumiendo que ya existe)
import apiClient from './api';

/**
 * URL base para endpoints de notificaciones
 * NOTA: No incluir /api/ porque apiClient.baseURL ya lo tiene
 * apiClient.baseURL = 'http://localhost:8000/api'
 * Entonces solo necesitamos: '/notifications'
 */
const NOTIFICATIONS_BASE_URL = '/notifications';

// ============================================================
// DEVICE TOKENS (Registro de Dispositivos)
// ============================================================

/**
 * Registra el token FCM del dispositivo en el backend
 * 
 * @param {string} fcmToken - Token FCM del dispositivo
 * @param {string} platform - Plataforma (WEB, ANDROID, IOS)
 * @param {string} deviceName - Nombre descriptivo del dispositivo
 * @returns {Promise<Object>} Datos del dispositivo registrado
 */
export async function registerDeviceToken(fcmToken, platform = 'WEB', deviceName = null) {
  try {
    const response = await apiClient.post(`${NOTIFICATIONS_BASE_URL}/device-tokens/register/`, {
      token: fcmToken,
      platform: platform,
      device_name: deviceName
    });
    
    console.log('✅ Token de dispositivo registrado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al registrar token de dispositivo:', error);
    throw error;
  }
}

/**
 * Desregistra el token FCM del dispositivo (útil al cerrar sesión)
 * 
 * @param {string} fcmToken - Token FCM del dispositivo
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function unregisterDeviceToken(fcmToken) {
  try {
    const response = await apiClient.post(`${NOTIFICATIONS_BASE_URL}/device-tokens/unregister/`, {
      token: fcmToken
    });
    
    console.log('✅ Token de dispositivo desregistrado:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al desregistrar token:', error);
    throw error;
  }
}

/**
 * Obtiene la lista de todos los dispositivos del usuario actual
 * 
 * @returns {Promise<Array>} Lista de dispositivos
 */
export async function getMyDevices() {
  try {
    const response = await apiClient.get(`${NOTIFICATIONS_BASE_URL}/device-tokens/my_devices/`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener dispositivos:', error);
    throw error;
  }
}

// ============================================================
// NOTIFICATIONS (Gestión de Notificaciones)
// ============================================================

/**
 * Obtiene la lista de notificaciones del usuario
 * 
 * @param {number} page - Número de página para paginación
 * @param {number} pageSize - Tamaño de página
 * @returns {Promise<Object>} Objeto con notificaciones y paginación
 */
export async function getNotifications(page = 1, pageSize = 20) {
  try {
    const response = await apiClient.get(`${NOTIFICATIONS_BASE_URL}/notifications/`, {
      params: { page, page_size: pageSize }
    });
    
    // 🔍 Ver datos crudos del backend
    const data = response.data;
    console.log('📦 [DEBUG] Backend envía is_read correctamente:', 
      (data.results || data).slice(0, 2).map(n => ({
        id: n.id,
        title: n.title,
        is_read: n.is_read
      }))
    );
    
    // El backend YA envía is_read correctamente, no necesitamos transformar
    return data;
  } catch (error) {
    console.error('❌ Error al obtener notificaciones:', error);
    throw error;
  }
}

/**
 * Obtiene solo las notificaciones no leídas
 * 
 * @returns {Promise<Array>} Lista de notificaciones no leídas
 */
export async function getUnreadNotifications() {
  try {
    const response = await apiClient.get(`${NOTIFICATIONS_BASE_URL}/notifications/unread/`);
    
    // El backend ya envía is_read correctamente
    const data = Array.isArray(response.data) ? response.data : response.data.results || [];
    return data;
  } catch (error) {
    console.error('❌ Error al obtener notificaciones no leídas:', error);
    throw error;
  }
}

/**
 * Obtiene el contador de notificaciones no leídas
 * 
 * @returns {Promise<number>} Número de notificaciones no leídas
 */
export async function getUnreadCount() {
  try {
    const response = await apiClient.get(`${NOTIFICATIONS_BASE_URL}/notifications/unread_count/`);
    return response.data.count;
  } catch (error) {
    console.error('❌ Error al obtener contador de no leídas:', error);
    return 0;
  }
}

/**
 * Marca una notificación como leída
 * 
 * @param {number} notificationId - ID de la notificación
 * @returns {Promise<Object>} Respuesta del servidor
 */
export async function markAsRead(notificationId) {
  try {
    console.log(`🔵 [API] Llamando al backend para marcar notificación ${notificationId}...`);
    
    const response = await apiClient.post(
      `${NOTIFICATIONS_BASE_URL}/notifications/${notificationId}/mark_as_read/`
    );
    
    console.log(`✅ [API] Respuesta del backend:`, response.data);
    console.log(`🔍 [API] Status HTTP:`, response.status);
    
    return response.data;
  } catch (error) {
    console.error(`❌ [API] Error al marcar notificación ${notificationId}:`, error);
    console.error(`❌ [API] Detalles:`, error.response?.data);
    throw error;
  }
}

/**
 * Marca todas las notificaciones como leídas
 * 
 * @returns {Promise<Object>} Respuesta con contador de notificaciones actualizadas
 */
export async function markAllAsRead() {
  try {
    console.log('🔵 [API] Llamando al backend para marcar TODAS como leídas...');
    
    const response = await apiClient.post(
      `${NOTIFICATIONS_BASE_URL}/notifications/mark_all_as_read/`
    );
    
    console.log('✅ [API] Respuesta del backend (mark_all):', response.data);
    console.log(`🔍 [API] Status HTTP: ${response.status}`);
    console.log(`🔍 [API] Notificaciones actualizadas: ${response.data.count || 0}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ [API] Error al marcar todas como leídas:', error);
    console.error('❌ [API] Detalles:', error.response?.data);
    throw error;
  }
}

/**
 * Elimina una notificación específica
 * 
 * @param {number} notificationId - ID de la notificación a eliminar
 * @returns {Promise<Object>} Respuesta de eliminación
 */
export async function deleteNotification(notificationId) {
  try {
    const response = await apiClient.delete(
      `${NOTIFICATIONS_BASE_URL}/notifications/${notificationId}/`
    );
    console.log(`✅ Notificación ${notificationId} eliminada`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al eliminar notificación ${notificationId}:`, error);
    throw error;
  }
}

/**
 * Obtiene estadísticas de notificaciones del usuario
 * 
 * @returns {Promise<Object>} Objeto con estadísticas
 */
export async function getNotificationStats() {
  try {
    const response = await apiClient.get(`${NOTIFICATIONS_BASE_URL}/notifications/stats/`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    throw error;
  }
}

// ============================================================
// PREFERENCES (Preferencias de Notificaciones)
// ============================================================

/**
 * Obtiene las preferencias de notificación del usuario
 * Si no existen, el backend las crea con valores por defecto
 * 
 * @returns {Promise<Object>} Objeto con preferencias
 */
export async function getPreferences() {
  try {
    const response = await apiClient.get(`${NOTIFICATIONS_BASE_URL}/preferences/my_preferences/`);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener preferencias:', error);
    throw error;
  }
}

/**
 * Actualiza las preferencias de notificación del usuario
 * 
 * @param {Object} preferences - Objeto con las preferencias a actualizar
 * @returns {Promise<Object>} Preferencias actualizadas
 */
export async function updatePreferences(preferences) {
  try {
    const response = await apiClient.patch(
      `${NOTIFICATIONS_BASE_URL}/preferences/update_preferences/`,
      preferences
    );
    console.log('✅ Preferencias actualizadas:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al actualizar preferencias:', error);
    throw error;
  }
}

// ============================================================
// ADMIN - Envío Manual (Solo para administradores)
// ============================================================

/**
 * Envía una notificación personalizada (solo para administradores)
 * 
 * @param {Object} notificationData - Datos de la notificación
 * @param {Array<number>} notificationData.user_ids - IDs de usuarios (opcional, vacío = todos los admins)
 * @param {string} notificationData.title - Título (requerido, máx 200 caracteres)
 * @param {string} notificationData.body - Mensaje (requerido)
 * @param {string} notificationData.notification_type - Tipo (opcional, default: "CUSTOM")
 * @param {Object} notificationData.data - Datos adicionales (opcional)
 * @param {string} notificationData.image_url - URL de imagen (opcional)
 * @returns {Promise<Object>} Resultado: {total_users, successful_users, failed_users, total_devices, successful_sends, failed_sends}
 */
export async function sendCustomNotification(notificationData) {
  try {
    const response = await apiClient.post(
      `${NOTIFICATIONS_BASE_URL}/notifications/send/`,
      {
        user_ids: notificationData.user_ids || [],
        title: notificationData.title,
        body: notificationData.body,
        notification_type: notificationData.notification_type || 'CUSTOM',
        data: notificationData.data || null,
        image_url: notificationData.image_url || null
      }
    );
    console.log('✅ Notificación personalizada enviada:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al enviar notificación personalizada:', error);
    throw error;
  }
}

/**
 * Obtiene la lista de usuarios activos (para el selector en el admin)
 * 
 * @param {Object} params - Parámetros de búsqueda
 * @param {boolean} params.is_active - Solo usuarios activos (default: true)
 * @param {number} params.page_size - Cantidad de resultados (default: 1000)
 * @returns {Promise<Array>} Array de usuarios con {id, username, email, first_name, last_name}
 */
export async function getActiveUsers(params = {}) {
  try {
    const response = await apiClient.get('/users/', {
      params: {
        is_active: params.is_active !== undefined ? params.is_active : true,
        page_size: params.page_size || 1000,
        ...params
      }
    });
    
    // Manejar respuesta paginada o array directo
    const users = Array.isArray(response.data) ? response.data : (response.data.results || []);
    
    console.log(`✅ ${users.length} usuarios cargados`);
    
    return users;
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error);
    console.error('❌ Detalles del error:', error.response?.data || error.message);
    throw error;
  }
}

// ============================================================
// UTILIDADES
// ============================================================

/**
 * Verifica si hay una sesión activa antes de hacer peticiones
 * 
 * @returns {boolean} True si hay token de autenticación
 */
export function isAuthenticated() {
  const token = localStorage.getItem('access_token');
  return !!token;
}

/**
 * Maneja errores de API de forma consistente
 * 
 * @param {Error} error - Error capturado
 * @returns {Object} Objeto de error formateado
 */
export function handleApiError(error) {
  if (error.response) {
    // El servidor respondió con un código de error
    return {
      status: error.response.status,
      message: error.response.data.message || error.response.data.error || 'Error del servidor',
      data: error.response.data
    };
  } else if (error.request) {
    // La petición fue hecha pero no hubo respuesta
    return {
      status: 0,
      message: 'No se pudo conectar con el servidor',
      data: null
    };
  } else {
    // Algo pasó al configurar la petición
    return {
      status: -1,
      message: error.message || 'Error desconocido',
      data: null
    };
  }
}
