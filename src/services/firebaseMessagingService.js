/**
 * Firebase Messaging Service
 * 
 * Servicio para gestionar Firebase Cloud Messaging
 * Maneja permisos, tokens, y mensajes en foreground
 * 
 * @module services/firebaseMessagingService
 */

import { messaging, vapidKey, getToken, onMessage, deleteToken } from './firebase';

// ============================================================
// PERMISOS DE NOTIFICACIONES
// ============================================================

/**
 * Solicita permiso al usuario para mostrar notificaciones
 * 
 * @returns {Promise<string|null>} Token FCM o null si se deniega
 */
export async function requestNotificationPermission() {
  try {
    // Verificar si el navegador soporta notificaciones
    if (!('Notification' in window)) {
      console.warn('⚠️ Este navegador no soporta notificaciones');
      return null;
    }

    // Verificar si messaging está disponible
    if (!messaging) {
      console.warn('⚠️ Firebase Messaging no está disponible');
      return null;
    }

    // Verificar si ya se tiene permiso
    if (Notification.permission === 'granted') {
      console.log('✅ Ya se tiene permiso de notificaciones');
      return await getFCMToken();
    }

    // Solicitar permiso
    console.log('📋 Solicitando permiso de notificaciones...');
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('✅ Permiso de notificaciones concedido');
      return await getFCMToken();
    } else if (permission === 'denied') {
      console.warn('❌ Permiso de notificaciones denegado');
      return null;
    } else {
      console.log('⏭️ Permiso de notificaciones no concedido (dismissed)');
      return null;
    }
  } catch (error) {
    console.error('❌ Error al solicitar permiso:', error);
    return null;
  }
}

/**
 * Verifica si ya se tiene permiso de notificaciones
 * 
 * @returns {boolean} True si tiene permiso concedido
 */
export function hasNotificationPermission() {
  if (!('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
}

/**
 * Verifica si el permiso fue denegado
 * 
 * @returns {boolean} True si fue denegado
 */
export function isNotificationPermissionDenied() {
  if (!('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'denied';
}

/**
 * Verifica el estado actual del permiso
 * 
 * @returns {string} 'granted' | 'denied' | 'default'
 */
export function getNotificationPermissionStatus() {
  if (!('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

// ============================================================
// GESTIÓN DE TOKENS FCM
// ============================================================

/**
 * Obtiene el token FCM actual del dispositivo
 * 
 * @returns {Promise<string|null>} Token FCM o null si no se puede obtener
 */
export async function getFCMToken() {
  try {
    if (!messaging) {
      console.warn('⚠️ Firebase Messaging no disponible');
      return null;
    }

    // Obtener el token con la VAPID key
    const currentToken = await getToken(messaging, { 
      vapidKey: vapidKey 
    });
    
    if (currentToken) {
      console.log('✅ Token FCM obtenido:', currentToken.substring(0, 20) + '...');
      return currentToken;
    } else {
      console.warn('⚠️ No se pudo obtener el token FCM');
      return null;
    }
  } catch (error) {
    // Errores comunes y sus soluciones
    if (error.code === 'messaging/permission-blocked') {
      console.warn('⚠️ Permisos bloqueados. El usuario debe habilitarlos manualmente.');
    } else if (error.code === 'messaging/failed-service-worker-registration') {
      console.warn('⚠️ Service Worker no registrado (timeout). Esto es normal en desarrollo.');
      console.warn('   Las notificaciones en base de datos funcionarán correctamente.');
    } else {
      console.error('❌ Error al obtener token FCM:', error.message);
    }
    
    return null;
  }
}

/**
 * Elimina el token FCM actual (útil al cerrar sesión)
 * 
 * @returns {Promise<boolean>} True si se eliminó correctamente
 */
export async function deleteFCMToken() {
  try {
    if (!messaging) {
      console.warn('⚠️ Firebase Messaging no disponible');
      return false;
    }

    await deleteToken(messaging);
    console.log('✅ Token FCM eliminado correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al eliminar token FCM:', error);
    return false;
  }
}

/**
 * Refresca el token FCM (útil si cambió)
 * 
 * @returns {Promise<string|null>} Nuevo token o null
 */
export async function refreshFCMToken() {
  try {
    console.log('🔄 Refrescando token FCM...');
    
    // Eliminar el token actual
    await deleteFCMToken();
    
    // Obtener uno nuevo
    const newToken = await getFCMToken();
    
    if (newToken) {
      console.log('✅ Token FCM refrescado correctamente');
    }
    
    return newToken;
  } catch (error) {
    console.error('❌ Error al refrescar token FCM:', error);
    return null;
  }
}

// ============================================================
// SERVICE WORKER
// ============================================================

/**
 * Registra el Service Worker de Firebase
 * 
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Workers no soportados en este navegador');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      '/firebase-messaging-sw.js'
    );
    console.log('✅ Service Worker registrado:', registration.scope);
    return registration;
  } catch (error) {
    console.error('❌ Error al registrar Service Worker:', error);
    return null;
  }
}

/**
 * Verifica si el Service Worker está registrado
 * 
 * @returns {Promise<boolean>}
 */
export async function isServiceWorkerRegistered() {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    return !!registration;
  } catch (error) {
    return false;
  }
}

// ============================================================
// ESCUCHAR MENSAJES (FOREGROUND)
// ============================================================

/**
 * Escucha notificaciones cuando la app está en primer plano
 * 
 * @param {Function} callback - Función a ejecutar cuando llega una notificación
 * @returns {Function} Función para desuscribirse
 */
export function listenForMessages(callback) {
  if (!messaging) {
    console.warn('⚠️ Firebase Messaging no disponible');
    return () => {};
  }

  const unsubscribe = onMessage(messaging, (payload) => {
    console.log('📬 Mensaje recibido en primer plano:', payload);
    
    // Extraer información del payload
    const { notification, data } = payload;
    
    if (notification) {
      const notificationData = {
        title: notification.title || 'Nueva Notificación',
        body: notification.body || '',
        image: notification.image || null,
        data: data || {},
        notification_type: data?.notification_type || 'CUSTOM'
      };
      
      // Ejecutar callback con los datos procesados
      callback(notificationData);
      
      // Opcional: Mostrar notificación del navegador si la app está minimizada
      // showBrowserNotification(notificationData.title, notificationData.body, notificationData.image, notificationData.data);
    }
  });

  return unsubscribe;
}

// ============================================================
// NOTIFICACIONES DEL NAVEGADOR
// ============================================================

/**
 * Muestra una notificación del navegador (opcional)
 * Útil para mostrar notificaciones cuando la app está en foreground
 * 
 * @param {string} title - Título de la notificación
 * @param {string} body - Cuerpo del mensaje
 * @param {string} image - URL de imagen (opcional)
 * @param {Object} data - Datos adicionales
 */
export function showBrowserNotification(title, body, image = null, data = {}) {
  if (!('Notification' in window)) {
    console.warn('⚠️ Notificaciones no soportadas');
    return;
  }

  if (Notification.permission !== 'granted') {
    console.warn('⚠️ No hay permiso para mostrar notificaciones');
    return;
  }

  try {
    const options = {
      body: body,
      icon: image || '/vite.svg',
      badge: '/vite.svg',
      data: data,
      requireInteraction: false,
      tag: data.notification_type || 'default',
      silent: false
    };

    const notification = new Notification(title, options);

    // Manejar clic en la notificación
    notification.onclick = function(event) {
      event.preventDefault();
      window.focus();
      
      // Aquí podrías agregar lógica de navegación
      // Por ejemplo: navegar a una ruta específica según el tipo
      
      notification.close();
    };
  } catch (error) {
    console.error('❌ Error al mostrar notificación del navegador:', error);
  }
}

// ============================================================
// UTILIDADES
// ============================================================

/**
 * Verifica si el navegador soporta notificaciones push
 * 
 * @returns {boolean}
 */
export function supportsNotifications() {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

/**
 * Obtiene información del dispositivo
 * 
 * @returns {Object} Información del dispositivo
 */
export function getDeviceInfo() {
  const userAgent = navigator.userAgent;
  
  // Detectar navegador
  let browser = 'Unknown';
  if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) browser = 'Chrome';
  else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) browser = 'Safari';
  else if (userAgent.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (userAgent.indexOf('Edg') > -1) browser = 'Edge';
  else if (userAgent.indexOf('Opera') > -1) browser = 'Opera';
  
  // Detectar sistema operativo
  let os = 'Unknown';
  if (userAgent.indexOf('Windows') > -1) os = 'Windows';
  else if (userAgent.indexOf('Mac') > -1) os = 'macOS';
  else if (userAgent.indexOf('Linux') > -1) os = 'Linux';
  else if (userAgent.indexOf('Android') > -1) os = 'Android';
  else if (userAgent.indexOf('iOS') > -1 || userAgent.indexOf('iPhone') > -1) os = 'iOS';
  
  return {
    browser,
    os,
    deviceName: `${browser} on ${os}`,
    platform: 'WEB',
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  };
}

/**
 * Genera una función de retry con backoff exponencial
 * 
 * @param {Function} fn - Función a ejecutar
 * @param {number} maxRetries - Número máximo de reintentos
 * @param {number} delay - Delay inicial en ms
 * @returns {Promise}
 */
export async function retryWithBackoff(fn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Intento ${i + 1} de ${maxRetries} falló:`, error.message);
      
      if (i < maxRetries - 1) {
        const waitTime = delay * Math.pow(2, i);
        console.log(`⏳ Esperando ${waitTime}ms antes de reintentar...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError;
}
