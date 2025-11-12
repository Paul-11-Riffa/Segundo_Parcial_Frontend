import api from '../apiConfig';

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                AUDIT SERVICE - API CALLS                     ║
 * ║  Servicio para gestión de auditoría y seguridad del sistema  ║
 * ║  Base URL: /api/sales/audit/                                 ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const AUDIT_BASE_URL = '/sales/audit';

/**
 * ============================================
 * ESTADÍSTICAS DE AUDITORÍA (Dashboard)
 * ============================================
 */

/**
 * Obtener estadísticas generales de auditoría
 * GET /api/sales/audit/statistics/?days=7
 * @param {number} days - Número de días para el análisis (default: 7)
 * @returns {Promise} {
 *   summary: { total_actions, total_errors, error_rate, unique_users, unique_ips, avg_response_time_ms },
 *   by_action_type: [...],
 *   by_severity: [...],
 *   by_day: [...],
 *   top_users: [...],
 *   top_ips: [...],
 *   top_endpoints: [...],
 *   recent_errors: [...],
 *   recent_critical: [...]
 * }
 */
export const getAuditStats = async (days = 7) => {
  try {
    const response = await api.get(`${AUDIT_BASE_URL}/statistics/`, {
      params: { days }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas de auditoría:', error);
    throw error;
  }
};

/**
 * ============================================
 * LOGS DE AUDITORÍA
 * ============================================
 */

/**
 * Obtener logs de auditoría con filtros
 * GET /api/sales/audit/logs/
 * @param {Object} filters - Filtros completos según backend:
 *   - search: Búsqueda global
 *   - action_type: AUTH, CREATE, READ, UPDATE, DELETE, REPORT, PAYMENT, CONFIG, ML, OTHER
 *   - severity: LOW, MEDIUM, HIGH, CRITICAL
 *   - success: true/false
 *   - http_method: GET, POST, PUT, PATCH, DELETE
 *   - start_date: Fecha inicio (YYYY-MM-DD)
 *   - end_date: Fecha fin (YYYY-MM-DD)
 *   - ip_address: Dirección IP
 *   - endpoint: Endpoint específico
 *   - response_status: Status HTTP exacto
 *   - response_status_gte: Status HTTP mayor o igual
 *   - response_status_lte: Status HTTP menor o igual
 *   - ordering: Campo para ordenar (ej: '-timestamp', 'response_time_ms')
 * @param {number} page - Número de página
 * @param {number} pageSize - Tamaño de página
 * @returns {Promise} { count, next, previous, results: [...] }
 */
export const getAuditLogs = async (filters = {}, page = 1, pageSize = 50) => {
  try {
    // Construir params limpiando valores vacíos
    const params = {
      page,
      page_size: pageSize
    };

    // Agregar filtros solo si tienen valor
    if (filters.search) params.search = filters.search;
    if (filters.action_type) params.action_type = filters.action_type;
    if (filters.severity) params.severity = filters.severity;
    if (filters.success !== undefined && filters.success !== '') params.success = filters.success;
    if (filters.http_method) params.http_method = filters.http_method;
    if (filters.start_date) params.start_date = filters.start_date;
    if (filters.end_date) params.end_date = filters.end_date;
    if (filters.ip_address) params.ip_address = filters.ip_address;
    if (filters.endpoint) params.endpoint = filters.endpoint;
    if (filters.response_status) params.response_status = filters.response_status;
    if (filters.response_status_gte) params.response_status_gte = filters.response_status_gte;
    if (filters.response_status_lte) params.response_status_lte = filters.response_status_lte;
    if (filters.ordering) params.ordering = filters.ordering;
    if (filters.user) params.user = filters.user;

    const response = await api.get(`${AUDIT_BASE_URL}/logs/`, { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener logs de auditoría:', error);
    throw error;
  }
};

/**
 * Obtener detalle de un log específico
 * GET /api/sales/audit/logs/{id}/
 * @param {number} logId - ID del log
 * @returns {Promise} Detalles completos del log con request_body, response_body, etc.
 */
export const getLogDetail = async (logId) => {
  try {
    const response = await api.get(`${AUDIT_BASE_URL}/logs/${logId}/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener detalle del log:', error);
    throw error;
  }
};

/**
 * ============================================
 * ALERTAS DE SEGURIDAD
 * ============================================
 */

/**
 * Obtener alertas de seguridad agrupadas
 * GET /api/sales/audit/security-alerts/
 * @returns {Promise} {
 *   period: "Last 24 hours",
 *   analyzed_from: "2025-01-14T16:00:00Z",
 *   analyzed_to: "2025-01-15T16:00:00Z",
 *   total_alerts: 15,
 *   alerts: [
 *     {
 *       type: "failed_logins"|"critical_actions"|"multiple_ips"|"server_errors"|"bulk_deletions"|"unusual_activity",
 *       severity: "LOW"|"MEDIUM"|"HIGH"|"CRITICAL",
 *       count: 3,
 *       title: "...",
 *       description: "...",
 *       recommendation: "...",
 *       details: [...]
 *     }
 *   ]
 * }
 */
export const getSecurityAlerts = async () => {
  try {
    const response = await api.get(`${AUDIT_BASE_URL}/security-alerts/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener alertas de seguridad:', error);
    throw error;
  }
};

/**
 * ============================================
 * ACTIVIDAD DE USUARIOS
 * ============================================
 */

/**
 * Obtener actividad de un usuario específico
 * GET /api/sales/audit/user-activity/{username}/
 * @param {string} username - Nombre de usuario
 * @param {number} days - Días a analizar
 * @returns {Promise} Estadísticas de actividad del usuario
 */
export const getUserActivity = async (username, days = 30) => {
  try {
    const response = await api.get(`${AUDIT_BASE_URL}/user-activity/${username}/`, {
      params: { days }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener actividad del usuario:', error);
    throw error;
  }
};

/**
 * ============================================
 * SESIONES
 * ============================================
 */

/**
 * Obtener sesiones activas
 * GET /api/sales/audit/sessions/active/
 * @returns {Promise} Lista de sesiones activas
 */
export const getActiveSessions = async () => {
  try {
    const response = await api.get(`${AUDIT_BASE_URL}/sessions/active/`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener sesiones activas:', error);
    throw error;
  }
};

/**
 * Obtener historial de sesiones de un usuario
 * GET /api/sales/audit/sessions/history/?user={username}
 * @param {string} username - Nombre de usuario
 * @returns {Promise} Historial de sesiones
 */
export const getSessionHistory = async (username) => {
  try {
    const response = await api.get(`${AUDIT_BASE_URL}/sessions/history/`, {
      params: { user: username }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener historial de sesiones:', error);
    throw error;
  }
};

/**
 * ============================================
 * REPORTES
 * ============================================
 */

/**
 * Generar reporte de auditoría
 * POST /api/sales/audit/generate-report/
 * @param {Object} params - Parámetros del reporte:
 *   - format: 'pdf'|'excel'|'json'
 *   - start_date: Fecha inicio
 *   - end_date: Fecha fin
 *   - action_types: Array de tipos de acción
 *   - severities: Array de severidades
 *   - include_errors_only: boolean
 * @returns {Promise} URL del reporte generado o datos JSON
 */
export const generateReport = async (params) => {
  try {
    const response = await api.post(`${AUDIT_BASE_URL}/generate-report/`, params);
    return response.data;
  } catch (error) {
    console.error('Error al generar reporte:', error);
    throw error;
  }
};

/**
 * ============================================
 * CONSTANTES
 * ============================================
 */

export const ACTION_TYPES = {
  AUTH: 'AUTH',
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  REPORT: 'REPORT',
  PAYMENT: 'PAYMENT',
  CONFIG: 'CONFIG',
  ML: 'ML',
  OTHER: 'OTHER'
};

export const SEVERITY_LEVELS = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
};

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export const ALERT_TYPES = {
  FAILED_LOGINS: 'failed_logins',
  CRITICAL_ACTIONS: 'critical_actions',
  MULTIPLE_IPS: 'multiple_ips',
  SERVER_ERRORS: 'server_errors',
  BULK_DELETIONS: 'bulk_deletions',
  UNUSUAL_ACTIVITY: 'unusual_activity'
};

// Exportar todas las funciones
export default {
  getAuditStats,
  getAuditLogs,
  getLogDetail,
  getSecurityAlerts,
  getUserActivity,
  getActiveSessions,
  getSessionHistory,
  generateReport,
  
  // Constantes
  ACTION_TYPES,
  SEVERITY_LEVELS,
  HTTP_METHODS,
  ALERT_TYPES
};
