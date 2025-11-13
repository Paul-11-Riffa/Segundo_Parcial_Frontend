# 🔧 Guía Completa de Configuración - SmartSales 365

## 📋 Variables de Entorno Requeridas

### **Frontend (React + Vite)**

El frontend requiere las siguientes variables de entorno en el archivo `.env`:

```env
# ============================================================
# BACKEND API CONFIGURATION
# ============================================================
VITE_API_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000

# ============================================================
# FIREBASE CONFIGURATION
# ============================================================
VITE_FIREBASE_API_KEY=tu_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_VAPID_KEY=tu_vapid_key
```

---

## 🔥 Configuración de Firebase

### **Paso 1: Crear Proyecto en Firebase**

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Clic en "Agregar proyecto" o selecciona tu proyecto existente
3. Sigue el asistente de configuración

### **Paso 2: Crear Aplicación Web**

1. En el Dashboard de Firebase, ve a **Configuración del proyecto** (⚙️)
2. En la pestaña **General**, baja hasta "Tus aplicaciones"
3. Clic en el ícono **</>** (Web)
4. Registra la app con un nombre (ej: "SmartSales 365 Web")
5. Copia las credenciales que aparecen:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",              // → VITE_FIREBASE_API_KEY
  authDomain: "proyecto.firebaseapp.com",  // → VITE_FIREBASE_AUTH_DOMAIN
  projectId: "proyecto-id",          // → VITE_FIREBASE_PROJECT_ID
  storageBucket: "proyecto.appspot.com",   // → VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",    // → VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123:web:abc123"          // → VITE_FIREBASE_APP_ID
};
```

### **Paso 3: Habilitar Servicios**

#### **Authentication (Autenticación)**
1. En el menú lateral, ve a **Authentication**
2. Clic en "Comenzar"
3. Habilita los métodos de autenticación:
   - ✅ **Correo electrónico/contraseña** (obligatorio)
   - Otros métodos opcionales (Google, Facebook, etc.)

#### **Cloud Messaging (Notificaciones Push)**
1. Ve a **Project Settings → Cloud Messaging**
2. En "Web Push certificates", clic en **Generar par de claves**
3. Copia la **Clave pública** (VAPID Key)
   - Formato: `BPxxx...` (aproximadamente 88 caracteres)
   - Esta es tu `VITE_FIREBASE_VAPID_KEY`

---

## 🐍 Configuración del Backend (Django)

### **Variables de Entorno del Backend**

Tu backend Django necesita estas configuraciones (archivo `.env` o settings):

```python
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Django Settings
SECRET_KEY=tu_secret_key_super_segura
DEBUG=False  # True solo en desarrollo
ALLOWED_HOSTS=localhost,127.0.0.1,tu-dominio.com

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://tu-frontend.vercel.app

# Firebase Admin (para validación de tokens)
FIREBASE_CREDENTIALS_PATH=/path/to/serviceAccountKey.json
# O directamente:
FIREBASE_PROJECT_ID=tu_proyecto_id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@tu_proyecto.iam.gserviceaccount.com
```

### **Configuración CORS en Django**

En `settings.py`:

```python
INSTALLED_APPS = [
    # ...
    'corsheaders',
    # ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ← Debe estar PRIMERO
    'django.middleware.common.CommonMiddleware',
    # ...
]

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",           # Frontend en desarrollo
    "http://127.0.0.1:3000",
    "https://tu-app.vercel.app",       # Frontend en producción
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]
```

---

## 🌐 Configuración para Producción

### **Frontend en Vercel**

1. **Conectar Repositorio:**
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub
   - Selecciona el framework: **Vite**

2. **Configurar Variables de Entorno:**
   - Ve a **Settings → Environment Variables**
   - Agrega todas las variables `VITE_*`:

   ```
   VITE_API_URL = https://tu-backend.railway.app
   VITE_API_BASE_URL = https://tu-backend.railway.app
   VITE_FIREBASE_API_KEY = AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN = proyecto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID = proyecto-id
   VITE_FIREBASE_STORAGE_BUCKET = proyecto.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID = 123456789
   VITE_FIREBASE_APP_ID = 1:123:web:abc
   VITE_FIREBASE_VAPID_KEY = BPxxx...
   ```

3. **Build Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

4. **Deploy:**
   - Vercel desplegará automáticamente en cada push a `main`

### **Frontend en Netlify**

1. **Conectar Repositorio:**
   - Ve a [netlify.com](https://netlify.com)
   - New site from Git → Selecciona tu repo

2. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Environment Variables:**
   - Site settings → Build & deploy → Environment
   - Agrega todas las variables `VITE_*`

4. **Deploy:**
   - Deploy site

### **Backend en Railway**

1. **Crear Proyecto:**
   - Ve a [railway.app](https://railway.app)
   - New Project → Deploy from GitHub

2. **Agregar Base de Datos:**
   - Add → Database → PostgreSQL
   - Railway generará automáticamente `DATABASE_URL`

3. **Variables de Entorno:**
   - Settings → Variables
   - Agrega todas las variables de Django

4. **Configurar CORS:**
   - Actualiza `CORS_ALLOWED_ORIGINS` con la URL de Vercel/Netlify

### **Backend en Render**

1. **Crear Web Service:**
   - Dashboard → New → Web Service
   - Conecta tu repositorio

2. **Configuración:**
   - Environment: Python
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn config.wsgi:application`

3. **Variables de Entorno:**
   - Environment → Add Environment Variable
   - Agrega todas las variables necesarias

---

## 🔄 Conexión Frontend ↔ Backend

### **Archivo: `src/services/apiConfig.js`**

```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:8000/api';
```

### **Verificar Conexión**

1. **Backend debe estar corriendo:**
   ```bash
   # Django
   python manage.py runserver
   ```

2. **Frontend debe apuntar al backend:**
   ```env
   # .env
   VITE_API_URL=http://localhost:8000
   ```

3. **Probar endpoints:**
   - Abre DevTools → Network
   - Las peticiones deben ir a `http://localhost:8000/api/...`

---

## ✅ Checklist de Configuración

### **Desarrollo Local**

- [ ] `.env` creado con todas las variables
- [ ] Backend corriendo en `http://localhost:8000`
- [ ] Frontend corriendo en `http://localhost:3000`
- [ ] CORS configurado en Django (`localhost:3000`)
- [ ] Firebase configurado (Authentication + Cloud Messaging)
- [ ] Notificaciones push funcionando
- [ ] Login/Registro funcionando
- [ ] Llamadas API funcionando

### **Producción**

- [ ] Backend desplegado (Railway/Render/Heroku)
- [ ] Frontend desplegado (Vercel/Netlify)
- [ ] Variables de entorno configuradas en ambas plataformas
- [ ] CORS actualizado con URL de producción
- [ ] Firebase configurado con dominio de producción
- [ ] HTTPS habilitado
- [ ] Base de datos en producción configurada
- [ ] `DEBUG=False` en backend
- [ ] Archivos estáticos servidos correctamente

---

## 🐛 Troubleshooting

### **Error: CORS Policy**
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solución:** Agrega la URL del frontend a `CORS_ALLOWED_ORIGINS` en Django

### **Error: Firebase Not Initialized**
```
Firebase: No Firebase App has been created
```
**Solución:** Verifica que todas las variables `VITE_FIREBASE_*` estén configuradas

### **Error: Network Request Failed**
```
TypeError: NetworkError when attempting to fetch resource
```
**Solución:** 
- Verifica que el backend esté corriendo
- Verifica `VITE_API_URL` en `.env`
- Revisa la consola de red (DevTools → Network)

### **Error: Unauthorized (401)**
```
401 Unauthorized
```
**Solución:**
- Verifica que el token esté en localStorage
- Verifica que el header `Authorization: Token xxx` se esté enviando
- Revisa la configuración de autenticación en Django

---

## 📞 URLs de Ejemplo

### **Desarrollo:**
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`
- API: `http://localhost:8000/api/`

### **Producción:**
- Frontend: `https://smartsales365.vercel.app`
- Backend: `https://smartsales-backend.railway.app`
- API: `https://smartsales-backend.railway.app/api/`

---

## 📚 Recursos

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase Console](https://console.firebase.google.com/)
- [Django CORS Headers](https://github.com/adamchainz/django-cors-headers)
- [Vercel Deployment](https://vercel.com/docs)
- [Railway Deployment](https://docs.railway.app/)

---

**¿Necesitas ayuda?** Revisa los logs:
- Frontend: Consola del navegador (F12)
- Backend: Logs del servidor Django
- Firebase: Firebase Console → Analytics → DebugView
