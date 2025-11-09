/**
 * ============================================================
 * ASISTENTE DE CONFIGURACIÓN DE FIREBASE
 * ============================================================
 * 
 * Este archivo te ayudará a configurar tus credenciales de Firebase.
 * Sigue las instrucciones paso a paso.
 */

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║        🔥 ASISTENTE DE CONFIGURACIÓN DE FIREBASE 🔥           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

📋 PASOS PARA OBTENER TUS CREDENCIALES:

═══════════════════════════════════════════════════════════════

PASO 1: ACCEDER A FIREBASE CONSOLE
───────────────────────────────────
1. Abrir: https://console.firebase.google.com/
2. Iniciar sesión con tu cuenta de Google

═══════════════════════════════════════════════════════════════

PASO 2: CREAR O SELECCIONAR PROYECTO
─────────────────────────────────────
Si NO tienes proyecto:
  → Clic en "Agregar proyecto" / "Add project"
  → Dale un nombre (ej: "NotificacionesApp")
  → Siguiente → Siguiente → Crear proyecto

Si YA tienes proyecto:
  → Selecciónalo de la lista

═══════════════════════════════════════════════════════════════

PASO 3: REGISTRAR APP WEB
──────────────────────────
1. En el panel principal, clic en el ícono </> (Web)
2. Dale un nombre a tu app (ej: "Frontend Web")
3. NO marcar "Firebase Hosting"
4. Clic en "Registrar app"

¡IMPORTANTE! Aparecerán las credenciales así:

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123"
};

→ COPIA TODO ESTE OBJETO (lo necesitaremos)

═══════════════════════════════════════════════════════════════

PASO 4: OBTENER VAPID KEY
──────────────────────────
1. Clic en el ícono de engranaje ⚙️ → "Project settings"
2. Ir a la pestaña "Cloud Messaging"
3. Bajar hasta "Web Push certificates"
4. Si NO hay clave:
   → Clic en "Generate key pair"
5. COPIAR la clave que aparece (empieza con "BN...")

═══════════════════════════════════════════════════════════════

PASO 5: HABILITAR CLOUD MESSAGING API (IMPORTANTE)
───────────────────────────────────────────────────
1. En la pestaña "Cloud Messaging" (mismo lugar)
2. Verás un botón "..." o enlace a Google Cloud Console
3. Clic en el enlace de "Cloud Messaging API"
4. Si está deshabilitada:
   → Clic en "ENABLE" / "HABILITAR"
5. Esperar que se active (unos segundos)

═══════════════════════════════════════════════════════════════

✅ UNA VEZ QUE TENGAS LAS CREDENCIALES:
──────────────────────────────────────────
Proporciona:
1. Tu firebaseConfig completo
2. Tu vapidKey (la clave larga que empieza con BN...)

Y yo las configuraré automáticamente en tu proyecto.

═══════════════════════════════════════════════════════════════
`);

// Plantilla para que copies tus credenciales
const PLANTILLA_CREDENCIALES = {
  firebaseConfig: {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abc123"
  },
  vapidKey: "TU_VAPID_KEY_AQUI"
};

console.log("\n📝 PLANTILLA PARA TUS CREDENCIALES:\n");
console.log(JSON.stringify(PLANTILLA_CREDENCIALES, null, 2));
console.log("\n");
