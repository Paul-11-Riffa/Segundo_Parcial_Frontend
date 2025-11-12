# SmartSales 365 - Frontend

Sistema inteligente de ventas con funcionalidades avanzadas de gestión de productos, órdenes, notificaciones en tiempo real y sistema de reclamos.

## 🚀 Características Principales

- **Tienda Online**: Catálogo completo con búsqueda por voz y filtros avanzados
- **Carrito de Compras**: Gestión de productos con cálculo automático de totales
- **Sistema de Órdenes**: Historial completo y seguimiento en tiempo real
- **Notificaciones Push**: Alertas en tiempo real con Firebase Cloud Messaging
- **Sistema de Reclamos**: Gestión completa de reclamos para clientes y administradores
- **Panel de Administración**: Dashboard con métricas, gestión de inventario y auditoría
- **Búsqueda por Voz**: Búsqueda inteligente de productos mediante comandos de voz
- **Predicciones ML**: Análisis predictivo de ventas y demanda de productos
- **Autenticación Firebase**: Login, registro y recuperación de contraseña

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Firebase (para autenticación y notificaciones)
- Backend API en ejecución

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/Paul-11-Riffa/Segundo_Parcial_Frontend.git
cd Segundo_Parcial_Frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales de Firebase
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🔧 Variables de Entorno

Copia `.env.example` a `.env` y configura las siguientes variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
VITE_FIREBASE_VAPID_KEY=tu_vapid_key
```

### Obtener credenciales de Firebase:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Project Settings > General > Your apps**
4. Copia las credenciales de tu aplicación web
5. Para el VAPID Key: **Cloud Messaging > Web Push certificates**

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo

# Producción
npm run build        # Construir para producción
npm run preview      # Previsualizar build de producción

# Linting
npm run lint         # Ejecutar ESLint
```

## 🏗️ Estructura del Proyecto

```
src/
├── components/      # Componentes reutilizables
│   ├── admin/      # Componentes del panel de administración
│   ├── cart/       # Componentes del carrito
│   ├── charts/     # Gráficos y visualizaciones
│   ├── claims/     # Sistema de reclamos
│   ├── notifications/
│   └── ui/         # Componentes UI base
├── context/        # Context API (Auth, Cart, Notifications)
├── hooks/          # Custom React Hooks
├── pages/          # Páginas principales
├── services/       # Servicios API
├── styles/         # Estilos globales y CSS
└── utils/          # Utilidades y helpers
```

## 🎨 Tecnologías

- **React 18** - Framework principal
- **Vite** - Build tool y dev server
- **Firebase** - Autenticación y Cloud Messaging
- **Tailwind CSS** - Framework de estilos
- **Lucide React** - Iconos
- **Recharts** - Gráficos y visualizaciones
- **React Router** - Navegación

## 🚀 Despliegue en Producción

### Vercel (Recomendado)

1. Conecta tu repositorio en [Vercel](https://vercel.com)
2. Configura las variables de entorno en el dashboard
3. Deploy automático en cada push a `main`

### Netlify

1. Conecta tu repositorio en [Netlify](https://netlify.com)
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configura las variables de entorno

### Manual

```bash
# Construir para producción
npm run build

# Los archivos estarán en la carpeta dist/
# Subir a tu servidor o hosting
```

## 📱 Características del Sistema de Reclamos

- **Cliente**: Crear reclamos, adjuntar imágenes, seguimiento de estado
- **Administrador**: Gestionar todos los reclamos, asignación automática, respuestas
- **Estados**: Pendiente, En Revisión, Resuelto, Rechazado
- **Prioridades**: Baja, Media, Alta
- **Notificaciones**: Alertas en tiempo real de cambios de estado

## 🔐 Seguridad

- Variables de entorno protegidas (`.env` en `.gitignore`)
- Autenticación con Firebase
- Rutas protegidas por rol (cliente/admin)
- Validación de permisos en todas las operaciones

## 🤝 Contribución

Este es un proyecto académico del Segundo Parcial de Frontend.

## 📄 Licencia

Proyecto académico - Universidad [Tu Universidad]

## 👨‍💻 Autor

Paul Riffa - [@Paul-11-Riffa](https://github.com/Paul-11-Riffa)

---

**¡Gracias por usar SmartSales 365!** 🎉
