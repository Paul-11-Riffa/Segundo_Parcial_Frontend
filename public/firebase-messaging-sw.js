/**
 * Firebase Cloud Messaging Service Worker
 * 
 * Este Service Worker maneja las notificaciones push cuando la aplicación
 * está en segundo plano o cerrada.
 * 
 * IMPORTANTE: Este archivo debe estar en la carpeta /public
 * 
 * Funciones:
 * - Recibir notificaciones en background
 * - Mostrar notificaciones del sistema
 * - Manejar clics en notificaciones
 * - Abrir/enfocar la aplicación al hacer clic
 */

// Importar Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// ============================================================
// CONFIGURACIÓN DE FIREBASE
// ============================================================
// IMPORTANTE: Esta configuración debe coincidir con firebase.config.js
const firebaseConfig = {
  apiKey: "AIzaSyDk-EtyNkHhj82Xsp2eVDhgn9J8Sh1Echo",
  authDomain: "smartsales365-5a743.firebaseapp.com",
  projectId: "smartsales365-5a743",
  storageBucket: "smartsales365-5a743.firebasestorage.app",
  messagingSenderId: "630478604123",
  appId: "1:630478604123:web:16583ae35eb7208f607c7e",
  measurementId: "G-5F81LJVE9Y"
};

// Inicializar Firebase en el Service Worker
firebase.initializeApp(firebaseConfig);

// Obtener instancia de Messaging
const messaging = firebase.messaging();

// ============================================================
// MANEJAR MENSAJES EN SEGUNDO PLANO
// ============================================================

/**
 * Se ejecuta cuando llega una notificación y la app está en background
 */
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensaje recibido en segundo plano:', payload);

  // Extraer información del payload
  const notificationTitle = payload.notification?.title || 'Nueva Notificación';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.image || '/vite.svg',
    badge: '/vite.svg',
    data: payload.data || {},
    tag: payload.data?.notification_type || 'default',
    requireInteraction: false,
    silent: false
  };

  // Mostrar la notificación
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// ============================================================
// MANEJAR CLIC EN NOTIFICACIÓN
// ============================================================

/**
 * Se ejecuta cuando el usuario hace clic en una notificación
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notificación clickeada:', event);
  
  // Cerrar la notificación
  event.notification.close();

  // Obtener datos de la notificación
  const data = event.notification.data || {};
  
  // Determinar URL a la que navegar según el tipo de notificación
  let urlToOpen = '/';
  
  // Mapeo de tipos de notificación a rutas
  if (data.order_id) {
    urlToOpen = `/admin/sales/orders`;
  } else if (data.product_id) {
    urlToOpen = `/admin/inventory/products`;
  } else if (data.report_url) {
    urlToOpen = data.report_url;
  } else if (data.report_type) {
    urlToOpen = `/reports`;
  } else if (data.prediction_id) {
    urlToOpen = `/predictions`;
  } else if (data.notification_type === 'SYSTEM') {
    urlToOpen = '/dashboard';
  }

  // Abrir o enfocar la ventana de la aplicación
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((clientList) => {
      // Buscar si ya hay una ventana abierta
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        
        // Si encontramos una ventana, enfocarla y navegar
        if ('focus' in client) {
          client.focus();
          
          // Navegar a la URL correspondiente
          if (client.url !== urlToOpen) {
            return client.navigate(urlToOpen);
          }
          
          return client;
        }
      }
      
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ============================================================
// MANEJAR INSTALACIÓN DEL SERVICE WORKER
// ============================================================

self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker instalado');
  // Forzar que el nuevo Service Worker tome control inmediatamente
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker activado');
  // Tomar control de todas las páginas inmediatamente
  event.waitUntil(clients.claim());
});

// ============================================================
// LOG DE INFORMACIÓN
// ============================================================

console.log('[firebase-messaging-sw.js] Firebase Messaging Service Worker cargado');
