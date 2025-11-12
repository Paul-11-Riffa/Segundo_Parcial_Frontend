# Guía de Integración - Sistema de Auditoría para Frontend

## 📋 Índice
1. [Primeros Pasos](#primeros-pasos)
2. [Autenticación y Configuración](#autenticación-y-configuración)
3. [Implementación de Funcionalidades](#implementación-de-funcionalidades)
4. [Componentes Recomendados](#componentes-recomendados)
5. [Manejo de Errores](#manejo-de-errores)
6. [Optimización y Performance](#optimización-y-performance)

---

## Primeros Pasos

### Prerequisitos

Antes de comenzar a integrar el sistema de auditoría, asegúrate de que:

1. **El usuario esté autenticado** con JWT
2. **El usuario tenga rol ADMIN** en su perfil
3. **Tengas el token JWT** almacenado (localStorage, sessionStorage, o state management)

### Verificación de Permisos

El sistema de auditoría SOLO es accesible para administradores. Antes de mostrar cualquier UI relacionada, verifica:

```javascript
// Pseudocódigo - Verificación en frontend
const userProfile = getCurrentUserProfile();

if (userProfile.role !== 'ADMIN') {
  // No mostrar opciones de auditoría
  // Redirigir o mostrar mensaje de acceso denegado
  return;
}

// Usuario es admin, puede acceder a auditoría
showAuditMenu();
```

### URLs Base

Define la URL base de tu API:

```javascript
// config.js
export const API_BASE_URL = 'http://tu-servidor.com/api/sales';
export const AUDIT_BASE_URL = `${API_BASE_URL}/audit`;

// Endpoints específicos
export const AUDIT_ENDPOINTS = {
  logs: `${AUDIT_BASE_URL}/logs/`,
  logDetail: (id) => `${AUDIT_BASE_URL}/logs/${id}/`,
  statistics: `${AUDIT_BASE_URL}/statistics/`,
  userActivity: (username) => `${AUDIT_BASE_URL}/user-activity/${username}/`,
  activeSessions: `${AUDIT_BASE_URL}/sessions/active/`,
  sessionHistory: `${AUDIT_BASE_URL}/sessions/history/`,
  securityAlerts: `${AUDIT_BASE_URL}/security-alerts/`,
  generateReport: `${AUDIT_BASE_URL}/generate-report/`,
  generateSessionReport: `${AUDIT_BASE_URL}/generate-session-report/`,
  cleanOldLogs: `${AUDIT_BASE_URL}/clean-old-logs/`,
};
```

---

## Autenticación y Configuración

### Headers de Autenticación

Todas las peticiones deben incluir el token JWT:

```javascript
// authService.js
export const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token'); // o tu método de almacenamiento

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};
```

### Servicio HTTP Base

Crea un servicio HTTP reutilizable que maneje autenticación y errores:

```javascript
// httpService.js
import { getAuthHeaders } from './authService';

class HttpService {
  async get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return this.handleResponse(response);
  }

  async post(url, data) {
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.handleResponse(response);
  }

  async handleResponse(response) {
    if (response.status === 401) {
      // Token expirado o inválido
      // Redirigir a login o renovar token
      throw new Error('UNAUTHORIZED');
    }

    if (response.status === 403) {
      // Usuario no es admin
      throw new Error('FORBIDDEN');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Request failed');
    }

    // Manejar respuestas binarias (PDF, Excel)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/pdf')) {
      return response.blob();
    }
    if (contentType && contentType.includes('spreadsheetml')) {
      return response.blob();
    }

    return response.json();
  }
}

export default new HttpService();
```

### Renovación de Token

Implementa renovación automática de token antes de que expire:

```javascript
// tokenRefreshService.js
import { jwtDecode } from 'jwt-decode'; // npm install jwt-decode

export const isTokenExpiringSoon = (token, minutesBeforeExpiry = 5) => {
  try {
    const decoded = jwtDecode(token);
    const expiryTime = decoded.exp * 1000; // Convertir a milisegundos
    const currentTime = Date.now();
    const timeUntilExpiry = expiryTime - currentTime;
    const minutesUntilExpiry = timeUntilExpiry / 1000 / 60;

    return minutesUntilExpiry < minutesBeforeExpiry;
  } catch (error) {
    return true; // Si no se puede decodificar, asumir expirado
  }
};

export const refreshTokenIfNeeded = async () => {
  const token = localStorage.getItem('access_token');

  if (!token || isTokenExpiringSoon(token)) {
    const refreshToken = localStorage.getItem('refresh_token');

    // Llamar a tu endpoint de refresh
    const response = await fetch('/api/auth/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    } else {
      // Refresh falló, redirigir a login
      window.location.href = '/login';
    }
  }

  return token;
};
```

---

## Implementación de Funcionalidades

### 1. Dashboard de Auditoría (Pantalla Principal)

**Objetivo:** Mostrar estadísticas generales del sistema.

**Endpoint:** `GET /api/sales/audit/statistics/?days=7`

**Implementación:**

```javascript
// auditService.js
import httpService from './httpService';
import { AUDIT_ENDPOINTS } from './config';

export const fetchAuditStatistics = async (days = 7) => {
  return httpService.get(AUDIT_ENDPOINTS.statistics, { days });
};
```

**Uso en componente:**

```javascript
// AuditDashboard.jsx / AuditDashboard.dart / etc.
import { fetchAuditStatistics } from './services/auditService';

// En tu función de carga de datos
async function loadDashboard() {
  try {
    showLoading(true);
    const stats = await fetchAuditStatistics(30); // Últimos 30 días

    // Renderizar estadísticas
    displaySummary(stats.summary);
    displayActionDistribution(stats.by_action_type);
    displaySeverityDistribution(stats.by_severity);
    displayDailyActivity(stats.by_day);
    displayTopUsers(stats.top_users);
    displayTopIPs(stats.top_ips);
    displayRecentErrors(stats.recent_errors);

  } catch (error) {
    showError('Error cargando estadísticas: ' + error.message);
  } finally {
    showLoading(false);
  }
}
```

**Elementos a mostrar:**

1. **Tarjetas de resumen:**
   - Total de acciones (stats.summary.total_actions)
   - Total de errores (stats.summary.total_errors)
   - Tasa de error (stats.summary.error_rate + "%")
   - Usuarios únicos (stats.summary.unique_users)
   - Tiempo promedio de respuesta (stats.summary.avg_response_time_ms + " ms")

2. **Gráfico de dona/pie:** Distribución por tipo de acción (stats.by_action_type)
3. **Gráfico de barras:** Distribución por severidad (stats.by_severity)
4. **Gráfico de líneas:** Actividad diaria (stats.by_day)
5. **Tabla:** Top 10 usuarios más activos (stats.top_users)
6. **Tabla:** Top 10 IPs más activas (stats.top_ips)
7. **Lista:** Errores recientes (stats.recent_errors)

---

### 2. Lista de Logs (Bitácora Completa)

**Objetivo:** Tabla filtrable y paginada de todos los logs.

**Endpoint:** `GET /api/sales/audit/logs/`

**Implementación:**

```javascript
// auditService.js
export const fetchAuditLogs = async (filters = {}, page = 1, pageSize = 50) => {
  const params = {
    page,
    page_size: pageSize,
    ...filters,
  };

  return httpService.get(AUDIT_ENDPOINTS.logs, params);
};
```

**Uso en componente:**

```javascript
// AuditLogsTable.jsx
import { fetchAuditLogs } from './services/auditService';

async function loadLogs(filters, page) {
  try {
    showLoading(true);
    const response = await fetchAuditLogs(filters, page, 50);

    // Datos de paginación
    setTotalRecords(response.count);
    setCurrentPage(page);
    setHasNext(response.next !== null);
    setHasPrevious(response.previous !== null);

    // Datos de logs
    setLogs(response.results);

  } catch (error) {
    showError('Error cargando logs: ' + error.message);
  } finally {
    showLoading(false);
  }
}

// Filtros dinámicos
function applyFilters() {
  const filters = {
    user: userFilter.value || undefined,
    action_type: actionTypeFilter.value || undefined,
    severity: severityFilter.value || undefined,
    success: successFilter.value !== 'all' ? successFilter.value === 'true' : undefined,
    start_date: startDateFilter.value || undefined,
    end_date: endDateFilter.value || undefined,
    search: searchInput.value || undefined,
    ordering: '-timestamp', // Más recientes primero
  };

  // Remover undefined
  Object.keys(filters).forEach(key =>
    filters[key] === undefined && delete filters[key]
  );

  loadLogs(filters, 1);
}
```

**Componentes de UI necesarios:**

1. **Barra de filtros:**
   - Input de búsqueda global (search)
   - Select para tipo de acción (action_type)
   - Select para severidad (severity)
   - Select para éxito/fallo (success)
   - Date range picker (start_date, end_date)
   - Input para usuario (user)
   - Botón "Aplicar filtros"
   - Botón "Limpiar filtros"

2. **Tabla de logs:**
   - Columnas:
     - Timestamp (formato: "15 Ene 2025, 10:30:45")
     - Usuario
     - Acción (badge con color según tipo)
     - Endpoint
     - Método HTTP (badge: GET=azul, POST=verde, DELETE=rojo)
     - Status (badge: 2xx=verde, 4xx=amarillo, 5xx=rojo)
     - Severidad (badge con color)
     - IP
     - Acciones (botón "Ver detalles")

3. **Paginación:**
   - Botones: Primera | Anterior | [Página actual] | Siguiente | Última
   - Select de registros por página (50, 100, 200, 500)
   - Texto: "Mostrando 1-50 de 15,847 registros"

**Badges de color recomendados:**

```javascript
// Helpers para colores de badges
export const getActionTypeColor = (actionType) => {
  const colors = {
    'AUTH': 'blue',
    'CREATE': 'green',
    'READ': 'gray',
    'UPDATE': 'yellow',
    'DELETE': 'red',
    'PAYMENT': 'purple',
    'REPORT': 'indigo',
    'ML': 'pink',
    'CONFIG': 'orange',
    'OTHER': 'gray',
  };
  return colors[actionType] || 'gray';
};

export const getSeverityColor = (severity) => {
  const colors = {
    'LOW': 'green',
    'MEDIUM': 'yellow',
    'HIGH': 'orange',
    'CRITICAL': 'red',
  };
  return colors[severity] || 'gray';
};

export const getStatusColor = (status) => {
  if (status >= 200 && status < 300) return 'green';
  if (status >= 400 && status < 500) return 'yellow';
  if (status >= 500) return 'red';
  return 'gray';
};
```

---

### 3. Detalle de Log

**Objetivo:** Modal o página con información completa de un log.

**Endpoint:** `GET /api/sales/audit/logs/{id}/`

**Implementación:**

```javascript
// auditService.js
export const fetchLogDetail = async (logId) => {
  return httpService.get(AUDIT_ENDPOINTS.logDetail(logId));
};
```

**Uso en componente:**

```javascript
// LogDetailModal.jsx
import { fetchLogDetail } from './services/auditService';

async function openLogDetail(logId) {
  try {
    showLoading(true);
    const log = await fetchLogDetail(logId);

    // Mostrar modal con todos los detalles
    showModal({
      id: log.id,
      timestamp: formatDateTime(log.timestamp),
      user: log.username,
      action: log.action_description,
      actionType: log.action_type_display,
      httpMethod: log.http_method,
      endpoint: log.endpoint,
      queryParams: log.query_params,
      requestBody: log.request_body,
      responseStatus: log.response_status,
      responseTime: log.response_time_ms + ' ms',
      success: log.success,
      errorMessage: log.error_message,
      ipAddress: log.ip_address,
      userAgent: log.user_agent,
      severity: log.severity_display,
      additionalData: log.additional_data,
    });

  } catch (error) {
    showError('Error cargando detalle: ' + error.message);
  } finally {
    showLoading(false);
  }
}
```

**Secciones del modal:**

1. **Información básica:**
   - ID del log
   - Fecha/hora con formato completo
   - Usuario
   - IP Address
   - Acción (descripción)

2. **Detalles de la petición:**
   - Método HTTP
   - Endpoint completo
   - Parámetros de query (si existen)
   - Cuerpo de la petición (JSON formateado, si existe)

3. **Detalles de la respuesta:**
   - Código de estado HTTP
   - Tiempo de respuesta
   - Éxito/Fallo (con icono)
   - Mensaje de error (si existe)

4. **Contexto:**
   - Tipo de acción
   - Nivel de severidad
   - User Agent (colapsable)
   - Datos adicionales (JSON formateado, si existe)

---

### 4. Alertas de Seguridad

**Objetivo:** Panel de alertas críticas que requieren atención.

**Endpoint:** `GET /api/sales/audit/security-alerts/`

**Implementación:**

```javascript
// auditService.js
export const fetchSecurityAlerts = async () => {
  return httpService.get(AUDIT_ENDPOINTS.securityAlerts);
};
```

**Uso en componente:**

```javascript
// SecurityAlertsPanel.jsx
import { fetchSecurityAlerts } from './services/auditService';

async function loadSecurityAlerts() {
  try {
    const alerts = await fetchSecurityAlerts();

    if (alerts.total_alerts === 0) {
      showMessage('No hay alertas de seguridad en las últimas 24 horas');
      return;
    }

    // Agrupar alertas por severidad
    const criticalAlerts = alerts.alerts.filter(a => a.severity === 'CRITICAL');
    const highAlerts = alerts.alerts.filter(a => a.severity === 'HIGH');
    const mediumAlerts = alerts.alerts.filter(a => a.severity === 'MEDIUM');

    displayAlerts({
      critical: criticalAlerts,
      high: highAlerts,
      medium: mediumAlerts,
      period: alerts.period,
      total: alerts.total_alerts,
    });

  } catch (error) {
    showError('Error cargando alertas: ' + error.message);
  }
}

// Auto-refresh cada minuto
setInterval(loadSecurityAlerts, 60000);
```

**Elementos de UI:**

1. **Badge de notificación:**
   - Mostrar número total de alertas (alerts.total_alerts)
   - Color rojo si hay alertas CRITICAL
   - Posicionar en menú/navbar para visibilidad

2. **Panel de alertas:**
   - Secciones agrupadas por severidad (CRITICAL, HIGH, MEDIUM)
   - Cada alerta muestra:
     - Título (alert.title)
     - Descripción (alert.description)
     - Conteo (alert.count)
     - Recomendación (alert.recommendation)
     - Lista de detalles expandible (alert.details)

3. **Iconos por tipo de alerta:**
   - failed_logins: 🔒 ícono de candado
   - critical_actions: ⚠️ ícono de advertencia
   - multiple_ips: 🌐 ícono de mundo
   - server_errors: 🔥 ícono de error
   - bulk_deletions: 🗑️ ícono de basura
   - unusual_activity: 📊 ícono de gráfico

**Ejemplo de alerta expandida:**

```
🔒 Multiple Failed Login Attempts  [CRÍTICO] (3 IPs)

Descripción: Detected multiple IPs with 5 or more failed login attempts
Recomendación: Review these IPs and consider blocking or rate-limiting them

Detalles:
┌─────────────────────────────────────────────────────────────────┐
│ IP: 203.0.113.45                                               │
│ Intentos fallidos: 12                                          │
│ Usuarios intentados: admin, root, user                         │
│ Primer intento: 15 Ene 2025, 14:30:00                         │
│ Último intento: 15 Ene 2025, 15:45:23                         │
│ [Botón: Bloquear IP] [Botón: Ver logs completos]              │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5. Actividad de Usuario

**Objetivo:** Ver actividad detallada de un usuario específico.

**Endpoint:** `GET /api/sales/audit/user-activity/{username}/?days=30`

**Implementación:**

```javascript
// auditService.js
export const fetchUserActivity = async (username, days = 30) => {
  return httpService.get(AUDIT_ENDPOINTS.userActivity(username), { days });
};
```

**Uso en componente:**

```javascript
// UserActivityView.jsx
import { fetchUserActivity } from './services/auditService';

async function loadUserActivity(username, days) {
  try {
    showLoading(true);
    const activity = await fetchUserActivity(username, days);

    // Mostrar resumen
    displayUserSummary({
      username: activity.username,
      userId: activity.user_id,
      totalActions: activity.summary.total_actions,
      totalErrors: activity.summary.total_errors,
      errorRate: activity.summary.error_rate,
      avgResponseTime: activity.summary.avg_response_time_ms,
      activeSessions: activity.summary.active_sessions,
    });

    // Gráfico de distribución de acciones
    displayActionDistribution(activity.by_action_type);

    // Lista de acciones recientes
    displayRecentActions(activity.recent_actions);

    // IPs utilizadas
    displayIPsUsed(activity.ips_used);

    // Sesiones activas
    displayActiveSessions(activity.active_sessions);

  } catch (error) {
    if (error.message.includes('404')) {
      showError('Usuario no encontrado');
    } else {
      showError('Error cargando actividad: ' + error.message);
    }
  } finally {
    showLoading(false);
  }
}
```

**Elementos de UI:**

1. **Selector de usuario:**
   - Autocomplete con lista de usuarios
   - Selector de rango de días (7, 30, 90)

2. **Tarjetas de resumen:**
   - Total de acciones
   - Errores
   - Tasa de error
   - Sesiones activas
   - Tiempo promedio de respuesta

3. **Gráfico de dona:** Distribución de acciones por tipo

4. **Timeline de actividad:**
   - Lista de acciones recientes (hasta 20)
   - Formato de timeline vertical
   - Con iconos según tipo de acción

5. **Tabla de IPs:**
   - IP
   - Conteo de acciones
   - Última vez vista

6. **Tabla de sesiones activas:**
   - IP
   - Hora de login
   - Duración
   - Última actividad

---

### 6. Sesiones Activas

**Objetivo:** Monitorear sesiones activas en el sistema.

**Endpoint:** `GET /api/sales/audit/sessions/active/`

**Implementación:**

```javascript
// auditService.js
export const fetchActiveSessions = async (filters = {}, page = 1) => {
  const params = { page, page_size: 50, ...filters };
  return httpService.get(AUDIT_ENDPOINTS.activeSessions, params);
};
```

**Uso en componente:**

```javascript
// ActiveSessionsTable.jsx
import { fetchActiveSessions } from './services/auditService';

async function loadActiveSessions(filters, page) {
  try {
    showLoading(true);
    const response = await fetchActiveSessions(filters, page);

    setSessions(response.results);
    setTotalCount(response.count);
    setCurrentPage(page);

  } catch (error) {
    showError('Error cargando sesiones: ' + error.message);
  } finally {
    showLoading(false);
  }
}

// Auto-refresh cada 30 segundos
setInterval(() => loadActiveSessions(currentFilters, currentPage), 30000);
```

**Elementos de UI:**

1. **Filtros:**
   - Buscar por usuario
   - Buscar por IP

2. **Tabla de sesiones:**
   - Columnas:
     - Usuario
     - IP
     - Hora de login (ej: "Hace 2 horas")
     - Última actividad (ej: "Hace 5 minutos")
     - Duración (ej: "2h 30m")
     - User Agent (colapsado, expandible)

3. **Indicadores:**
   - Badge "ACTIVO" en verde
   - Total de sesiones activas en la parte superior

---

### 7. Generación de Reportes

**Objetivo:** Exportar datos de auditoría en PDF o Excel.

**Endpoint:** `POST /api/sales/audit/generate-report/`

**Implementación:**

```javascript
// auditService.js
export const generateAuditReport = async (filters, format) => {
  const data = {
    filters: filters,
    format: format, // 'json', 'pdf', 'excel'
  };

  return httpService.post(AUDIT_ENDPOINTS.generateReport, data);
};

// Helper para descargar archivos binarios
export const downloadReport = async (filters, format) => {
  const blob = await generateAuditReport(filters, format);

  // Crear nombre de archivo
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const extension = format === 'excel' ? 'xlsx' : format;
  const filename = `audit_report_${timestamp}.${extension}`;

  // Descargar archivo
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
```

**Uso en componente:**

```javascript
// ReportGeneratorForm.jsx
import { downloadReport, generateAuditReport } from './services/auditService';

async function handleGenerateReport() {
  try {
    showLoading(true);

    // Recopilar filtros del formulario
    const filters = {
      user: userInput.value || undefined,
      action_type: actionTypeSelect.value || undefined,
      start_date: startDateInput.value || undefined,
      end_date: endDateInput.value || undefined,
      severity: severitySelect.value || undefined,
      success: successSelect.value !== 'all' ? successSelect.value === 'true' : undefined,
      limit: parseInt(limitInput.value) || 1000,
    };

    // Remover undefined
    Object.keys(filters).forEach(key =>
      filters[key] === undefined && delete filters[key]
    );

    const format = formatSelect.value; // 'json', 'pdf', 'excel'

    if (format === 'json') {
      // JSON se puede mostrar en pantalla o descargar
      const report = await generateAuditReport(filters, 'json');
      displayReportData(report);
    } else {
      // PDF y Excel se descargan directamente
      await downloadReport(filters, format);
      showSuccess(`Reporte ${format.toUpperCase()} generado exitosamente`);
    }

  } catch (error) {
    showError('Error generando reporte: ' + error.message);
  } finally {
    showLoading(false);
  }
}
```

**Elementos de UI:**

1. **Formulario de filtros:**
   - Usuario (input)
   - Tipo de acción (select multiple)
   - Rango de fechas (date range picker)
   - Severidad (select multiple)
   - Solo exitosas/fallidas (radio buttons: Todas/Exitosas/Fallidas)
   - Límite de registros (input number, default: 1000)

2. **Selector de formato:**
   - Radio buttons: JSON / PDF / Excel
   - Nota: "PDF limitado a 30 registros. Para más, use Excel."

3. **Botón de generación:**
   - "Generar Reporte"
   - Deshabilitar mientras carga
   - Mostrar progress indicator

4. **Previsualización (para JSON):**
   - Mostrar estadísticas del reporte
   - Tabla de logs
   - Opción de descargar JSON

---

### 8. Limpieza de Logs Antiguos

**Objetivo:** Herramienta de mantenimiento para eliminar logs viejos.

**Endpoint:** `POST /api/sales/audit/clean-old-logs/`

**Implementación:**

```javascript
// auditService.js
export const cleanOldLogs = async (days, confirm = false) => {
  return httpService.post(AUDIT_ENDPOINTS.cleanOldLogs, { days, confirm });
};
```

**Uso en componente:**

```javascript
// CleanLogsDialog.jsx
import { cleanOldLogs } from './services/auditService';

async function handleCleanLogs() {
  try {
    const days = parseInt(daysInput.value);

    if (days < 30) {
      showError('Debe conservar al menos 30 días de logs');
      return;
    }

    // Paso 1: Previsualización sin confirmar
    showLoading(true);
    const preview = await cleanOldLogs(days, false);
    showLoading(false);

    // Mostrar confirmación
    const confirmed = await showConfirmDialog({
      title: 'Confirmar eliminación de logs',
      message: `Se eliminarán ${preview.count} registros anteriores a ${formatDate(preview.cutoff_date)}. Esta acción no se puede deshacer.`,
      confirmText: 'Eliminar',
      confirmColor: 'red',
    });

    if (!confirmed) return;

    // Paso 2: Eliminar con confirmación
    showLoading(true);
    const result = await cleanOldLogs(days, true);
    showLoading(false);

    showSuccess(`${result.deleted_count} logs eliminados exitosamente`);
    closeDialog();

  } catch (error) {
    showError('Error eliminando logs: ' + error.message);
  } finally {
    showLoading(false);
  }
}
```

**Elementos de UI:**

1. **Dialog/Modal:**
   - Input numérico: "Días a conservar" (min: 30, default: 90)
   - Texto de ayuda: "Se eliminarán logs anteriores a esta fecha"
   - Botón "Calcular" (preview sin confirmar)

2. **Preview:**
   - Mostrar conteo de logs a eliminar
   - Mostrar fecha de corte
   - Botón "Eliminar" (rojo, peligroso)
   - Botón "Cancelar"

3. **Confirmación adicional:**
   - Dialog de confirmación con advertencia
   - Checkbox "Entiendo que esta acción no se puede deshacer"

---

## Componentes Recomendados

### Librería de UI Components

Para implementar las funcionalidades descritas, estos componentes son útiles:

**Para Web (React/Vue/Angular):**
- **Tablas:** TanStack Table, AG Grid, Material Table
- **Gráficos:** Chart.js, Recharts, Apache ECharts
- **Date Pickers:** react-datepicker, vue-datepicker, ngx-daterangepicker
- **Modals:** react-modal, vue-modal, ngx-bootstrap modals
- **Notificaciones:** react-toastify, vue-toastification, ngx-toastr

**Para Mobile (Flutter):**
- **Tablas:** DataTable widget, flutter_table
- **Gráficos:** fl_chart, syncfusion_flutter_charts
- **Date Pickers:** flutter_datetime_picker
- **Modals:** showDialog, showModalBottomSheet
- **Notificaciones:** fluttertoast, overlay_support

### Estructura de State Management

Recomendaciones según tu stack:

**React (con Redux/Zustand):**
```javascript
// auditStore.js
const auditStore = {
  state: {
    logs: [],
    statistics: null,
    alerts: [],
    activeSessions: [],
    loading: false,
    error: null,
    filters: {},
    pagination: { page: 1, pageSize: 50, total: 0 },
  },

  actions: {
    fetchLogs,
    fetchStatistics,
    fetchAlerts,
    applyFilters,
    changePage,
    // ...
  },
};
```

**Flutter (con Provider/Riverpod/Bloc):**
```dart
// audit_provider.dart
class AuditProvider extends ChangeNotifier {
  List<AuditLog> _logs = [];
  AuditStatistics? _statistics;
  List<SecurityAlert> _alerts = [];
  bool _loading = false;
  String? _error;

  // Getters y métodos
  Future<void> fetchLogs(Map<String, dynamic> filters) async { }
  Future<void> fetchStatistics(int days) async { }
  // ...
}
```

---

## Manejo de Errores

### Errores Comunes y Soluciones

#### 1. Error 401 (Unauthorized)

**Causa:** Token JWT inválido o expirado

**Solución:**
```javascript
// En tu httpService
if (response.status === 401) {
  // Intentar renovar token
  const newToken = await refreshToken();

  if (newToken) {
    // Reintentar petición con nuevo token
    return retryRequest(originalRequest, newToken);
  } else {
    // Renovación falló, redirigir a login
    redirectToLogin();
  }
}
```

#### 2. Error 403 (Forbidden)

**Causa:** Usuario no es administrador

**Solución:**
```javascript
// Verificar rol ANTES de intentar acceder
if (currentUser.role !== 'ADMIN') {
  showErrorPage({
    title: 'Acceso Denegado',
    message: 'No tienes permisos para acceder a esta sección.',
    action: 'Volver al inicio',
  });
  return;
}

// Proceder con la carga de auditoría
```

#### 3. Error 404 (Not Found)

**Causa:** Recurso no existe (log ID inválido, usuario no existe)

**Solución:**
```javascript
try {
  const log = await fetchLogDetail(logId);
} catch (error) {
  if (error.message.includes('404')) {
    showError('El registro de auditoría no existe o fue eliminado');
    closeModal();
  } else {
    throw error;
  }
}
```

#### 4. Error 500 (Internal Server Error)

**Causa:** Error inesperado en el backend

**Solución:**
```javascript
try {
  const data = await fetchAuditLogs();
} catch (error) {
  if (error.message.includes('500')) {
    showError('Error del servidor. Por favor, intenta de nuevo más tarde.');
    // Opcionalmente, reportar error a sistema de logging
    logErrorToService(error);
  }
}
```

### Validaciones del Frontend

Implementa validaciones antes de enviar peticiones:

```javascript
// Validación de rango de fechas
function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) return true; // Opcional

  if (new Date(startDate) > new Date(endDate)) {
    showError('La fecha inicial debe ser anterior a la fecha final');
    return false;
  }

  const daysDiff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
  if (daysDiff > 365) {
    showWarning('El rango de fechas es muy amplio. Esto puede afectar el rendimiento.');
  }

  return true;
}

// Validación de límite de registros
function validateLimit(limit) {
  if (limit < 1 || limit > 10000) {
    showError('El límite debe estar entre 1 y 10,000');
    return false;
  }
  return true;
}

// Validación de días para limpieza
function validateCleanupDays(days) {
  if (days < 30) {
    showError('Debe conservar al menos 30 días de logs');
    return false;
  }
  return true;
}
```

---

## Optimización y Performance

### 1. Caché de Datos

Cachea estadísticas que cambian poco:

```javascript
// cacheService.js
class CacheService {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (now > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  set(key, data, ttlSeconds = 300) {
    const expiry = Date.now() + (ttlSeconds * 1000);
    this.cache.set(key, { data, expiry });
  }
}

export default new CacheService();
```

**Uso:**

```javascript
// auditService.js
import cache from './cacheService';

export const fetchAuditStatistics = async (days) => {
  const cacheKey = `audit_stats_${days}`;
  const cached = cache.get(cacheKey);

  if (cached) {
    return cached;
  }

  const data = await httpService.get(AUDIT_ENDPOINTS.statistics, { days });
  cache.set(cacheKey, data, 300); // 5 minutos

  return data;
};
```

### 2. Debouncing en Búsquedas

Evita peticiones excesivas durante búsqueda:

```javascript
// useDebounce.js (React Hook)
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

**Uso:**

```javascript
// AuditLogsTable.jsx
import { useDebounce } from './hooks/useDebounce';

function AuditLogsTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    // Solo hace petición cuando el usuario deja de escribir por 500ms
    loadLogs({ search: debouncedSearch });
  }, [debouncedSearch]);

  return (
    <input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Buscar..."
    />
  );
}
```

### 3. Paginación Infinita vs. Tradicional

**Paginación tradicional:** Mejor para tablas de logs (permite saltar a páginas específicas)

**Scroll infinito:** Mejor para feeds de actividad (carga continua)

```javascript
// Infinite scroll con Intersection Observer
function useInfiniteScroll(callback) {
  const observer = useRef();
  const loadingRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        callback(); // Cargar más datos
      }
    });

    if (node) observer.current.observe(node);
  }, [callback]);

  return loadingRef;
}
```

### 4. Lazy Loading de Componentes

Carga componentes pesados solo cuando se necesiten:

```javascript
// React
import { lazy, Suspense } from 'react';

const ReportGenerator = lazy(() => import('./components/ReportGenerator'));

function AuditDashboard() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ReportGenerator />
    </Suspense>
  );
}
```

### 5. Virtualización de Tablas

Para tablas con muchos registros, usa virtualización:

```javascript
// Con react-window
import { FixedSizeList } from 'react-window';

function VirtualizedLogTable({ logs }) {
  const Row = ({ index, style }) => (
    <div style={style}>
      {/* Renderizar fila del log */}
      <LogRow log={logs[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      itemCount={logs.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </FixedSizeList>
  );
}
```

---

## Checklist de Implementación

Usa este checklist para asegurar una implementación completa:

### Configuración Inicial
- [ ] Configurar URLs base de API
- [ ] Implementar servicio HTTP con autenticación JWT
- [ ] Implementar renovación automática de token
- [ ] Verificar permisos de administrador antes de mostrar UI

### Funcionalidades Core
- [ ] Dashboard de estadísticas
- [ ] Lista de logs con filtros
- [ ] Detalle de log individual
- [ ] Alertas de seguridad
- [ ] Actividad de usuario
- [ ] Sesiones activas
- [ ] Historial de sesiones
- [ ] Generación de reportes (JSON/PDF/Excel)
- [ ] Limpieza de logs antiguos

### Componentes de UI
- [ ] Tabla de logs con paginación
- [ ] Filtros avanzados
- [ ] Badges de colores (acción, severidad, status)
- [ ] Modal de detalle de log
- [ ] Panel de alertas con auto-refresh
- [ ] Formulario de generación de reportes
- [ ] Dialog de limpieza de logs
- [ ] Gráficos de estadísticas

### Optimización
- [ ] Caché de datos estáticos
- [ ] Debouncing en búsquedas
- [ ] Lazy loading de componentes
- [ ] Virtualización de tablas largas
- [ ] Loading indicators
- [ ] Manejo de errores

### Testing
- [ ] Probar con token expirado
- [ ] Probar con usuario no admin
- [ ] Probar filtros combinados
- [ ] Probar generación de reportes en todos los formatos
- [ ] Probar limpieza de logs
- [ ] Probar con diferentes tamaños de página
- [ ] Probar con rangos de fechas largos

---

**Última actualización:** 2025-01-15
**Versión:** 1.0
**Mantenido por:** Equipo Backend
