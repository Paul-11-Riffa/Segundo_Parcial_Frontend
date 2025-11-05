/**
 * Archivo central de servicios API
 * Exporta todos los servicios para fácil importación
 * 
 * Uso:
 * import { authService, dashboardService } from '../services/api';
 * 
 * O importar servicios específicos:
 * import authService from '../services/authService';
 * import dashboardService from '../services/dashboardService';
 */

// Exportar configuración base
export { default as api, API_BASE_URL } from './apiConfig';

// Exportar servicios específicos
export { default as authService } from './authService';
export { default as dashboardService } from './dashboardService';

// Exportación por defecto (configuración de axios)
export { default } from './apiConfig';
