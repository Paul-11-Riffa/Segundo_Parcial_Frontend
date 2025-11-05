# SmartSales365 - Frontend Premium

Sistema de autenticación minimalista y premium para plataforma de ventas inteligente. Construido con React, Vite y TailwindCSS.

## ✨ Características del Diseño

### Diseño Minimalista Premium
- 🎨 Paleta de colores sofisticada (blanco, negro, grises)
- 🖼️ Espaciado generoso y tipografía limpia
- ⚡ Animaciones suaves y transiciones fluidas
- 📱 Completamente responsive
- 🎯 Enfoque en contenido y usabilidad

### Funcionalidades Implementadas
- ✅ **Login** - Formulario de autenticación limpio
- ✅ **Registro** - Creación de cuenta con validaciones
- ✅ **Perfil** - Gestión de información personal
- ✅ **Recuperación de contraseña** - Flujo completo de recuperación
- ✅ **Rutas protegidas** - Control de acceso basado en autenticación
- ✅ **Validación en tiempo real** - Feedback instantáneo al usuario

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## 🔧 Configuración

Edita `src/services/api.js` para configurar la URL del backend:

```javascript
const API_BASE_URL = 'http://localhost:8000/api';
```

## 📄 Estructura de Páginas

- `/` - **Home** - Landing page minimalista con hero section
- `/login` - **Login** - Formulario de inicio de sesión
- `/register` - **Registro** - Creación de cuenta nueva
- `/profile` - **Perfil** - Gestión de información del usuario (protegida)
- `/forgot-password` - **Recuperar contraseña** - Solicitud de recuperación

## 🎨 Sistema de Diseño

### Colores
- **Primary**: Negro (#0f172a) - Botones principales y elementos destacados
- **Secondary**: Grises - Textos secundarios y bordes
- **Accent**: Blanco - Fondos y espacios

### Tipografía
- Familia: **Inter** (Google Fonts)
- Pesos: 300 a 900
- Optimizada para legibilidad web

### Componentes UI
- `Button` - 6 variantes (primary, secondary, outline, danger, success, ghost)
- `Input` - Con iconos y estados de error
- `Card` - Contenedores con sombras suaves
- `Alert` - Notificaciones con 4 tipos (success, error, warning, info)

## 🛠️ Tecnologías

- **React 19** - Library de UI
- **Vite 7** - Build tool ultra-rápido
- **TailwindCSS 4** - Framework CSS utility-first
- **React Router 6** - Navegación
- **Axios** - Cliente HTTP
- **Context API** - Gestión de estado global

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
