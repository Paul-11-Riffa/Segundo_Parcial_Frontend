# 📋 Plan de Implementación - Sistema de Auditoría Frontend

## 🎯 Resumen Ejecutivo

Basado en el análisis completo de la documentación del backend, se implementarán **3 páginas principales** del sistema de auditoría con integración total al backend Django existente.

---

## 📊 Análisis Completado

### ✅ Arquitectura del Backend Comprendida:
- **2 Modelos:** AuditLog (logs detallados), UserSession (sesiones)
- **12 Endpoints API:** /logs/, /statistics/, /security-alerts/, etc.
- **Middleware Automático:** Registra TODAS las peticiones HTTP sin código adicional
- **6 Tipos de Alertas:** failed_logins, critical_actions, multiple_ips, server_errors, bulk_deletions, unusual_activity
- **Autenticación:** JWT requerido con rol ADMIN

### ✅ Endpoints Clave Identificados:

| Endpoint | Método | Uso en Frontend |
|----------|--------|-----------------|
| `/api/sales/audit/statistics/?days=7` | GET | **AuditDashboard** - Estadísticas generales |
| `/api/sales/audit/logs/` | GET | **AuditLogs** - Tabla de logs filtrable |
| `/api/sales/audit/logs/{id}/` | GET | **AuditLogs** - Modal de detalle |
| `/api/sales/audit/security-alerts/` | GET | **SecurityAlerts** - Panel de alertas |

---

## 🏗️ Arquitectura de Implementación

```
┌─────────────────────────────────────────────────────────┐
│                  FRONTEND REACT                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────┐  ┌────────────────────┐        │
│  │  AuditDashboard    │  │  AuditLogs         │        │
│  │  ───────────────   │  │  ──────────────    │        │
│  │  - Cards resumen   │  │  - Tabla filtros   │        │
│  │  - Gráficos        │  │  - Paginación      │        │
│  │  - Top users/IPs   │  │  - Modal detalle   │        │
│  │  - Errores recien. │  │  - Búsqueda        │        │
│  └────────────────────┘  └────────────────────┘        │
│                                                          │
│  ┌────────────────────┐                                 │
│  │  SecurityAlerts    │                                 │
│  │  ───────────────   │                                 │
│  │  - 6 tipos alertas │                                 │
│  │  - Severidad color │                                 │
│  │  - Detalles expand │                                 │
│  └────────────────────┘                                 │
│                                                          │
│              ▼ Usan ▼                                    │
│                                                          │
│  ┌────────────────────────────────────────────┐         │
│  │      auditService.js (YA CREADO)           │         │
│  │  ───────────────────────────────────────   │         │
│  │  - getAuditStats(days)                     │         │
│  │  - getAuditLogs(filters, page, pageSize)  │         │
│  │  - getLogDetail(logId)                     │         │
│  │  - getSecurityAlerts()                     │         │
│  └────────────────────────────────────────────┘         │
│                          │                               │
└──────────────────────────┼───────────────────────────────┘
                           │ fetch()
                           │ Headers: Authorization: Bearer JWT
                           ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND DJANGO (YA EXISTE)                  │
│  /api/sales/audit/statistics/                           │
│  /api/sales/audit/logs/                                 │
│  /api/sales/audit/security-alerts/                      │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Plan de Implementación (3 Fases)

### ✅ FASE 0: Preparación (YA COMPLETADA)
- [x] auditService.js creado con 14 funciones
- [x] Rutas activadas en App.jsx
- [x] Sidebar con menú "Auditoría"
- [x] Archivos base creados (AuditDashboard.jsx, AuditLogs.jsx, SecurityAlerts.jsx, Audit.css)

### 🚀 FASE 1: AuditDashboard (Dashboard de Estadísticas)

**Tiempo estimado:** 3 horas

**Endpoint:** `GET /api/sales/audit/statistics/?days=7`

**Componentes a implementar:**

1. **Selector de período** (7, 14, 30, 90 días)
   ```javascript
   const [days, setDays] = useState(7);
   ```

2. **Cards de resumen** (6 tarjetas)
   - Total de acciones (`summary.total_actions`)
   - Total de errores (`summary.total_errors`)
   - Tasa de error (`summary.error_rate %`)
   - Usuarios únicos (`summary.unique_users`)
   - IPs únicas (`summary.unique_ips`)
   - Tiempo promedio respuesta (`summary.avg_response_time_ms ms`)

3. **Gráfico de Dona** - Distribución por tipo de acción
   - Datos: `by_action_type[]`
   - Librería: Chart.js o Recharts
   - Colores: READ (azul), CREATE (verde), UPDATE (amarillo), DELETE (rojo), AUTH (morado)

4. **Gráfico de Barras** - Distribución por severidad
   - Datos: `by_severity[]`
   - Colores: LOW (gris), MEDIUM (azul), HIGH (naranja), CRITICAL (rojo)

5. **Gráfico de Líneas** - Actividad diaria
   - Datos: `by_day[]` (últimos 30 días)
   - 2 líneas: Total acciones vs Errores

6. **Tabla "Top 10 Usuarios"**
   - Datos: `top_users[]`
   - Columnas: Username, Acciones
   - Ordenado por action_count descendente

7. **Tabla "Top 10 IPs"**
   - Datos: `top_ips[]`
   - Columnas: IP, Acciones

8. **Lista "Errores Recientes"**
   - Datos: `recent_errors[]` (últimos 10)
   - Mostrar: timestamp, username, endpoint, error_message
   - Link para ver detalle completo

**Estado del componente:**
```javascript
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [stats, setStats] = useState(null);
const [days, setDays] = useState(7);
```

**Flujo de carga:**
```javascript
useEffect(() => {
  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getAuditStats(days);
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  loadStats();
}, [days]);
```

---

### 🚀 FASE 2: AuditLogs (Tabla de Logs Filtrable)

**Tiempo estimado:** 4 horas

**Endpoint:** `GET /api/sales/audit/logs/`

**Componentes a implementar:**

1. **Barra de Filtros** (8 filtros)
   ```javascript
   const [filters, setFilters] = useState({
     search: '',
     action_type: '',
     severity: '',
     success: '',
     http_method: '',
     start_date: '',
     end_date: '',
     ip_address: '',
   });
   ```

   - **Input de búsqueda global** (search)
   - **Select "Tipo de Acción"** (action_type)
     - Opciones: Todas, AUTH, CREATE, READ, UPDATE, DELETE, PAYMENT, REPORT, CONFIG, ML
   - **Select "Severidad"** (severity)
     - Opciones: Todas, LOW, MEDIUM, HIGH, CRITICAL
   - **Select "Estado"** (success)
     - Opciones: Todas, Exitosas (true), Fallidas (false)
   - **Select "Método HTTP"** (http_method)
     - Opciones: Todos, GET, POST, PUT, PATCH, DELETE
   - **Date Picker "Fecha Desde"** (start_date)
   - **Date Picker "Fecha Hasta"** (end_date)
   - **Input "IP Address"** (ip_address)
   - **Botón "Limpiar Filtros"**

2. **Tabla de Logs** (con paginación)
   
   **Columnas:**
   | Campo | Width | Formato |
   |-------|-------|---------|
   | Timestamp | 180px | `15 Ene 2025, 10:30:45` |
   | Usuario | 120px | `john_doe` |
   | Acción | 100px | Badge color por tipo |
   | Método | 80px | `POST` (monospace) |
   | Endpoint | 250px | `/api/sales/products/` (truncado) |
   | Status | 80px | Badge color por código |
   | Severidad | 100px | Badge color |
   | Tiempo | 100px | `145.67 ms` |
   | Acciones | 80px | Botón "Ver detalle" |

   **Badges de color:**
   ```javascript
   // Action Type
   const ACTION_COLORS = {
     AUTH: 'purple',
     CREATE: 'green',
     READ: 'blue',
     UPDATE: 'yellow',
     DELETE: 'red',
     PAYMENT: 'orange',
     REPORT: 'cyan',
     CONFIG: 'pink',
     ML: 'indigo',
   };

   // Severity
   const SEVERITY_COLORS = {
     LOW: 'gray',
     MEDIUM: 'blue',
     HIGH: 'orange',
     CRITICAL: 'red',
   };

   // Status Code
   const STATUS_COLORS = (status) => {
     if (status >= 200 && status < 300) return 'green';
     if (status >= 300 && status < 400) return 'blue';
     if (status >= 400 && status < 500) return 'orange';
     if (status >= 500) return 'red';
     return 'gray';
   };
   ```

3. **Paginación**
   ```javascript
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(50);
   const [totalCount, setTotalCount] = useState(0);
   ```

   - Selector de page_size: 20, 50, 100, 200
   - Botones: Primera | Anterior | [1] 2 3 ... 10 | Siguiente | Última
   - Info: "Mostrando 1-50 de 1,247 registros"

4. **Modal de Detalle** (al hacer clic en un log)
   
   **Endpoint:** `GET /api/sales/audit/logs/{id}/`

   **Secciones del modal:**
   - **Header:** ID del log, timestamp, badge de severidad
   - **Información Básica:**
     - Usuario: username + user_id
     - Acción: action_description
     - Tipo: action_type (badge)
     - Severidad: severity (badge)
   - **Petición HTTP:**
     - Método: http_method
     - Endpoint: endpoint
     - Query Params: query_params (JSON formateado)
     - Request Body: request_body (JSON formateado con syntax highlighting)
   - **Respuesta HTTP:**
     - Status: response_status (badge con color)
     - Tiempo: response_time_ms
     - Success: success (✓ o ✗)
     - Error: error_message (si existe)
     - Response Body: response_body (JSON formateado)
   - **Contexto:**
     - IP Address: ip_address
     - User Agent: user_agent (truncado con tooltip completo)
     - Timestamp completo: timestamp con milliseconds

5. **Ordenamiento** (clic en headers de tabla)
   ```javascript
   const [ordering, setOrdering] = useState('-timestamp');
   // Opciones: timestamp, -timestamp, response_time_ms, -response_time_ms, username, -username
   ```

**Estado del componente:**
```javascript
const [logs, setLogs] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [filters, setFilters] = useState({});
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(50);
const [totalCount, setTotalCount] = useState(0);
const [ordering, setOrdering] = useState('-timestamp');
const [selectedLog, setSelectedLog] = useState(null);
const [isModalOpen, setIsModalOpen] = useState(false);
```

**Flujo de carga:**
```javascript
useEffect(() => {
  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await getAuditLogs(filters, page, pageSize);
      setLogs(data.results);
      setTotalCount(data.count);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  loadLogs();
}, [filters, page, pageSize, ordering]);
```

---

### 🚀 FASE 3: SecurityAlerts (Panel de Alertas de Seguridad)

**Tiempo estimado:** 2.5 horas

**Endpoint:** `GET /api/sales/audit/security-alerts/`

**Componentes a implementar:**

1. **Header del Panel**
   - Badge total de alertas (`total_alerts`)
   - Período analizado: "Últimas 24 horas" (`analyzed_from` - `analyzed_to`)
   - Botón "Actualizar" (refresh manual)
   - Auto-refresh cada 60 segundos

2. **Lista de Alertas Agrupadas por Severidad**

   **Orden de visualización:**
   1. CRITICAL (rojo)
   2. HIGH (naranja)
   3. MEDIUM (amarillo)

   **6 Tipos de Alertas:**

   **a) failed_logins (HIGH)**
   ```
   🔒 Multiple Failed Login Attempts  [HIGH] [3 IPs]
   
   Descripción: Detected multiple IPs with 5 or more failed login attempts
   Recomendación: Review these IPs and consider blocking or rate-limiting them
   
   Detalles (expandible):
   ┌─────────────────────────────────────────────────────┐
   │ IP: 203.0.113.45                                   │
   │ Intentos fallidos: 12                              │
   │ Usuarios intentados: admin, root, user             │
   │ Primer intento: 15 Ene 2025, 14:30:00             │
   │ Último intento: 15 Ene 2025, 15:45:23             │
   │ [Ver logs completos de esta IP]                    │
   └─────────────────────────────────────────────────────┘
   ```

   **b) critical_actions (CRITICAL)**
   ```
   ⚠️ Critical Actions Performed  [CRITICAL] [5 acciones]
   
   Descripción: Actions with CRITICAL severity level detected
   Recomendación: Review these critical actions to ensure they were authorized
   
   Detalles:
   - 15 Ene 15:30:00 | admin_user | DELETE | /api/sales/products/bulk-delete/ | 500 | "Database connection lost"
   - [Más...] (mostrar hasta 5, botón "Ver todas")
   ```

   **c) multiple_ips (MEDIUM)**
   ```
   🌐 Users Accessing from Multiple IPs  [MEDIUM] [2 usuarios]
   
   Descripción: Users detected accessing from 3 or more different IP addresses
   Recomendación: Verify if these access patterns are legitimate or potential account compromise
   
   Detalles:
   - john_doe: 4 IPs (192.168.1.100 [45 acciones], 10.0.0.50 [12], ...)
   ```

   **d) server_errors (CRITICAL)**
   ```
   🔥 Server Errors (5xx)  [CRITICAL] [7 errores]
   
   Descripción: Multiple server errors detected
   Recomendación: Investigate server logs immediately to identify the root cause
   
   Detalles:
   - 15 Ene 15:50:00 | jane_smith | POST | /api/sales/orders/ | 500 | "Internal Server Error"
   - [Más...]
   ```

   **e) bulk_deletions (HIGH)**
   ```
   🗑️ Bulk Deletion Operations  [HIGH] [2 usuarios]
   
   Descripción: Users performed 5 or more deletions in a short period
   Recomendación: Verify if these bulk deletions were intentional and authorized
   
   Detalles:
   - admin_user: 15 eliminaciones (14:00:00 - 14:15:00) desde 192.168.1.50
   ```

   **f) unusual_activity (MEDIUM)**
   ```
   📊 Unusually High Activity  [MEDIUM] [1 usuario]
   
   Descripción: Users with more than 100 actions in the period
   Recomendación: Verify if this high activity level is expected or potential automation/abuse
   
   Detalles:
   - api_bot: 345 acciones | 12 endpoints | Más frecuente: READ en /api/sales/products/
   ```

3. **Componente de Alerta** (reutilizable)

   **Estructura:**
   ```jsx
   <div className="alert-card alert-{severity}">
     <div className="alert-header">
       <div className="alert-icon">{icon}</div>
       <div className="alert-title-section">
         <h3>{title}</h3>
         <span className="alert-count">{count} eventos</span>
       </div>
       <span className="alert-severity-badge">{severity}</span>
       <button className="alert-expand-btn" onClick={toggleExpand}>
         {isExpanded ? '▼' : '▶'}
       </button>
     </div>
     
     <p className="alert-description">{description}</p>
     <p className="alert-recommendation">💡 {recommendation}</p>
     
     {isExpanded && (
       <div className="alert-details">
         {/* Detalles específicos por tipo */}
       </div>
     )}
   </div>
   ```

4. **Estado "Sin Alertas"**
   ```jsx
   <div className="no-alerts-state">
     <CheckCircleIcon size={64} color="green" />
     <h3>✅ No hay alertas de seguridad</h3>
     <p>El sistema está operando normalmente</p>
     <p className="text-muted">Último análisis: 15 Ene 2025, 16:00:00</p>
   </div>
   ```

**Estado del componente:**
```javascript
const [alerts, setAlerts] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [expandedAlerts, setExpandedAlerts] = useState(new Set());
```

**Auto-refresh:**
```javascript
useEffect(() => {
  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await getSecurityAlerts();
      setAlerts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  loadAlerts(); // Carga inicial
  
  const interval = setInterval(loadAlerts, 60000); // Cada 60 segundos
  
  return () => clearInterval(interval);
}, []);
```

---

## 🎨 Estilos CSS (Audit.css)

### Paleta de Colores por Severidad:
```css
/* Severidad */
--severity-low: #6b7280;
--severity-medium: #3b82f6;
--severity-high: #f59e0b;
--severity-critical: #ef4444;

/* Tipo de Acción */
--action-auth: #8b5cf6;
--action-create: #10b981;
--action-read: #3b82f6;
--action-update: #f59e0b;
--action-delete: #ef4444;
--action-payment: #f97316;
--action-report: #06b6d4;
--action-config: #ec4899;
--action-ml: #6366f1;

/* Status HTTP */
--status-2xx: #10b981;  /* Verde */
--status-3xx: #3b82f6;  /* Azul */
--status-4xx: #f59e0b;  /* Naranja */
--status-5xx: #ef4444;  /* Rojo */
```

### Componentes Clave:
```css
/* Cards de estadísticas */
.audit-stat-card { ... }

/* Tabla de logs */
.audit-table { ... }
.audit-table-row { ... }

/* Badges */
.audit-badge { ... }
.audit-badge-severity-{low|medium|high|critical} { ... }
.audit-badge-action-{auth|create|read|update|delete|...} { ... }
.audit-badge-status-{2xx|3xx|4xx|5xx} { ... }

/* Alertas */
.alert-card { ... }
.alert-card-critical { ... }
.alert-card-high { ... }
.alert-card-medium { ... }
```

---

## 📦 Librerías Necesarias

### Para Gráficos (Dashboard):
```bash
npm install recharts
# O alternativa
npm install chart.js react-chartjs-2
```

### Para Date Pickers (Logs):
```bash
npm install react-datepicker
```

### Para JSON Syntax Highlighting (Modal):
```bash
npm install react-json-view
# O alternativa
npm install react-syntax-highlighter
```

---

## ✅ Criterios de Aceptación

### AuditDashboard:
- [x] Selector de período funcional (7, 14, 30, 90 días)
- [x] 6 cards de resumen con datos reales del backend
- [x] Gráfico de dona con distribución por action_type
- [x] Gráfico de barras con distribución por severity
- [x] Gráfico de líneas con actividad diaria
- [x] Tabla top 10 usuarios ordenada
- [x] Tabla top 10 IPs ordenada
- [x] Lista errores recientes con links
- [x] Loading state mientras carga
- [x] Error handling con mensaje claro

### AuditLogs:
- [x] 8 filtros funcionales (search, action_type, severity, success, http_method, dates, ip)
- [x] Tabla con 9 columnas y datos reales
- [x] Badges de color según tipo/severidad/status
- [x] Paginación completa (botones, selector pageSize, info)
- [x] Ordenamiento por columna (timestamp, response_time, username)
- [x] Modal de detalle con información completa
- [x] JSON formateado con syntax highlighting
- [x] Botón "Limpiar filtros"
- [x] Búsqueda instantánea (debounce 500ms)

### SecurityAlerts:
- [x] Badge total de alertas visible
- [x] Período analizado mostrado
- [x] 6 tipos de alertas renderizadas correctamente
- [x] Agrupación por severidad (CRITICAL → HIGH → MEDIUM)
- [x] Expand/collapse por alerta
- [x] Detalles específicos por tipo de alerta
- [x] Auto-refresh cada 60 segundos
- [x] Estado "Sin alertas" cuando no hay
- [x] Iconos según tipo de alerta
- [x] Links a logs relacionados

---

## 🚀 Orden de Implementación

1. **Día 1 (3 horas):**
   - ✅ Actualizar auditService.js para usar endpoints correctos (`/api/sales/audit/...`)
   - ✅ Implementar AuditDashboard completo con gráficos

2. **Día 2 (4 horas):**
   - ✅ Implementar AuditLogs con filtros y tabla
   - ✅ Implementar Modal de detalle
   - ✅ Implementar paginación

3. **Día 3 (2.5 horas):**
   - ✅ Implementar SecurityAlerts con 6 tipos
   - ✅ Implementar auto-refresh
   - ✅ Pulir estilos CSS

4. **Día 4 (1 hora):**
   - ✅ Testing completo
   - ✅ Fix de bugs
   - ✅ Commit y push final

**Total:** ~10.5 horas de desarrollo

---

## 🔧 Configuración Necesaria

### 1. Actualizar auditService.js:
```javascript
// Cambiar base URL
const AUDIT_BASE_URL = '/sales/audit'; // Agregar /sales/

// Actualizar endpoints
export const getAuditStats = async (days = 7) => {
  try {
    const response = await api.get(`${AUDIT_BASE_URL}/statistics/`, {
      params: { days }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};
```

### 2. Verificar permisos de usuario:
```javascript
// En cada componente
if (user?.role !== 'ADMIN') {
  return <AccessDenied />;
}
```

### 3. Manejo de errores HTTP:
```javascript
// En auditService.js
if (response.status === 401) {
  throw new Error('No autorizado. Por favor inicia sesión.');
}
if (response.status === 403) {
  throw new Error('No tienes permisos de administrador para ver auditoría.');
}
```

---

## 📝 Notas Finales

- **Backend ya está 100% implementado** - Solo falta consumir los endpoints
- **auditService.js ya existe** - Solo necesita ajustes menores de URL
- **Rutas ya están activadas** - /admin/audit/dashboard, /admin/audit/logs, /admin/audit/security
- **Mock data puede eliminarse** - Usaremos datos reales del backend
- **Responsive design** - Todos los componentes deben funcionar en móvil/tablet/desktop

---

¿Comenzamos con la implementación? 🚀
