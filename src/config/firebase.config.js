/**
 * Firebase Configuration
 * 
 * INSTRUCCIONES PARA CONFIGURAR:
 * 1. Ve a Firebase Console: https://console.firebase.google.com/
 * 2. Selecciona tu proyecto
 * 3. Ve a Project Settings (⚙️)
 * 4. En "Your apps", copia la configuración de tu app web
 * 5. Reemplaza los valores a continuación con tus credenciales
 * 
 * IMPORTANTE: 
 * - NO subas este archivo con credenciales reales a Git público
 * - Considera usar variables de entorno (.env) para producción
 */

// Configuración de Firebase
export const firebaseConfig = {
  apiKey: "AIzaSyDk-EtyNkHhj82Xsp2eVDhgn9J8Sh1Echo",
  authDomain: "smartsales365-5a743.firebaseapp.com",
  projectId: "smartsales365-5a743",
  storageBucket: "smartsales365-5a743.firebasestorage.app",
  messagingSenderId: "630478604123",
  appId: "1:630478604123:web:16583ae35eb7208f607c7e",
  measurementId: "G-5F81LJVE9Y"
};

/**
 * VAPID Key (Voluntary Application Server Identification)
 * 
 * Para obtener tu VAPID Key:
 * 1. En Firebase Console → Project Settings
 * 2. Pestaña "Cloud Messaging"
 * 3. En "Web Push certificates", genera o copia el Key pair
 * 
 * IMPORTANTE: Esta clave es pública y puede incluirse en el código
 */
export const vapidKey = "BGiGqybeeOmMFSoToLUhT-FV_zMbZOJbcwomuSTH4VwYQ-0h3dsNxjgesUuaKzOKJ7k9YROLnhCO3LPPn00ywQU";

/**
 * Configuración alternativa usando variables de entorno (recomendado para producción)
 * 
 * 1. Crear archivo .env en la raíz del proyecto:
 * 
 * VITE_FIREBASE_API_KEY=tu_api_key
 * VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
 * VITE_FIREBASE_PROJECT_ID=tu_proyecto
 * VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
 * VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
 * VITE_FIREBASE_APP_ID=1:123456789012:web:abc123
 * VITE_FIREBASE_VAPID_KEY=BNxxxxxxxx
 * 
 * 2. Descomentar el código siguiente y comentar el firebaseConfig de arriba:
 */

/*
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
*/
