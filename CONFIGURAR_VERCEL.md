# 🚀 Configuración de Variables de Entorno en Vercel

## ✅ TUS URLs CONFIGURADAS:
- **Frontend Vercel:** https://segundo-parcial-frontend.vercel.app/
- **Backend Render:** https://segundoparcial-backend.onrender.com

---

## 📋 PASOS A SEGUIR AHORA:

### **PASO 1: Configurar Variables en Vercel (5 minutos)**

1. **Abre Vercel Dashboard:**
   ```
   https://vercel.com/dashboard
   ```

2. **Selecciona tu proyecto:**
   - Busca: `segundo-parcial-frontend`
   - Click en el proyecto

3. **Ve a Settings → Environment Variables:**
   - Click en `Settings` (menú lateral)
   - Click en `Environment Variables`

4. **Agrega CADA una de estas variables:**

   #### Variable 1: VITE_API_URL ⭐ (LA MÁS IMPORTANTE)
   ```
   Name: VITE_API_URL
   Value: https://segundoparcial-backend.onrender.com
   ```
   ✅ Marca: **Production**, **Preview**, **Development**
   Click: **Save**

   #### Variable 2: VITE_API_BASE_URL
   ```
   Name: VITE_API_BASE_URL
   Value: https://segundoparcial-backend.onrender.com
   ```
   ✅ Marca: **Production**, **Preview**, **Development**
   Click: **Save**

   #### Variables de Firebase (agregar una por una):

   ```
   Name: VITE_FIREBASE_API_KEY
   Value: AIzaSyDk-EtyNkHhj82Xsp2eVDhgn9J8Sh1Echo
   ```
   
   ```
   Name: VITE_FIREBASE_AUTH_DOMAIN
   Value: smartsales365-5a743.firebaseapp.com
   ```
   
   ```
   Name: VITE_FIREBASE_PROJECT_ID
   Value: smartsales365-5a743
   ```
   
   ```
   Name: VITE_FIREBASE_STORAGE_BUCKET
   Value: smartsales365-5a743.firebasestorage.app
   ```
   
   ```
   Name: VITE_FIREBASE_MESSAGING_SENDER_ID
   Value: 630478604123
   ```
   
   ```
   Name: VITE_FIREBASE_APP_ID
   Value: 1:630478604123:web:16583ae35eb7208f607c7e
   ```
   
   ```
   Name: VITE_FIREBASE_VAPID_KEY
   Value: BGiGqybeeOmMFSoToLUhT-FV_zMbZOJbcwomuSTH4VwYQ-0h3dsNxjgesUuaKzOKJ7k9YROLnhCO3LPPn00ywQU
   ```

   **IMPORTANTE:** Para cada variable, marca los 3 ambientes: Production, Preview, Development

---

### **PASO 2: Redeploy en Vercel**

Después de agregar TODAS las variables:

1. **Ve a la tab "Deployments"**
2. **Click en los 3 puntos (⋯)** del deployment más reciente
3. **Click en "Redeploy"**
4. **Click en "Redeploy"** nuevamente para confirmar
5. **Espera** a que termine el deployment (~2 minutos)

---

### **PASO 3: Configurar CORS en tu Backend de Render** ⚠️

Tu backend necesita permitir peticiones desde Vercel. 

#### Opción A - Desde Render Dashboard:

1. **Ve a tu servicio en Render:**
   ```
   https://dashboard.render.com/
   ```

2. **Selecciona tu backend:** `segundoparcial-backend`

3. **Environment → Add Environment Variable:**
   
   Agrega estas variables (si no existen):
   
   ```
   Name: CORS_ALLOWED_ORIGINS
   Value: https://segundo-parcial-frontend.vercel.app,http://localhost:5173
   ```
   
   ```
   Name: CSRF_TRUSTED_ORIGINS
   Value: https://segundo-parcial-frontend.vercel.app
   ```

4. **Save Changes** (Render hará auto-deploy)

#### Opción B - En tu código Django (settings.py):

Si tienes acceso al código del backend, verifica/agrega esto:

```python
# settings.py

# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "https://segundo-parcial-frontend.vercel.app",
    "http://localhost:5173",  # Para desarrollo local
]

# CSRF Configuration
CSRF_TRUSTED_ORIGINS = [
    "https://segundo-parcial-frontend.vercel.app",
]

# Asegúrate de tener estos middlewares
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ⬅️ Debe estar PRIMERO
    'django.middleware.security.SecurityMiddleware',
    # ... otros middlewares
]
```

Luego haz commit y push para que Render lo despliegue.

---

### **PASO 4: Verificar que Funciona**

1. **Espera 2-3 minutos** (Render puede tardar en despertar si está en plan gratuito)

2. **Abre tu frontend:**
   ```
   https://segundo-parcial-frontend.vercel.app/
   ```

3. **Abre la Consola del Navegador** (F12)

4. **Ejecuta este comando en la consola:**
   ```javascript
   console.log('API URL:', import.meta.env.VITE_API_URL)
   ```
   
   Debería mostrar: `https://segundoparcial-backend.onrender.com`
   
   ❌ Si muestra `localhost`, las variables NO se cargaron → vuelve al PASO 1

5. **Intenta hacer Login:**
   - Ve a la página de login
   - Ingresa tus credenciales
   - Abre Network tab (F12 → Network)
   - Las peticiones deberían ir a: `https://segundoparcial-backend.onrender.com/api/...`

6. **Verifica que NO haya errores de CORS:**
   - Si ves: "has been blocked by CORS policy" → ve al PASO 3

---

## 🎯 Checklist Final:

- [ ] Variables agregadas en Vercel (8 variables en total)
- [ ] Redeploy realizado en Vercel
- [ ] CORS configurado en backend de Render
- [ ] `import.meta.env.VITE_API_URL` muestra la URL de Render (no localhost)
- [ ] Login funciona sin errores de CORS
- [ ] Productos se cargan correctamente

---

## 🐛 Problemas Comunes:

### ❌ "Access to XMLHttpRequest blocked by CORS"
**Causa:** Backend no permite peticiones desde Vercel
**Solución:** Configurar CORS (PASO 3)

### ❌ Sigue mostrando "localhost:8000"
**Causa:** Variables no se cargaron o no se hizo redeploy
**Solución:** 
1. Verifica que las variables estén en Vercel Dashboard
2. Haz redeploy SIN usar cache
3. Borra cache del navegador (Ctrl+Shift+Delete)

### ❌ "ERR_NAME_NOT_RESOLVED"
**Causa:** URL del backend incorrecta
**Solución:** Verifica que `https://segundoparcial-backend.onrender.com` esté accesible

### ⚠️ Backend muy lento (30+ segundos)
**Causa:** Plan gratuito de Render hiberna el servicio
**Solución:** 
- Normal en plan gratuito
- El timeout ya está configurado a 60s
- Considera upgrade a plan de pago

---

## 📞 Ayuda Adicional:

Si después de seguir todos los pasos sigues teniendo problemas:

1. **Captura de pantalla** de las variables en Vercel
2. **Console logs** del navegador (F12)
3. **Network tab** mostrando las peticiones fallidas
4. **Envíame la info** y te ayudo a depurar

---

## ✅ Una vez configurado:

Tu aplicación funcionará así:
```
🌐 Usuario accede a: https://segundo-parcial-frontend.vercel.app
    ↓
📱 Frontend (React + Vite) cargado desde Vercel
    ↓
🔗 Frontend hace peticiones a: https://segundoparcial-backend.onrender.com/api/
    ↓
🚀 Backend (Django) en Render procesa y responde
    ↓
✅ Frontend muestra los datos
```

¡Éxito! 🎉
