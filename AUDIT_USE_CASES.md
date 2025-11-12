# Casos de Uso del Sistema de Auditoría

## 📋 Índice
1. [Monitoreo de Seguridad](#monitoreo-de-seguridad)
2. [Investigación de Incidentes](#investigación-de-incidentes)
3. [Auditoría de Cumplimiento](#auditoría-de-cumplimiento)
4. [Análisis de Rendimiento](#análisis-de-rendimiento)
5. [Gestión de Usuarios](#gestión-de-usuarios)
6. [Detección de Anomalías](#detección-de-anomalías)

---

## Monitoreo de Seguridad

### Caso 1: Detectar Intentos de Acceso No Autorizado

**Escenario:**
Como administrador de seguridad, quiero detectar intentos de acceso no autorizado para prevenir brechas de seguridad.

**Flujo de trabajo:**

1. **Acceder al panel de alertas de seguridad**
   - Navegar a `/audit/security-alerts/`
   - El sistema analiza automáticamente las últimas 24 horas

2. **Revisar alertas de intentos fallidos de login**
   ```
   Tipo de alerta: failed_logins
   Severidad: HIGH
   Descripción: Detected multiple IPs with 5 or more failed login attempts

   Detalles:
   - IP: 203.0.113.45
   - Intentos fallidos: 12
   - Usuarios intentados: admin, root, user
   - Primer intento: 14:30:00
   - Último intento: 15:45:23
   ```

3. **Acciones recomendadas:**
   - Bloquear la IP en el firewall
   - Configurar rate limiting para login
   - Revisar si las cuentas intentadas existen
   - Considerar implementar CAPTCHA después de 3 intentos

4. **Verificación en logs detallados**
   - Ir a `/audit/logs/`
   - Filtrar por:
     - `ip_address = 203.0.113.45`
     - `action_type = AUTH`
     - `success = false`
   - Revisar patrones: ¿Está probando usuarios comunes? ¿Hay un patrón temporal?

**Resultado esperado:**
Identificación temprana de ataques de fuerza bruta y toma de acción preventiva antes de que comprometan una cuenta.

---

### Caso 2: Monitorear Operaciones Críticas

**Escenario:**
Como administrador, quiero ser notificado inmediatamente cuando se realicen operaciones críticas como eliminaciones masivas o cambios de configuración.

**Flujo de trabajo:**

1. **Configurar dashboard de operaciones críticas**
   - Acceder a `/audit/logs/`
   - Aplicar filtros:
     - `severity = CRITICAL` o `severity = HIGH`
     - `ordering = -timestamp` (más recientes primero)

2. **Revisar operaciones del día**
   ```
   Resultado ejemplo:

   [15:30:00] admin_user - DELETE - /api/sales/products/bulk-delete/
   Status: 500 | Error: Database connection lost
   → ACCIÓN: Verificar conexión a base de datos

   [14:20:00] manager_user - DELETE - /api/sales/orders/999/
   Status: 204 | Success
   → ACCIÓN: Confirmar que la eliminación fue intencional

   [12:15:00] admin_user - CONFIG - /api/sales/settings/
   Status: 200 | Success
   → ACCIÓN: Revisar qué configuración se cambió
   ```

3. **Investigar operación sospechosa**
   - Click en el log de las 15:30:00
   - Ver detalles completos:
     ```
     Usuario: admin_user
     Acción: Bulk delete products
     Request body: {"product_ids": [100, 101, 102, ...]}  // 15 productos
     Error: Database connection lost during transaction
     IP: 192.168.1.50
     ```

4. **Generar reporte para revisión**
   - Ir a `/audit/generate-report/`
   - Configurar filtros:
     - `severity = CRITICAL`
     - `start_date = hoy 00:00:00`
     - `format = pdf`
   - Compartir con equipo técnico

**Resultado esperado:**
Visibilidad completa de operaciones críticas y capacidad de respuesta rápida ante errores o acciones no autorizadas.

---

### Caso 3: Detectar Accesos desde Múltiples Ubicaciones

**Escenario:**
Como administrador de seguridad, quiero identificar cuentas que se acceden desde múltiples ubicaciones geográficas en poco tiempo, lo cual podría indicar compromiso de cuenta.

**Flujo de trabajo:**

1. **Revisar alertas automáticas**
   - Acceder a `/audit/security-alerts/`
   - Buscar alerta tipo `multiple_ips`:
     ```
     Tipo: multiple_ips
     Severidad: MEDIUM
     Título: Users Accessing from Multiple IPs

     Detalles:
     Usuario: john_doe
     IPs detectadas: 4
     - 192.168.1.100 (45 acciones, última: hace 5 min)
     - 10.0.0.50 (12 acciones, última: hace 2 horas)
     - 203.0.113.100 (8 acciones, última: hace 4 horas)
     - 198.51.100.200 (3 acciones, última: hace 6 horas)
     ```

2. **Investigar actividad del usuario**
   - Ir a `/audit/user-activity/john_doe/?days=1`
   - Revisar:
     - ¿Las IPs corresponden a ubicaciones conocidas del usuario?
     - ¿Los horarios son consistentes con su comportamiento normal?
     - ¿Los tipos de acciones son normales?

3. **Análisis detallado por IP**
   - Para cada IP sospechosa, filtrar logs:
     ```
     Filtros:
     - user = john_doe
     - ip_address = 198.51.100.200
     - start_date = últimas 24 horas
     ```
   - Revisar qué acciones se realizaron desde esa IP

4. **Tomar acción si es sospechoso**
   - Contactar al usuario para confirmar actividad
   - Si no reconoce la IP:
     - Forzar cierre de sesión
     - Requerir cambio de contraseña
     - Revisar si se realizaron acciones no autorizadas

**Resultado esperado:**
Detección temprana de posible compromiso de cuenta y prevención de daños.

---

## Investigación de Incidentes

### Caso 4: Investigar Error Reportado por Usuario

**Escenario:**
Un usuario reporta: "Intenté crear una orden a las 16:45 pero me dio error. Mi pedido no se guardó."

**Flujo de trabajo:**

1. **Buscar logs del usuario en el horario reportado**
   - Ir a `/audit/logs/`
   - Aplicar filtros:
     - `user = nombre_usuario`
     - `start_date = hoy 16:40:00`
     - `end_date = hoy 16:50:00`
     - `endpoint = /orders/`

2. **Identificar el error**
   ```
   Resultado:
   [16:45:23] nombre_usuario - CREATE - POST /api/sales/orders/
   Status: 500 | Response time: 234ms
   Error: Product with ID 999 does not exist
   IP: 192.168.1.120
   ```

3. **Ver detalles completos del request**
   - Click en el log
   - Ver `request_body`:
     ```json
     {
       "product_id": 999,
       "quantity": 2,
       "payment_method": "CREDIT_CARD"
     }
     ```
   - **Problema identificado:** El usuario intentó ordenar un producto con ID 999 que no existe

4. **Verificar si el producto existía antes**
   - Buscar logs relacionados con producto 999:
     ```
     Filtros:
     - endpoint = /products/999/
     - action_type = DELETE
     - ordering = -timestamp
     ```
   - Resultado:
     ```
     [14:20:00] admin_user - DELETE - /api/sales/products/999/
     Status: 204 | Success
     → El producto fue eliminado a las 14:20
     ```

5. **Responder al usuario**
   - "El producto que intentaste ordenar fue descontinuado a las 14:20 hoy."
   - "Por favor, selecciona un producto alternativo del catálogo actualizado."

6. **Acción correctiva**
   - Mejorar validación: Mostrar mensaje claro cuando producto no existe
   - Implementar soft-delete en lugar de eliminación permanente

**Resultado esperado:**
Resolución rápida del problema del usuario con evidencia detallada de qué ocurrió y cuándo.

---

### Caso 5: Rastrear Cambios en un Recurso

**Escenario:**
Como administrador, necesito saber quién modificó el precio de un producto específico y cuándo.

**Flujo de trabajo:**

1. **Buscar todas las operaciones sobre el producto**
   - Ir a `/audit/logs/`
   - Filtros:
     - `endpoint = /products/100/` (suponiendo producto ID 100)
     - `action_type = UPDATE`
     - `ordering = -timestamp`

2. **Revisar historial de cambios**
   ```
   Resultados:

   [Ayer 18:30] manager_user - UPDATE - PUT /api/sales/products/100/
   Status: 200

   [Hace 3 días 14:20] admin_user - UPDATE - PUT /api/sales/products/100/
   Status: 200

   [Hace 1 semana 10:00] manager_user - UPDATE - PUT /api/sales/products/100/
   Status: 200
   ```

3. **Ver detalles del cambio más reciente**
   - Click en log de ayer 18:30
   - Ver `request_body`:
     ```json
     {
       "name": "Laptop Dell XPS 15",
       "price": 1499.99,  // ← Precio actualizado
       "stock": 50,
       "category": "Electronics"
     }
     ```

4. **Comparar con cambio anterior**
   - Ver log de hace 3 días
   - `request_body`:
     ```json
     {
       "name": "Laptop Dell XPS 15",
       "price": 1299.99,  // ← Precio anterior
       "stock": 45,
       "category": "Electronics"
     }
     ```
   - **Conclusión:** manager_user aumentó el precio de $1299.99 a $1499.99 ayer a las 18:30

5. **Generar reporte de auditoría**
   - Ir a `/audit/generate-report/`
   - Filtros:
     - `endpoint = /products/100/`
     - `action_type = UPDATE`
     - `start_date = hace 30 días`
     - `format = excel`
   - Compartir con gerencia

**Resultado esperado:**
Trazabilidad completa de cambios en recursos críticos con información de quién, qué, cuándo y desde dónde.

---

## Auditoría de Cumplimiento

### Caso 6: Generar Reporte de Auditoría Mensual

**Escenario:**
Como auditor de cumplimiento, necesito generar un reporte mensual de todas las operaciones sensibles (pagos, eliminaciones, cambios de configuración).

**Flujo de trabajo:**

1. **Definir criterios de reporte**
   - Operaciones a incluir:
     - Pagos (PAYMENT)
     - Eliminaciones (DELETE)
     - Cambios de configuración (CONFIG)
   - Período: Mes anterior completo

2. **Generar reporte en Excel**
   - Ir a `/audit/generate-report/`
   - Configurar filtros:
     ```json
     {
       "action_type": "PAYMENT,DELETE,CONFIG",
       "start_date": "2025-01-01T00:00:00Z",
       "end_date": "2025-01-31T23:59:59Z",
       "limit": 10000,
       "format": "excel"
     }
     ```

3. **Revisar reporte descargado**
   - Excel contiene:
     - Hoja "Summary":
       - Total de operaciones: 1,234
       - Operaciones de pago: 456
       - Eliminaciones: 678
       - Cambios de configuración: 100
       - Usuarios involucrados: 23
     - Hoja "Logs":
       - Tabla completa con todas las operaciones
       - Columnas: Timestamp, Usuario, Acción, Endpoint, Status, IP

4. **Análisis de anomalías**
   - Ordenar por `severity` descendente
   - Identificar operaciones con errores
   - Verificar si todas las eliminaciones fueron autorizadas
   - Confirmar que pagos fueron exitosos

5. **Documentar hallazgos**
   - Resaltar cualquier actividad inusual
   - Documentar errores recurrentes
   - Generar recomendaciones de mejora

**Resultado esperado:**
Reporte completo y auditable de todas las operaciones sensibles del período, cumpliendo con requisitos de compliance.

---

### Caso 7: Verificar Acceso a Datos Sensibles

**Escenario:**
Como oficial de privacidad, necesito verificar quién ha accedido a información de un cliente específico en los últimos 90 días.

**Flujo de trabajo:**

1. **Buscar accesos a datos del cliente**
   - Ir a `/audit/logs/`
   - Filtros:
     - `search = customer_id_12345` (busca en endpoint y request body)
     - `start_date = hace 90 días`
     - `ordering = -timestamp`

2. **Revisar resultados**
   ```
   [Hoy 10:30] sales_user - READ - GET /api/sales/orders/?customer=12345
   Status: 200

   [Ayer 15:20] support_user - READ - GET /api/sales/customers/12345/
   Status: 200

   [Hace 5 días] admin_user - UPDATE - PUT /api/sales/customers/12345/
   Status: 200
   ```

3. **Verificar legitimidad de cada acceso**
   - Para cada acceso, verificar:
     - ¿El usuario tiene autorización para ver estos datos?
     - ¿El acceso fue parte de sus funciones normales?
     - ¿La IP corresponde a la red corporativa?

4. **Generar reporte de accesos**
   - Generar PDF con todos los accesos
   - Incluir:
     - Usuario que accedió
     - Fecha/hora
     - Tipo de operación (lectura, modificación)
     - IP de origen
     - Propósito (basado en contexto)

5. **Documentar para compliance**
   - Archivar reporte
   - Notificar al cliente si lo solicita (derecho GDPR)

**Resultado esperado:**
Trazabilidad completa de accesos a datos personales, cumpliendo con regulaciones de privacidad.

---

## Análisis de Rendimiento

### Caso 8: Identificar Endpoints Lentos

**Escenario:**
Como ingeniero de rendimiento, quiero identificar qué endpoints tienen los tiempos de respuesta más altos para optimizarlos.

**Flujo de trabajo:**

1. **Obtener estadísticas generales**
   - Ir a `/audit/statistics/?days=7`
   - Revisar `avg_response_time_ms`: ej. 145.67ms

2. **Buscar requests más lentos**
   - Ir a `/audit/logs/`
   - Filtros:
     - `response_time_ms_gte = 1000` (más de 1 segundo, si existiera este filtro)
     - Alternativamente, ordenar por tiempo: `ordering = -response_time_ms`
   - Limitar a top 100

3. **Analizar patrones**
   ```
   Resultados (ordenados por tiempo descendente):

   [12:30] - POST /api/sales/reports/generate/ - 15,234ms
   → Generación de reportes es muy lenta

   [14:20] - GET /api/sales/products/?search=laptop&category=all&... - 8,456ms
   → Búsqueda compleja sin optimización

   [16:45] - POST /api/sales/ml/predict/ - 5,678ms
   → Predicción de ML es lenta (esperado)

   [10:15] - GET /api/sales/dashboard/ - 4,321ms
   → Dashboard carga muchos datos
   ```

4. **Generar reporte de endpoints lentos**
   - Ir a `/audit/generate-report/`
   - Filtros:
     - Últimos 7 días
     - Solo exitosos (para evitar timeouts)
     - Límite: 1000
   - Exportar a Excel

5. **Análisis en Excel**
   - Crear tabla dinámica agrupando por `endpoint`
   - Calcular `AVG(response_time_ms)` por endpoint
   - Identificar top 10 endpoints más lentos
   - Verificar si tienen patrones (hora del día, usuario, etc.)

6. **Acciones de optimización**
   - Para `/reports/generate/`:
     - Implementar generación asíncrona
     - Usar caché para reportes frecuentes
   - Para búsqueda de productos:
     - Agregar índices a base de datos
     - Implementar paginación más agresiva
     - Considerar ElasticSearch
   - Para dashboard:
     - Implementar caché de 5 minutos
     - Lazy loading de componentes

**Resultado esperado:**
Identificación basada en datos de cuellos de botella de rendimiento y plan de optimización priorizado.

---

### Caso 9: Monitorear Degradación de Rendimiento

**Escenario:**
Como DevOps, quiero detectar si el rendimiento del sistema se está degradando con el tiempo.

**Flujo de trabajo:**

1. **Comparar estadísticas de diferentes períodos**
   - Semana actual:
     ```
     GET /api/sales/audit/statistics/?days=7
     → avg_response_time_ms: 180.45ms
     ```
   - Semana anterior:
     ```
     GET /api/sales/audit/statistics/?days=7
     (calcular manualmente desde logs de hace 1 semana)
     → avg_response_time_ms: 145.67ms
     ```
   - **Tendencia:** Aumento de 24% en tiempo de respuesta

2. **Identificar cuándo comenzó la degradación**
   - Revisar estadísticas diarias (by_day):
     ```
     2025-01-15: avg 185ms
     2025-01-14: avg 178ms
     2025-01-13: avg 172ms
     2025-01-12: avg 168ms
     2025-01-11: avg 150ms ← Cambio significativo aquí
     2025-01-10: avg 145ms
     ```
   - **Conclusión:** La degradación comenzó el 11 de enero

3. **Correlacionar con cambios del sistema**
   - Buscar cambios de configuración ese día:
     ```
     Filtros:
     - action_type = CONFIG
     - start_date = 2025-01-11 00:00:00
     - end_date = 2025-01-11 23:59:59
     ```
   - Resultado:
     ```
     [11 Ene 14:30] admin_user - CONFIG - /api/sales/settings/
     Request: {"cache_enabled": false, ...}
     → ¡Cache fue deshabilitado!
     ```

4. **Verificar impacto**
   - Comparar logs antes y después del cambio
   - Endpoints más afectados:
     ```
     /api/sales/products/ - antes: 50ms, después: 180ms
     /api/sales/dashboard/ - antes: 200ms, después: 800ms
     ```

5. **Tomar acción correctiva**
   - Revertir configuración (habilitar cache)
   - Monitorear si el rendimiento vuelve a la normalidad
   - Documentar el incidente

**Resultado esperado:**
Detección temprana de degradación de rendimiento y correlación con cambios del sistema para resolver rápidamente.

---

## Gestión de Usuarios

### Caso 10: Auditar Actividad de Usuario Específico

**Escenario:**
Como gerente, quiero revisar la actividad de un empleado antes de su evaluación de desempeño.

**Flujo de trabajo:**

1. **Obtener resumen de actividad**
   - Ir a `/audit/user-activity/employee_user/?days=30`
   - Revisar resumen:
     ```
     Total de acciones: 1,234
     Errores: 23 (1.86%)
     Sesiones: 22
     Tiempo promedio de respuesta: 134ms
     ```

2. **Analizar distribución de acciones**
   - Ver gráfico `by_action_type`:
     ```
     READ: 789 (64%)
     CREATE: 345 (28%)
     UPDATE: 78 (6%)
     DELETE: 22 (2%)
     ```
   - **Interpretación:** Usuario principalmente consulta y crea registros, pocas eliminaciones

3. **Revisar acciones recientes**
   - Lista de últimas 20 acciones muestra:
     ```
     - Consultas de productos (frecuente)
     - Creación de órdenes (frecuente)
     - Actualizaciones de inventario (ocasional)
     - Sin acciones sospechosas
     ```

4. **Verificar sesiones y horarios**
   - Revisar sesiones activas e historial:
     ```
     Sesiones activas: 1
     Promedio duración de sesión: 4.5 horas
     IPs usadas: 2 (oficina y casa - ambas conocidas)
     Horario típico: 9AM - 6PM
     ```

5. **Identificar áreas de mejora**
   - Errores comunes:
     ```
     15 errores: 404 en /products/[ID]/
     → Usuario frecuentemente busca productos que no existen
     → ACCIÓN: Capacitación en uso del sistema de búsqueda
     ```

6. **Generar reporte de evaluación**
   - Generar PDF del período
   - Incluir métricas clave y observaciones

**Resultado esperado:**
Evaluación objetiva basada en datos de la actividad y productividad del empleado.

---

### Caso 11: Detectar Actividad Inusual de Usuario

**Escenario:**
Como administrador de seguridad, quiero detectar si algún usuario está realizando actividades fuera de su rol normal.

**Flujo de trabajo:**

1. **Revisar alertas automáticas**
   - Ir a `/audit/security-alerts/`
   - Buscar alerta de actividad inusual:
     ```
     Tipo: unusual_activity
     Usuario: sales_user
     Acciones: 345 en 24 horas
     Endpoints más accedidos: /api/sales/reports/export/
     ```

2. **Investigar actividad del usuario**
   - Ir a `/audit/user-activity/sales_user/?days=1`
   - Comparar con su actividad normal:
     ```
     Hoy: 345 acciones
     Promedio histórico (30 días): 87 acciones/día
     → 4x más activo que lo normal
     ```

3. **Analizar qué está haciendo**
   - Ver acciones recientes:
     ```
     [16:45] GET /api/sales/reports/export/?format=excel&data=all_customers
     [16:44] GET /api/sales/reports/export/?format=excel&data=all_orders
     [16:43] GET /api/sales/reports/export/?format=excel&data=all_products
     [16:42] GET /api/sales/customers/?page=1&page_size=500
     [16:41] GET /api/sales/customers/?page=2&page_size=500
     ...
     → Usuario está exportando datos masivamente
     ```

4. **Verificar legitimidad**
   - Revisar contexto:
     - ¿Es fin de mes? (típico para reportes)
     - ¿Hay un proyecto especial en curso?
     - ¿El usuario tiene autorización para exportar?

5. **Tomar acción si es sospechoso**
   - Si no hay justificación:
     - Contactar al usuario inmediatamente
     - Suspender temporalmente acceso
     - Revisar qué datos se exportaron
     - Verificar si se compartieron externamente

**Resultado esperado:**
Detección de posible fuga de datos o uso indebido del sistema antes de que cause daño.

---

## Detección de Anomalías

### Caso 12: Detectar Patrón de Ataque

**Escenario:**
Como administrador, quiero identificar si el sistema está bajo ataque (ej. scraping, DDoS de capa 7).

**Flujo de trabajo:**

1. **Revisar estadísticas generales**
   - Ir a `/audit/statistics/?days=1`
   - Notar anomalías:
     ```
     Total de acciones hoy: 45,678
     Promedio histórico: 12,000
     → 3.8x más actividad que lo normal
     ```

2. **Identificar IPs más activas**
   - Revisar `top_ips`:
     ```
     1. 203.0.113.99 - 15,234 acciones (33% del tráfico)
     2. 198.51.100.88 - 8,567 acciones (19% del tráfico)
     3. IP normal - 234 acciones
     ```
   - **Patrón sospechoso:** 2 IPs generan >50% del tráfico

3. **Analizar actividad de IP sospechosa**
   - Ir a `/audit/logs/`
   - Filtros:
     - `ip_address = 203.0.113.99`
     - `start_date = últimas 24 horas`
   - Revisar patrones:
     ```
     [16:45:01] GET /api/sales/products/?page=1
     [16:45:02] GET /api/sales/products/?page=2
     [16:45:03] GET /api/sales/products/?page=3
     [16:45:04] GET /api/sales/products/?page=4
     ...
     → Scraping automatizado del catálogo
     ```

4. **Verificar User Agent**
   - Ver detalles de log:
     ```
     User Agent: "PythonRequests/2.28.1"
     → No es un navegador, es un bot
     ```

5. **Tomar medidas**
   - Inmediatas:
     - Bloquear IPs en firewall
     - Activar rate limiting: máx 100 requests/minuto por IP
   - A corto plazo:
     - Implementar CAPTCHA para requests sospechosos
     - Requerir API key para acceso programático
   - Documentación:
     - Generar reporte del ataque
     - Documentar medidas tomadas

**Resultado esperado:**
Detección y mitigación rápida de ataques automatizados al sistema.

---

### Caso 13: Investigar Pico de Errores 500

**Escenario:**
Como DevOps, recibo alerta de múltiples errores 500. Necesito identificar la causa raíz rápidamente.

**Flujo de trabajo:**

1. **Confirmar el problema en alertas**
   - Ir a `/audit/security-alerts/`
   - Ver alerta:
     ```
     Tipo: server_errors
     Severidad: CRITICAL
     Conteo: 47 errores 5xx en últimas 24 horas
     ```

2. **Analizar distribución temporal**
   - Ir a `/audit/logs/`
   - Filtros:
     - `response_status_gte = 500`
     - `response_status_lte = 599`
     - `ordering = -timestamp`
   - Ver resultados:
     ```
     [16:50] 500 - POST /api/sales/orders/
     [16:49] 500 - POST /api/sales/orders/
     [16:48] 500 - POST /api/sales/orders/
     [16:47] 503 - GET /api/sales/dashboard/
     [16:46] 500 - POST /api/sales/orders/
     ...
     [16:30] 200 - POST /api/sales/orders/ ← Última operación exitosa
     → Problema comenzó a las 16:30
     ```

3. **Identificar endpoint afectado**
   - Patrón claro: `/api/sales/orders/` está fallando
   - Otros endpoints también afectos pero menos

4. **Revisar detalles de error**
   - Click en un log de error:
     ```
     Timestamp: 16:50:23
     Endpoint: POST /api/sales/orders/
     Error: Database connection timeout
     Response time: 30,000ms (timeout)
     Request body: {"product_id": 100, "quantity": 2}
     ```

5. **Correlacionar con otros sistemas**
   - Verificar logs de base de datos
   - Verificar métricas de servidor
   - Hipótesis: Base de datos sobrecargada o caída

6. **Verificar si hay despliegue reciente**
   - Buscar cambios de configuración:
     ```
     Filtros:
     - action_type = CONFIG
     - start_date = hoy 16:00
     ```
   - Resultado:
     ```
     [16:25] admin_user - CONFIG - /api/sales/database/
     Request: {"max_connections": 10}  ← ¡Cambio peligroso!
     → max_connections reducido de 100 a 10
     ```

7. **Tomar acción**
   - Revertir cambio inmediatamente
   - Reiniciar conexiones de BD
   - Monitorear que errores cesen
   - Post-mortem: Documentar incidente y prevenir cambios sin testing

**Resultado esperado:**
Resolución rápida de incidente con identificación precisa de causa raíz mediante logs de auditoría.

---

### Caso 14: Validar Cumplimiento de SLA

**Escenario:**
Como gerente de producto, quiero verificar si estamos cumpliendo nuestro SLA de 99.9% uptime y <200ms tiempo de respuesta.

**Flujo de trabajo:**

1. **Obtener estadísticas del período**
   - Ir a `/audit/statistics/?days=30`
   - Revisar métricas:
     ```
     Total acciones: 234,567
     Total errores: 1,234
     Tasa de error: 0.53%
     → Success rate: 99.47% ✓ (cumple 99.9%)

     Tiempo promedio de respuesta: 178.45ms ✓ (cumple <200ms)
     ```

2. **Verificar errores 5xx (downtime)**
   - Ir a `/audit/logs/`
   - Filtros:
     - `response_status_gte = 500`
     - `start_date = hace 30 días`
   - Total: 234 errores 5xx
   - Calcular downtime:
     ```
     Si asumimos 1 request fallido = 1 usuario afectado
     234 / 234,567 = 0.10% de requests fallidos
     → Uptime: 99.90% ✓ (justo en el límite)
     ```

3. **Analizar distribución de tiempos de respuesta**
   - Generar reporte:
     ```
     Filtros:
     - success = true (solo exitosos)
     - start_date = hace 30 días
     - limit = 10000
     - format = excel
     ```
   - En Excel, calcular percentiles:
     ```
     P50 (mediana): 125ms ✓
     P90: 245ms ✗ (incumple)
     P95: 567ms ✗ (incumple)
     P99: 1,234ms ✗ (incumple)
     ```

4. **Identificar outliers**
   - Filtrar requests >1000ms
   - Agrupar por endpoint:
     ```
     /api/sales/reports/generate/ - 89% de requests lentos
     /api/sales/ml/predict/ - 8% de requests lentos
     /api/sales/dashboard/ - 3% de requests lentos
     ```

5. **Plan de acción**
   - Reportes:
     - Implementar generación asíncrona
     - Meta: <500ms para 95% de requests
   - ML:
     - Optimizar modelo
     - Considerar caché de predicciones frecuentes
   - Dashboard:
     - Implementar caché de 5 minutos
     - Lazy loading

6. **Generar reporte de SLA**
   - Crear dashboard con métricas:
     - Uptime: 99.90% (cumple)
     - Tiempo promedio: 178ms (cumple)
     - P90: 245ms (no cumple - necesita optimización)
     - Acciones correctivas planificadas

**Resultado esperado:**
Validación objetiva del cumplimiento de SLA y plan de acción basado en datos para mejorar métricas.

---

## Mejores Prácticas

### Revisión Regular de Alertas

**Frecuencia recomendada:**
- Alertas de seguridad: Revisar cada hora (automático con polling)
- Estadísticas generales: Revisar diariamente
- Operaciones críticas: Revisar diariamente
- Reportes de cumplimiento: Mensualmente

### Retención de Logs

**Períodos recomendados:**
- **30 días:** Logs de operaciones rutinarias (READ)
- **90 días:** Logs de operaciones de escritura (CREATE, UPDATE)
- **1 año:** Logs de operaciones críticas (DELETE, PAYMENT, CONFIG)
- **Indefinido:** Logs de incidentes de seguridad

**Comando de limpieza:**
```bash
# Limpiar logs de más de 90 días
POST /api/sales/audit/clean-old-logs/
Body: {"days": 90, "confirm": true}
```

### Automatización de Reportes

**Reportes automáticos recomendados:**

1. **Diario:**
   - Alertas de seguridad (si hay)
   - Errores críticos del día
   - Top usuarios del día

2. **Semanal:**
   - Resumen de actividad
   - Tendencias de rendimiento
   - Operaciones críticas

3. **Mensual:**
   - Reporte completo de cumplimiento
   - Análisis de usuarios
   - Métricas de SLA

### Integración con Otros Sistemas

**Notificaciones:**
- Enviar alertas CRITICAL a Slack/Teams
- Email para reportes semanales
- SMS para incidentes graves (múltiples errores 500)

**Monitoring:**
- Integrar con Prometheus/Grafana para métricas en tiempo real
- Dashboards personalizados con datos de auditoría
- Alertas automatizadas basadas en umbrales

---

## Conclusión

El sistema de auditoría proporciona visibilidad completa de todas las operaciones del sistema, permitiendo:

✅ **Seguridad:** Detección temprana de amenazas y ataques
✅ **Compliance:** Reportes detallados para cumplimiento regulatorio
✅ **Rendimiento:** Identificación de cuellos de botella
✅ **Trazabilidad:** Seguimiento completo de cambios y accesos
✅ **Investigación:** Resolución rápida de incidentes
✅ **Gestión:** Evaluación objetiva de actividad de usuarios

---

**Última actualización:** 2025-01-15
**Versión:** 1.0
**Mantenido por:** Equipo Backend
