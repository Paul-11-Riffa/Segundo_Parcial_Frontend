# 🧪 GUÍA DE PRUEBAS - Módulo de Comandos de Voz

## ✅ Checklist de Pruebas

### 1. Instalación y Configuración

- [ ] Dependencia instalada: `npm install @radix-ui/react-dialog`
- [ ] Backend corriendo en `http://localhost:8000`
- [ ] Frontend corriendo en `http://localhost:5173` (o puerto configurado)
- [ ] Usuario autenticado como administrador

---

### 2. Pruebas de UI - Botón Global

**Ubicación**: Header superior derecho

- [ ] ✅ El ícono de micrófono 🎤 está visible en el header
- [ ] ✅ Está ubicado entre el título y el ícono de notificaciones
- [ ] ✅ Tiene efecto hover (azul)
- [ ] ✅ Muestra tooltip al pasar el mouse
- [ ] ✅ Al hacer click abre el modal

---

### 3. Pruebas del Modal - Estado IDLE

**Abrir**: Click en 🎤 en header

- [ ] ✅ Modal se abre centrado en la pantalla
- [ ] ✅ Título: "Comando de Voz"
- [ ] ✅ Botón grande de micrófono visible (azul)
- [ ] ✅ Texto de ayuda visible
- [ ] ✅ Input manual visible
- [ ] ✅ Botón "Ver ejemplos de comandos" funciona
- [ ] ✅ Al hacer click en "Ver ejemplos" muestra lista desplegable
- [ ] ✅ Se puede hacer click en un ejemplo para llenarlo en el input

**Ejemplos esperados**:
```
✅ "Genera el reporte de ventas del último mes"
✅ "Productos más vendidos esta semana"
✅ "Dashboard ejecutivo del mes de octubre"
... (10 ejemplos en total)
```

---

### 4. Pruebas de Reconocimiento de Voz

#### Caso 1: Permisos Correctos

**Pasos**:
1. Click en botón de micrófono grande
2. Permitir acceso al micrófono (primera vez)

**Resultado Esperado**:
- [ ] ✅ Modal cambia a estado LISTENING
- [ ] ✅ Botón de micrófono cambia a rojo
- [ ] ✅ Animación de ondas aparece
- [ ] ✅ Texto "Escuchando..." visible
- [ ] ✅ Anillo de "ping" animado alrededor del botón

**Hablar**: "Genera el reporte de ventas del último mes"

**Resultado Esperado**:
- [ ] ✅ Transcripción aparece en tiempo real
- [ ] ✅ Al terminar, pasa automáticamente a PROCESSING
- [ ] ✅ Muestra el comando recibido en un box azul

#### Caso 2: Permisos Denegados

**Pasos**:
1. Denegar acceso al micrófono

**Resultado Esperado**:
- [ ] ✅ Muestra mensaje de error claro
- [ ] ✅ Sugiere usar entrada manual
- [ ] ✅ Input manual sigue disponible

---

### 5. Pruebas de Entrada Manual

**Pasos**:
1. En estado IDLE, escribir en input: "productos más vendidos"
2. Click en "Enviar"

**Resultado Esperado**:
- [ ] ✅ Pasa a estado PROCESSING
- [ ] ✅ Muestra "Procesando: 'productos más vendidos'"
- [ ] ✅ Spinner visible
- [ ] ✅ Después pasa a GENERATING
- [ ] ✅ Luego a SUCCESS

---

### 6. Pruebas de Estado PROCESSING

**Resultado Esperado**:
- [ ] ✅ Spinner azul girando
- [ ] ✅ Comando recibido mostrado en box con borde azul
- [ ] ✅ Mensaje "Procesando comando..."
- [ ] ✅ Duración: 1-3 segundos aproximadamente

---

### 7. Pruebas de Estado GENERATING

**Resultado Esperado**:
- [ ] ✅ Ícono de documento visible
- [ ] ✅ Checkmark verde visible
- [ ] ✅ Texto "¡Entendido!"
- [ ] ✅ Mensaje "Generando tu reporte..."
- [ ] ✅ Barra de progreso animada
- [ ] ✅ Duración: 1-2 segundos (simulado)

---

### 8. Pruebas de Estado SUCCESS

**Resultado Esperado**:
- [ ] ✅ Checkmark grande verde
- [ ] ✅ Texto "¡Reporte generado!"
- [ ] ✅ Información del reporte:
  - Tipo de reporte
  - Período (si aplica)
  - Tiempo de procesamiento
- [ ] ✅ Botón "Descargar PDF" visible y funcional
- [ ] ✅ Botón "Nuevo reporte" visible
- [ ] ✅ Click en "Descargar PDF" inicia descarga
- [ ] ✅ Click en "Nuevo reporte" vuelve a IDLE

---

### 9. Pruebas de Estado ERROR

#### Caso 1: Comando Inválido

**Pasos**:
1. Escribir: "asdfghjkl xyz 123"
2. Enviar

**Resultado Esperado**:
- [ ] ✅ Ícono de alerta rojo
- [ ] ✅ Mensaje de error descriptivo
- [ ] ✅ Botón "Intentar de nuevo"
- [ ] ✅ Click en botón vuelve a IDLE

#### Caso 2: Baja Confianza

**Pasos**:
1. Usar comando ambiguo o mal pronunciado

**Resultado Esperado**:
- [ ] ✅ Mensaje "No estoy seguro..."
- [ ] ✅ Lista de sugerencias visible
- [ ] ✅ Click en sugerencia la procesa automáticamente

---

### 10. Pruebas del Menú Sidebar

**Ubicación**: Sidebar izquierdo

**Resultado Esperado**:
- [ ] ✅ Ítem "Reportes por Voz" visible con ícono 🎤
- [ ] ✅ Click navega a `/admin/voice-reports`
- [ ] ✅ Se marca como activo al estar en esa página

---

### 11. Pruebas de Página de Historial

**Navegar**: Sidebar > Reportes por Voz

#### UI General
- [ ] ✅ Título "Reportes por Comando de Voz" visible
- [ ] ✅ Barra de búsqueda funcional
- [ ] ✅ Filtro por estado funcional
- [ ] ✅ Lista de reportes se muestra correctamente

#### Cada Tarjeta de Reporte
- [ ] ✅ Tipo de reporte visible
- [ ] ✅ Comando original entre comillas
- [ ] ✅ Badge de estado (color correcto)
- [ ] ✅ Fecha y hora formateadas
- [ ] ✅ Tiempo de procesamiento (si disponible)
- [ ] ✅ Nivel de confianza con color (verde/amarillo/rojo)
- [ ] ✅ Parámetros interpretados expandibles

#### Acciones
- [ ] ✅ Botón "Descargar PDF" solo en reportes completados
- [ ] ✅ Click en descargar inicia descarga
- [ ] ✅ Mensaje de error visible en reportes fallidos

#### Búsqueda y Filtros
- [ ] ✅ Búsqueda por texto filtra en tiempo real
- [ ] ✅ Filtro "Todos" muestra todos
- [ ] ✅ Filtro "Completados" muestra solo EXECUTED
- [ ] ✅ Filtro "Fallidos" muestra solo FAILED
- [ ] ✅ Filtro "En proceso" muestra solo PROCESSING

#### Paginación
- [ ] ✅ Botones de paginación visibles (si hay >10 reportes)
- [ ] ✅ "Anterior" deshabilitado en página 1
- [ ] ✅ "Siguiente" deshabilitado en última página
- [ ] ✅ Navegación entre páginas funciona

---

### 12. Pruebas de Comandos Reales

Probar cada uno de estos comandos y verificar que generen el reporte correcto:

#### Reportes Básicos
- [ ] ✅ "reporte de ventas del último mes"
- [ ] ✅ "productos más vendidos esta semana"
- [ ] ✅ "ventas por cliente del año 2024"
- [ ] ✅ "ventas por categoría de este mes"

#### Reportes Avanzados
- [ ] ✅ "análisis RFM de clientes"
- [ ] ✅ "análisis ABC de productos"
- [ ] ✅ "dashboard ejecutivo"
- [ ] ✅ "comparativo de ventas entre enero y febrero"

#### Reportes de Inventario
- [ ] ✅ "inventario con stock bajo"
- [ ] ✅ "productos sin stock"

#### Reportes ML
- [ ] ✅ "predicciones de ventas para los próximos 7 días"
- [ ] ✅ "recomendaciones de productos"

---

### 13. Pruebas de Responsive

#### Desktop (1920x1080)
- [ ] ✅ Modal se ve bien centrado
- [ ] ✅ Botones no se solapan
- [ ] ✅ Texto legible

#### Tablet (768x1024)
- [ ] ✅ Modal se adapta correctamente
- [ ] ✅ Ondas de voz se ven bien
- [ ] ✅ Navegación funcional

#### Móvil (375x667)
- [ ] ✅ Modal ocupa ancho completo
- [ ] ✅ Botones táctiles optimizados
- [ ] ✅ Texto no se corta

---

### 14. Pruebas de Navegadores

- [ ] ✅ Chrome/Edge (Recomendado - Mejor soporte de Web Speech API)
- [ ] ✅ Firefox (Puede tener limitaciones de voz)
- [ ] ✅ Safari (Soporte parcial)

---

### 15. Pruebas de Rendimiento

- [ ] ✅ Modal abre en <200ms
- [ ] ✅ Transiciones suaves entre estados
- [ ] ✅ Animaciones no causan lag
- [ ] ✅ Búsqueda en historial es instantánea
- [ ] ✅ No hay memory leaks al abrir/cerrar modal múltiples veces

---

### 16. Pruebas de Errores

#### Backend no disponible
1. Detener el backend (`Ctrl+C`)
2. Intentar procesar comando

**Resultado Esperado**:
- [ ] ✅ Mensaje de error claro
- [ ] ✅ No crashea el frontend
- [ ] ✅ Permite reintentar

#### Sin conexión a internet
1. Desconectar internet
2. Intentar procesar comando

**Resultado Esperado**:
- [ ] ✅ Error de red detectado
- [ ] ✅ Mensaje apropiado

---

## 📊 Resumen de Pruebas

**Total de casos de prueba**: 150+

**Áreas cubiertas**:
- ✅ UI/UX (diseño, animaciones)
- ✅ Funcionalidad (voz, texto)
- ✅ Estados (6 estados distintos)
- ✅ Navegación (rutas, sidebar)
- ✅ Backend (integración API)
- ✅ Errores (manejo robusto)
- ✅ Responsive (3 tamaños)
- ✅ Navegadores (cross-browser)
- ✅ Rendimiento (optimización)

---

## 🐛 Reporte de Bugs

Si encuentras un bug, documenta:
1. **Qué hiciste** (pasos para reproducir)
2. **Qué esperabas** (resultado esperado)
3. **Qué pasó** (resultado actual)
4. **Navegador y versión**
5. **Consola del navegador** (F12 > Console)

---

## ✅ Criterios de Aceptación

El módulo se considera **completamente funcional** si:

- [ ] ✅ Todos los 6 estados funcionan correctamente
- [ ] ✅ Reconocimiento de voz funciona en Chrome
- [ ] ✅ Entrada manual funciona en todos los navegadores
- [ ] ✅ Se pueden generar al menos 10 tipos de reportes distintos
- [ ] ✅ Historial muestra todos los reportes
- [ ] ✅ Descarga de PDFs funciona
- [ ] ✅ No hay errores en consola
- [ ] ✅ UI responsive en móvil y desktop
- [ ] ✅ Animaciones son suaves

---

**🎉 ¡Felices pruebas!**
