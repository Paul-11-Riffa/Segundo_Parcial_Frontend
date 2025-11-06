# Módulo de Reportes por Comando de Voz 🎤

## 📋 Descripción

Módulo completo de generación de reportes mediante comandos de voz con una experiencia UX/UI intuitiva que guía al usuario a través de todos los estados del proceso.

## 🎯 Características

### Backend (Ya implementado)
- ✅ API REST en `/api/voice-commands/`
- ✅ Parser unificado con 14 tipos de reportes
- ✅ Reconocimiento de lenguaje natural en español
- ✅ Generación de reportes en PDF, Excel y JSON
- ✅ Integración con ML para predicciones
- ✅ Sistema de confianza y sugerencias

### Frontend (Nuevo)
- ✅ Botón global de acceso en el Header
- ✅ Modal interactivo con 6 estados visuales
- ✅ Reconocimiento de voz nativo del navegador
- ✅ Animación de ondas de voz en tiempo real
- ✅ Entrada manual alternativa
- ✅ Página de historial de reportes
- ✅ Sistema de descarga de PDFs

## 🏗️ Estructura de Archivos

```
src/
├── services/admin/
│   └── voiceCommandService.js         # API service
├── hooks/admin/
│   └── useVoiceCommand.js             # Custom hook con toda la lógica
├── components/admin/
│   ├── voice/
│   │   ├── VoiceCommandModal.jsx      # Modal principal (6 estados)
│   │   ├── VoiceWaveAnimation.jsx     # Animación de ondas
│   │   └── VoiceWaveAnimation.css     # Estilos de animación
│   └── Header.jsx                     # Actualizado con botón de voz
├── components/ui/
│   └── dialog.jsx                     # Componente Dialog creado
├── pages/admin/voice/
│   └── VoiceReportsPage.jsx           # Historial de reportes
└── App.jsx                            # Rutas actualizadas
```

## 🎨 Estados del Modal

### 1. **IDLE** - Listo para Escuchar
- Botón grande de micrófono
- Input manual alternativo
- Ejemplos de comandos disponibles

### 2. **LISTENING** - Grabando Audio
- Micrófono pulsando (rojo)
- Animación de ondas de voz
- Transcripción en tiempo real

### 3. **PROCESSING** - Backend Procesando
- Spinner de carga
- Muestra el comando recibido
- Permite cancelar si se entendió mal

### 4. **GENERATING** - Generando PDF
- Ícono de documento animado
- Barra de progreso
- Mensaje de confirmación

### 5. **SUCCESS** - Reporte Listo
- Ícono de éxito (checkmark)
- Información del reporte
- Botones de descarga PDF/Excel
- Opción para nuevo reporte

### 6. **ERROR** - Error o Baja Confianza
- Ícono de alerta
- Mensaje de error específico
- Sugerencias si están disponibles
- Botón para reintentar

## 🔧 Instalación

### 1. Instalar dependencia de Radix UI (para el Dialog)

```bash
cd FRONTEND/Segundo_Parcial_Frontend
npm install @radix-ui/react-dialog
```

### 2. Verificar que el backend esté corriendo

```bash
cd ../../
python manage.py runserver
```

### 3. Iniciar el frontend

```bash
cd FRONTEND/Segundo_Parcial_Frontend
npm run dev
```

## 📱 Uso

### Acceso Rápido
1. Click en el ícono de **micrófono** 🎤 en el header (al lado de notificaciones)
2. El modal se abre en estado IDLE

### Comando por Voz
1. Click en el botón grande de micrófono
2. Habla tu comando (ej: "Genera el reporte de ventas del último mes")
3. El sistema transcribe, procesa y genera el reporte automáticamente

### Comando por Texto
1. Escribe el comando en el input manual
2. Click en "Enviar"
3. Mismo flujo que el comando de voz

### Ver Historial
1. Click en **"Reportes por Voz"** en el Sidebar
2. Visualiza todos los reportes generados
3. Descarga reportes anteriores
4. Filtra por estado

## 🎤 Ejemplos de Comandos Válidos

```
✅ "Genera el reporte de ventas del último mes"
✅ "Productos más vendidos esta semana"
✅ "Dashboard ejecutivo del mes de octubre"
✅ "Predicciones de ventas para los próximos 7 días"
✅ "Análisis RFM de clientes en Excel"
✅ "Ventas por cliente del año 2024"
✅ "Comparativo de ventas entre enero y febrero"
✅ "Inventario con stock bajo"
✅ "Reporte de ventas por categoría del trimestre"
✅ "Análisis ABC de productos"
```

## 🌐 Endpoints del Backend

### POST `/api/voice-commands/process/`
Procesa un comando de texto/voz y genera el reporte

**Request:**
```json
{
  "text": "generar reporte de ventas del último mes en PDF"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "command_text": "generar reporte de ventas del último mes",
    "status": "EXECUTED",
    "command_type": "reporte",
    "result_data": {...},
    "processing_time_ms": 850
  }
}
```

### GET `/api/voice-commands/`
Obtiene el historial de comandos del usuario

**Response:**
```json
{
  "count": 25,
  "next": "...",
  "previous": null,
  "results": [...]
}
```

## 🎨 Características de UX/UI

### Accesibilidad
- ✅ Permisos de micrófono manejados correctamente
- ✅ Alternativa de entrada manual siempre disponible
- ✅ Mensajes de error claros y específicos
- ✅ Feedback visual en cada estado

### Responsividad
- ✅ Modal responsive en móviles
- ✅ Botones táctiles optimizados
- ✅ Animaciones suaves

### Feedback Visual
- ✅ Animación de ondas al escuchar
- ✅ Colores según el estado (azul, rojo, verde)
- ✅ Iconos claros para cada estado
- ✅ Badges de estado en el historial

## 🔍 Troubleshooting

### El reconocimiento de voz no funciona
- **Solución**: El navegador debe soportar Web Speech API (Chrome, Edge, Safari)
- **Alternativa**: Usar entrada manual

### Error de permisos de micrófono
- **Solución**: Permitir acceso al micrófono en la configuración del navegador

### Backend no responde
- **Verificar**: `python manage.py runserver` esté corriendo
- **Verificar**: URL del backend en `src/services/api.js`

## 🚀 Próximas Mejoras

- [ ] Soporte para más idiomas
- [ ] Comandos de voz para editar/cancelar reportes
- [ ] Notificaciones push cuando el reporte esté listo
- [ ] Compartir reportes por email
- [ ] Vista previa del reporte antes de descargar
- [ ] Exportar a más formatos (CSV, PowerPoint)

## 📄 Licencia

Parte del proyecto SmartSales - Backend de Segundo Parcial

---

**Desarrollado con ❤️ por el equipo de SmartSales**
