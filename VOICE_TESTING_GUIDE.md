# 🧪 GUÍA DE TESTING - SISTEMA DE COMANDOS DE VOZ

## 📋 CHECKLIST DE VERIFICACIÓN

### ✅ 1. Verificar que el botón aparece en el Header

**Pasos:**
1. Iniciar sesión como administrador
2. Ir a cualquier página del panel de administración
3. Verificar que en el header aparece el botón de micrófono 🎤

**Resultado esperado:**
- ✅ Botón visible entre notificaciones y perfil
- ✅ Tooltip "Generar reportes por voz" al hacer hover
- ✅ Indicador verde de disponibilidad
- ✅ Efecto hover (fondo azul claro)

---

### ✅ 2. Verificar que el modal se abre correctamente

**Pasos:**
1. Click en el botón de micrófono del header
2. Observar que se abre el modal

**Resultado esperado:**
- ✅ Modal se abre con animación suave
- ✅ Título: "Comando de Voz"
- ✅ Banner informativo azul visible
- ✅ Botón grande de micrófono centrado
- ✅ Input manual alternativo visible
- ✅ Link "Ver ejemplos de comandos"

---

### ✅ 3. Probar entrada de texto manual

**Pasos:**
1. Abrir el modal de comando de voz
2. En el input de texto escribir: "reporte de ventas del último mes"
3. Click en "Enviar"

**Resultado esperado:**
- ✅ Modal cambia a estado "PROCESSING"
- ✅ Muestra spinner de carga
- ✅ Muestra el comando recibido
- ✅ Cambia a estado "GENERATING"
- ✅ Finalmente muestra "SUCCESS" con botón de descarga

---

### ✅ 4. Probar comando de voz (si el navegador lo soporta)

**Requisitos previos:**
- Navegador compatible (Chrome, Edge)
- Permisos de micrófono habilitados

**Pasos:**
1. Abrir el modal
2. Click en el botón grande de micrófono
3. Permitir acceso al micrófono (primera vez)
4. Hablar claramente: "genera el reporte de ventas del último mes"
5. El modal debe detectar el final y procesar

**Resultado esperado:**
- ✅ Botón cambia a rojo pulsante
- ✅ Animación de ondas de voz visible
- ✅ Texto "Escuchando..." visible
- ✅ Transcripción aparece en tiempo real
- ✅ Al terminar, procesa automáticamente

**Si falla el reconocimiento de voz:**
- ⚠️ Verifica que el navegador soporte Web Speech API
- ⚠️ Verifica los permisos del micrófono
- ⚠️ Usa la entrada manual como alternativa

---

### ✅ 5. Verificar ejemplos de comandos

**Pasos:**
1. Abrir el modal
2. Click en "Ver ejemplos de comandos"
3. Observar la lista que se expande
4. Click en uno de los ejemplos

**Resultado esperado:**
- ✅ Lista se expande suavemente
- ✅ Muestra 10+ ejemplos de comandos
- ✅ Al hacer click, el ejemplo se copia al input
- ✅ Se puede enviar directamente

---

### ✅ 6. Verificar página de Reportes por Voz

**Pasos:**
1. Ir a "Reportes por Voz" en el menú lateral
2. Verificar elementos de la página

**Resultado esperado:**
- ✅ Título con ícono de micrófono
- ✅ Botón "Nuevo Comando de Voz" visible y destacado
- ✅ Botón "Ver Guía" visible
- ✅ Barra de búsqueda funcional
- ✅ Filtro por estado funcional
- ✅ Lista de reportes (si hay historial)

---

### ✅ 7. Verificar la Guía de Comandos

**Pasos:**
1. En la página de Reportes por Voz
2. Click en "Ver Guía"
3. Explorar las categorías

**Resultado esperado:**
- ✅ Guía se expande con animación
- ✅ Header azul con título visible
- ✅ Sección de consejos visible
- ✅ 5 categorías de reportes:
  - 📈 Reportes de Ventas (azul)
  - 📦 Análisis de Productos (verde)
  - 👥 Análisis de Clientes (púrpura)
  - 📊 Predicciones y ML (naranja)
  - 📄 Reportes Ejecutivos (rojo)
- ✅ Cada categoría se puede expandir
- ✅ Ejemplos se muestran al expandir

---

### ✅ 8. Verificar estado vacío

**Pasos:**
1. Si no hay reportes en el historial
2. Observar el mensaje y CTA

**Resultado esperado:**
- ✅ Ícono de micrófono grande en círculo azul
- ✅ Mensaje: "¡Comienza a usar comandos de voz!"
- ✅ Texto explicativo amigable
- ✅ Botón "Crear mi primer reporte"
- ✅ Click en el botón abre el modal

---

### ✅ 9. Probar diferentes tipos de reportes

**Comandos a probar:**

#### Ventas:
```
✅ "reporte de ventas del último mes"
✅ "ventas de la semana pasada"
✅ "comparativo de ventas entre enero y febrero"
```

#### Productos:
```
✅ "productos más vendidos esta semana"
✅ "análisis ABC de productos"
✅ "inventario con stock bajo"
```

#### Clientes:
```
✅ "ventas por cliente del año 2024"
✅ "análisis RFM de clientes"
```

#### Predicciones:
```
✅ "predicciones de ventas para los próximos 7 días"
✅ "forecast de ventas del próximo mes"
```

#### Ejecutivo:
```
✅ "dashboard ejecutivo del mes de octubre"
✅ "resumen ejecutivo del trimestre"
```

---

### ✅ 10. Verificar descarga de reportes

**Pasos:**
1. Generar un reporte exitosamente
2. En el estado SUCCESS, click en "Descargar PDF"
3. Verificar que se descarga el archivo

**Resultado esperado:**
- ✅ Archivo PDF se descarga automáticamente
- ✅ Nombre del archivo: `reporte_[id].pdf`
- ✅ PDF contiene el reporte correcto

**También desde el historial:**
1. Ir a la página de reportes
2. En un reporte completado, click en "PDF"
3. Verificar descarga

---

## 🔧 PRUEBAS DE INTEGRACIÓN CON BACKEND

### ✅ 11. Verificar comunicación con API

**Endpoint a verificar:**
```
POST /api/voice-commands/process/
```

**Payload de ejemplo:**
```json
{
  "text": "reporte de ventas del último mes"
}
```

**Verificar en DevTools:**
1. Abrir DevTools (F12)
2. Ir a pestaña Network
3. Enviar un comando
4. Verificar la petición y respuesta

**Resultado esperado:**
- ✅ Status: 200 OK
- ✅ Response incluye:
  - `id` del comando
  - `status: "EXECUTED"`
  - `command_type`
  - `file_url` para descarga
  - `processing_time_ms`
  - `confidence_score`

---

### ✅ 12. Verificar manejo de errores

**Casos a probar:**

#### Error de red:
1. Desconectar internet
2. Intentar procesar comando

**Resultado esperado:**
- ✅ Modal muestra estado ERROR
- ✅ Mensaje: "Error al procesar el comando"
- ✅ Botón "Intentar de nuevo"

#### Comando no reconocido:
1. Escribir: "asdflkjasdflkj"
2. Enviar

**Resultado esperado:**
- ✅ Estado LOW_CONFIDENCE o ERROR
- ✅ Mensaje explicativo
- ✅ Sugerencias si están disponibles

#### Backend caído:
1. Detener el servidor Django
2. Intentar procesar comando

**Resultado esperado:**
- ✅ Error manejado gracefully
- ✅ Mensaje de error claro
- ✅ No crash del frontend

---

## 📱 PRUEBAS RESPONSIVE

### ✅ 13. Verificar en diferentes resoluciones

**Desktop (1920x1080):**
- ✅ Botón con texto "Comando de Voz" visible
- ✅ Modal centrado y de buen tamaño
- ✅ Guía se ve completa

**Tablet (768x1024):**
- ✅ Botón solo con ícono (sin texto)
- ✅ Modal se adapta al ancho
- ✅ Guía sigue siendo usable

**Mobile (375x667):**
- ✅ Botón de micrófono visible
- ✅ Modal ocupa casi toda la pantalla
- ✅ Texto se ajusta correctamente
- ✅ Botones son tocables (44px mínimo)

---

## 🎨 PRUEBAS VISUALES

### ✅ 14. Verificar estilos y animaciones

**Animaciones a verificar:**
- ✅ Fade in del modal al abrir
- ✅ Pulse del botón de micrófono al escuchar
- ✅ Ondas de voz animadas
- ✅ Spinner rotando en PROCESSING
- ✅ Bounce del documento en GENERATING
- ✅ Barra de progreso animada

**Colores a verificar:**
- ✅ Azul: #3B82F6 (botones principales)
- ✅ Verde: #10B981 (éxito)
- ✅ Rojo: #EF4444 (error, micrófono activo)
- ✅ Gris: adecuados para texto y bordes

---

## 🌐 PRUEBAS DE NAVEGADORES

### ✅ 15. Compatibilidad

**Chrome/Edge (Chromium):**
- ✅ Reconocimiento de voz funciona
- ✅ Todas las animaciones fluidas
- ✅ Estilos correctos

**Firefox:**
- ⚠️ No soporta Web Speech API
- ✅ Entrada manual funciona perfectamente
- ✅ Estilos correctos
- ✅ Mensaje claro sobre falta de soporte de voz

**Safari:**
- ⚠️ Soporte limitado de voz
- ✅ Entrada manual funciona
- ✅ Estilos pueden necesitar ajustes

---

## 📊 MÉTRICAS DE ÉXITO

Al finalizar las pruebas, deberías tener:

- ✅ **100%** de botones visibles y funcionales
- ✅ **100%** de estados del modal funcionando
- ✅ **90%+** de comandos reconocidos correctamente
- ✅ **0** errores no manejados
- ✅ **< 2s** tiempo de respuesta promedio
- ✅ **100%** de descargas exitosas

---

## 🐛 REPORTE DE BUGS

Si encuentras problemas, documenta:

```markdown
### Bug: [Título descriptivo]

**Pasos para reproducir:**
1. 
2. 
3. 

**Resultado esperado:**
...

**Resultado actual:**
...

**Navegador:** Chrome 120
**OS:** Windows 11
**Screenshot:** [adjuntar]
```

---

## ✅ CHECKLIST FINAL

Antes de considerar el testing completo:

- [ ] Botón en header visible y funcional
- [ ] Modal se abre desde 3 lugares diferentes
- [ ] Entrada de texto manual funciona
- [ ] Reconocimiento de voz funciona (en navegadores compatibles)
- [ ] Todos los 6 estados del modal se muestran correctamente
- [ ] Guía de comandos es accesible y útil
- [ ] Historial de reportes se carga correctamente
- [ ] Descargas de PDF funcionan
- [ ] Manejo de errores es apropiado
- [ ] Responsive en mobile/tablet/desktop
- [ ] Sin errores en consola del navegador
- [ ] Performance es aceptable (< 3s para reportes simples)

---

## 🎉 ¡Testing Completo!

Si todos los checks están en ✅, el sistema está listo para producción.

**Próximo paso:** Monitorear uso real y recopilar feedback de usuarios.
