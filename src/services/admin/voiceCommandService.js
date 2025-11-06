/**
 * Servicio para gestionar comandos de voz y generación de reportes
 * Comunicación con el backend de Django REST Framework
 */

import api from '../api';

const VOICE_COMMANDS_BASE = '/voice-commands';

/**
 * Procesa un comando de texto/voz y genera el reporte correspondiente
 * @param {string} text - Texto del comando en lenguaje natural
 * @returns {Promise} Respuesta del servidor con el reporte generado
 */
export const processVoiceCommand = async (text) => {
  try {
    const response = await api.post(`${VOICE_COMMANDS_BASE}/process/`, {
      text: text.trim()
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error procesando comando de voz:', error);
    
    // Extraer mensaje de error del backend
    const errorMessage = error.response?.data?.error 
      || error.response?.data?.message 
      || 'No se pudo procesar el comando. Por favor, inténtalo de nuevo.';
    
    return {
      success: false,
      error: errorMessage,
      suggestions: error.response?.data?.suggestions || []
    };
  }
};

/**
 * Obtiene el historial de comandos del usuario
 * @param {Object} params - Parámetros de filtrado (page, page_size, status)
 * @returns {Promise} Lista de comandos ejecutados
 */
export const getCommandHistory = async (params = {}) => {
  try {
    const response = await api.get(`${VOICE_COMMANDS_BASE}/`, { params });
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    return {
      success: false,
      error: 'No se pudo cargar el historial de comandos.'
    };
  }
};

/**
 * Obtiene los detalles de un comando específico
 * @param {number} commandId - ID del comando
 * @returns {Promise} Detalles del comando
 */
export const getCommandDetails = async (commandId) => {
  try {
    const response = await api.get(`${VOICE_COMMANDS_BASE}/${commandId}/`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error obteniendo detalles del comando:', error);
    return {
      success: false,
      error: 'No se pudo cargar los detalles del comando.'
    };
  }
};

/**
 * Obtiene las capacidades del sistema (tipos de reportes disponibles)
 * @returns {Promise} Lista de reportes disponibles
 */
export const getSystemCapabilities = async () => {
  try {
    const response = await api.get(`${VOICE_COMMANDS_BASE}/capabilities/`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error obteniendo capacidades:', error);
    return {
      success: false,
      error: 'No se pudo cargar las capacidades del sistema.'
    };
  }
};

/**
 * Descarga un reporte generado (PDF o Excel)
 * @param {number} commandId - ID del comando
 * @param {string} format - Formato de descarga ('pdf' o 'excel')
 * @returns {Promise} Blob del archivo
 */
export const downloadReport = async (commandId, format = 'pdf') => {
  try {
    const response = await api.get(
      `${VOICE_COMMANDS_BASE}/${commandId}/download/`,
      {
        params: { format },
        responseType: 'blob'
      }
    );
    
    // Crear URL de descarga
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_${commandId}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error descargando reporte:', error);
    return {
      success: false,
      error: 'No se pudo descargar el reporte.'
    };
  }
};

/**
 * Ejemplos de comandos válidos para mostrar al usuario
 */
export const COMMAND_EXAMPLES = [
  'Genera el reporte de ventas del último mes',
  'Productos más vendidos esta semana',
  'Dashboard ejecutivo del mes de octubre',
  'Predicciones de ventas para los próximos 7 días',
  'Análisis RFM de clientes en Excel',
  'Ventas por cliente del año 2024',
  'Comparativo de ventas entre enero y febrero',
  'Inventario con stock bajo',
  'Reporte de ventas por categoría del trimestre',
  'Análisis ABC de productos'
];

/**
 * Estados posibles del comando
 */
export const COMMAND_STATES = {
  IDLE: 'idle',
  LISTENING: 'listening',
  PROCESSING: 'processing',
  GENERATING: 'generating',
  SUCCESS: 'success',
  ERROR: 'error',
  LOW_CONFIDENCE: 'low_confidence'
};

export default {
  processVoiceCommand,
  getCommandHistory,
  getCommandDetails,
  getSystemCapabilities,
  downloadReport,
  COMMAND_EXAMPLES,
  COMMAND_STATES
};
