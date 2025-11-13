# 🚀 Guía Completa: Configurar Variables de Entorno en Vercel

## 📝 Problema Identificado

Tu aplicación en Vercel está intentando conectarse a `http://localhost:8000`, que solo funciona en tu máquina local. Necesitas configurar la URL de tu backend desplegado.

---

## ✅ Solución en 3 Pasos

### **Paso 1: Configurar Variables en Vercel Dashboard**

1. **Accede a tu proyecto en Vercel:**
   - Ve a: https://vercel.com/dashboard
   - Selecciona tu proyecto: `segundo-parcial-frontend`

2. **Ve a Settings → Environment Variables:**
   - Click en el proyecto
   - Menú lateral: `Settings`
   - Tab: `Environment Variables`

3. **Agrega las siguientes variables:**

   **Variable 1: VITE_API_URL**
   ```
   Name: VITE_API_URL
   Value: https://segundoparcial-backend.onrender.com
   Environment: Production, Preview, Development (seleccionar todos)
   ```

   **Variable 2: VITE_API_BASE_URL** (opcional, pero recomendado)
   ```
   Name: VITE_API_BASE_URL
   Value: https://segundoparcial-backend.onrender.com
   Environment: Production, Preview, Development
   ```

   **Variables de Firebase** (agregar todas estas):
   ```
   VITE_FIREBASE_API_KEY=AIzaSyDk-EtyNkHhj82Xsp2eVDhgn9J8Sh1Echo
   VITE_FIREBASE_AUTH_DOMAIN=smartsales365-5a743.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=smartsales365-5a743
   VITE_FIREBASE_STORAGE_BUCKET=smartsales365-5a743.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=630478604123
   VITE_FIREBASE_APP_ID=1:630478604123:web:16583ae35eb7208f607c7e
   VITE_FIREBASE_VAPID_KEY=BGiGqybeeOmMFSoToLUhT-FV_zMbZOJbcwomuSTH4VwYQ-0h3dsNxjgesUuaKzOKJ7k9YROLnhCO3LPPn00ywQU
   ```

4. **Click en "Save"** para cada variable

---

### **Paso 2: Redeploy tu Aplicación**

Después de agregar las variables de entorno:

1. **Opción A - Desde Vercel Dashboard:**
   - Ve a la tab `Deployments`
   - Click en los 3 puntos (...) del último deployment
   - Click en `Redeploy`
   - ✅ Marca la opción "Use existing Build Cache" (desmarcar para rebuild completo)

2. **Opción B - Desde Git:**
   ```bash
   git commit --allow-empty -m "Trigger Vercel rebuild"
   git push origin main
   ```

---

### **Paso 3: Verificar la Configuración**

1. **Verifica que las variables estén cargadas:**
   - Abre la consola del navegador en tu app de Vercel
   - Ejecuta:
     ```javascript
     console.log(import.meta.env.VITE_API_URL)
     ```
   - Debería mostrar la URL de tu backend, NO `localhost`

2. **Prueba el login:**
   - Intenta hacer login
   - Verifica en Network tab que las peticiones vayan a tu backend desplegado

---

## 🔧 URLs de Backend según el Servicio

Reemplaza `https://TU_BACKEND_URL_AQUI` con la URL correcta según donde desplegaste:

### Railway
```
https://tu-proyecto.railway.app
```

### Render
```
https://tu-proyecto.onrender.com
```

### Heroku
```
https://tu-proyecto.herokuapp.com
```

### PythonAnywhere
```
https://tuusuario.pythonanywhere.com
```

### Google Cloud Run
```
https://tu-servicio-xyz123.run.app
```

---

## ⚠️ IMPORTANTE: Configurar CORS en el Backend

Tu backend también necesita permitir peticiones desde Vercel. En tu `settings.py` de Django:

```python
# settings.py

# Agregar el dominio de Vercel a CORS_ALLOWED_ORIGINS
CORS_ALLOWED_ORIGINS = [
    "https://segundo-parcial-frontend.vercel.app",
    "http://localhost:5173",  # Desarrollo local
]

# O usar wildcard (NO recomendado en producción)
CORS_ALLOW_ALL_ORIGINS = True  # Solo para testing

# Configurar CSRF_TRUSTED_ORIGINS
CSRF_TRUSTED_ORIGINS = [
    "https://segundo-parcial-frontend.vercel.app",
]
```

---

## 📋 Checklist Final

- [ ] Variables de entorno agregadas en Vercel Dashboard
- [ ] VITE_API_URL apunta al backend desplegado (NO localhost)
- [ ] Redeploy realizado en Vercel
- [ ] CORS configurado en el backend para permitir Vercel
- [ ] Login funciona correctamente
- [ ] No hay errores de CORS en la consola

---

## 🐛 Troubleshooting

### Error: "CORS policy: Permission was denied"
**Solución:** Configura CORS en tu backend Django (ver sección arriba)

### Error: "net::ERR_NAME_NOT_RESOLVED"
**Solución:** Verifica que la URL del backend sea correcta y esté accesible

### Las variables no se cargan
**Solución:** 
1. Verifica que empiecen con `VITE_` (obligatorio para Vite)
2. Haz un redeploy completo (sin cache)
3. Verifica en Vercel Dashboard que estén guardadas

### Backend en Railway tarda mucho
**Solución:** Railway puede tardar en responder en plan gratuito. Aumenta el timeout en `apiConfig.js` a 60000ms (ya configurado)

---

## 📞 Siguiente Paso

**Dime la URL de tu backend desplegado** y te ayudo a:
1. Actualizar el archivo `.env.production`
2. Configurar las variables en Vercel
3. Verificar que CORS esté bien configurado

Ejemplo: "Mi backend está en: `https://mi-proyecto.railway.app`"
