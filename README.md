# Sistema de Autenticación - ElectroShop Frontend

Sistema completo de autenticación para ecommerce de electrodomésticos con React, Vite, TailwindCSS y conexión a backend Django REST Framework.

## Características

- ✅ Login y Registro de usuarios
- ✅ Gestión de perfil
- ✅ Recuperación de contraseña
- ✅ Rutas protegidas
- ✅ Diseño responsive
- ✅ Validación de formularios
- ✅ Manejo de tokens automático
- ✅ Interfaz moderna con TailwindCSS

## Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Configuración

Edita `src/services/api.js` para configurar la URL del backend:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

## Rutas

- `/` - Página principal
- `/login` - Iniciar sesión
- `/register` - Registro de usuario
- `/profile` - Perfil (requiere autenticación)
- `/forgot-password` - Recuperar contraseña
- `/reset-password` - Restablecer contraseña

## Tecnologías

- React 19
- Vite 7
- TailwindCSS 4
- React Router 6
- Axios

## Scripts

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run preview  # Preview del build
npm run lint     # Linting
```

## Backend

Este frontend está diseñado para conectarse con un backend Django REST Framework.

Endpoints utilizados:
- `POST /api/register/` - Registro
- `POST /api/login/` - Login
- `POST /api/logout/` - Logout
- `GET /api/profile/` - Obtener perfil
- `PUT /api/profile/` - Actualizar perfil
- `POST /api/password-reset/` - Solicitar reset
- `POST /api/password-reset/confirm/` - Confirmar reset

## Licencia

MIT
