/**
 * Firebase Service - Inicialización de Firebase y Messaging
 * 
 * Este servicio maneja:
 * - Inicialización de Firebase App
 * - Inicialización de Firebase Cloud Messaging
 * - Verificación de compatibilidad del navegador
 * 
 * @module services/firebase
 */

import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';
import { firebaseConfig, vapidKey } from '../config/firebase.config';

// Inicializar Firebase App
let app = null;
let messaging = null;

try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase App inicializado correctamente');
} catch (error) {
  console.error('❌ Error al inicializar Firebase App:', error);
}

/**
 * Inicializa Firebase Cloud Messaging
 * Verifica primero si el navegador soporta FCM
 * 
 * @returns {Promise<Messaging|null>} Instancia de Messaging o null si no es compatible
 */
async function initializeMessaging() {
  try {
    // Verificar si el navegador soporta Firebase Messaging
    const supported = await isSupported();
    
    if (!supported) {
      console.warn('⚠️ Firebase Messaging no es soportado en este navegador');
      return null;
    }

    // Inicializar Messaging
    messaging = getMessaging(app);
    console.log('✅ Firebase Messaging inicializado correctamente');
    
    return messaging;
  } catch (error) {
    console.error('❌ Error al inicializar Firebase Messaging:', error);
    return null;
  }
}

// Inicializar Messaging automáticamente
if (app) {
  initializeMessaging();
}

/**
 * Verifica si Firebase está correctamente configurado
 * 
 * @returns {boolean} True si Firebase está configurado
 */
export function isFirebaseConfigured() {
  return app !== null;
}

/**
 * Verifica si Firebase Messaging está disponible
 * 
 * @returns {boolean} True si Messaging está disponible
 */
export function isMessagingAvailable() {
  return messaging !== null;
}

/**
 * Obtiene la instancia de Firebase Messaging
 * 
 * @returns {Messaging|null} Instancia de Messaging
 */
export function getMessagingInstance() {
  return messaging;
}

// Exportar instancias y configuración
export { app, messaging, vapidKey };

// Exportar funciones de Firebase Messaging para uso directo
export { 
  getToken, 
  onMessage, 
  deleteToken 
} from 'firebase/messaging';
