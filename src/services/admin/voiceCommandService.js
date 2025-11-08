/**
 * Servicio para gestionar comandos de voz y generación de reportes
 * Comunicación con el backend de Django REST Framework
 */

import api from '../api';
import { devLog } from '../../utils/devLogger';
import { parseApiError } from '../../utils/errorParser';

const VOICE_COMMANDS_BASE = '/voice-commands';

// Mocks en memoria para desarrollo: contador de llamadas por commandId
const __devMockPolling = new Map();

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
    devLog('Error procesando comando de voz:', error);
    const parsed = parseApiError(error);
    return {
      success: false,
      error: parsed.message || 'No se pudo procesar el comando. Por favor, inténtalo de nuevo.',
      details: parsed.details || null,
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
    devLog('Error obteniendo historial:', error);
    const parsed = parseApiError(error);
    return {
      success: false,
      error: parsed.message || 'No se pudo cargar el historial de comandos.',
      details: parsed.details || null
    };
  }
};

/**
 * Obtiene los detalles de un comando específico
 * @param {number} commandId - ID del comando
 * @returns {Promise} Detalles del comando
 */
export const getCommandDetails = async (commandId) => {
  // DEV: soporte de mock local si commandId es una cadena que empieza con 'MOCK_'
  if (process.env.NODE_ENV === 'development' && typeof commandId === 'string' && commandId.startsWith('MOCK_')) {
    // incrementar contador de intentos
    const attempts = (__devMockPolling.get(commandId) || 0) + 1;
    __devMockPolling.set(commandId, attempts);

    // Simular: los primeros 2 intentos -> PROCESSING, tercer intento -> SUCCESS con file_url
    if (attempts < 3) {
      return {
        success: true,
        data: {
          id: commandId,
          status: 'PROCESSING',
          message: `Simulación: intento ${attempts} - aún procesando`,
        }
      };
    }

    // Respuesta final simulada - apuntamos a un PDF de muestra público para que el navegador lo muestre
    return {
      success: true,
      data: {
        id: commandId,
        status: 'EXECUTED',
        // PDF de ejemplo (público) para pruebas: un PDF pequeño alojado en w3.org
        file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        result_data: {
          summary: { total: 12345, items: 10 }
        }
      }
    };
  }

  try {
    const response = await api.get(`${VOICE_COMMANDS_BASE}/${commandId}/`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    devLog('Error obteniendo detalles del comando:', error);
    const parsed = parseApiError(error);
    return {
      success: false,
      error: parsed.message || 'No se pudo cargar los detalles del comando.',
      details: parsed.details || null
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
    devLog('Error obteniendo capacidades:', error);
    const parsed = parseApiError(error);
    return {
      success: false,
      error: parsed.message || 'No se pudo cargar las capacidades del sistema.',
      details: parsed.details || null
    };
  }
};

/**
 * Descarga un reporte generado (PDF o Excel)
 * Según la API, el reporte viene en result_data del comando, no hay endpoint separado de descarga
 * @param {number|object} commandIdOrData - ID del comando o datos del comando completo
 * @param {string} format - Formato de descarga ('pdf' o 'excel')
 * @returns {Promise} Resultado de la descarga
 */
export const downloadReport = async (commandIdOrData, format = 'pdf') => {
  try {
    devLog(`📥 Iniciando descarga: target=${JSON.stringify(commandIdOrData)}, Format=${format}`);

    let reportData;
    
    // Si recibimos un objeto con result_data, usarlo directamente
    if (typeof commandIdOrData === 'object' && commandIdOrData.result_data) {
      reportData = commandIdOrData;
    } else {
      // Si recibimos solo el ID, obtener los detalles del comando
      const detailsResponse = await getCommandDetails(commandIdOrData);
      if (!detailsResponse.success) {
        throw new Error(detailsResponse.error || 'No se pudo obtener los detalles del comando');
      }
      reportData = detailsResponse.data;
    }

    // Validar que tengamos los datos del reporte
    if (!reportData.result_data || !reportData.result_data.data) {
      throw new Error('El comando no tiene datos de reporte disponibles');
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    const commandId = reportData.id || 'reporte';
    const filename = `reporte_${commandId}_${timestamp}.${format === 'excel' ? 'xlsx' : 'pdf'}`;

    if (format === 'pdf') {
      // Generar PDF usando la biblioteca jsPDF
      await generatePDF(reportData.result_data, filename);
    } else if (format === 'excel') {
      // Generar Excel usando la biblioteca xlsx
      await generateExcel(reportData.result_data, filename);
    }

    devLog(`✅ Archivo descargado: ${filename}`);
    
    return {
      success: true,
      filename
    };
  } catch (error) {
    devLog('❌ Error descargando reporte:', error);
    const parsed = parseApiError(error);
    
    return {
      success: false,
      error: parsed.message || 'No se pudo descargar el reporte.',
      details: parsed.details || error.message
    };
  }
};

/**
 * Genera un PDF a partir de los datos del reporte
 * @private
 */
const generatePDF = async (reportData, filename) => {
  try {
    devLog('🔍 Iniciando generación de PDF...');
    devLog('📊 Datos recibidos:', reportData);
    
    // Importación dinámica de jsPDF
    devLog('📦 Importando jsPDF...');
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.jsPDF || jsPDFModule.default?.jsPDF || jsPDFModule.default;
    
    if (!jsPDF) {
      throw new Error('No se pudo cargar jsPDF');
    }
    
    devLog('📦 Importando jspdf-autotable...');
    // Importar autoTable - esto registra el plugin automáticamente
    const autoTableModule = await import('jspdf-autotable');
    const autoTable = autoTableModule.default;
    
    devLog('📄 Creando documento PDF...');
    const doc = new jsPDF();
    
    const data = reportData.data;
    const reportInfo = reportData.report_info;
    
    if (!data) {
      throw new Error('No hay datos disponibles en el reporte');
    }
    
    devLog('✏️ Añadiendo título...');
    // Título
    doc.setFontSize(16);
    doc.text(data.title || 'Reporte', 14, 20);
    
    // Subtítulo
    if (data.subtitle) {
      doc.setFontSize(10);
      doc.text(data.subtitle, 14, 28);
    }
    
    // Información del reporte
    let yPos = data.subtitle ? 35 : 28;
    doc.setFontSize(9);
    if (reportInfo?.generated_at) {
      doc.text(`Generado: ${new Date(reportInfo.generated_at).toLocaleString()}`, 14, yPos);
      yPos += 5;
    }
    if (reportInfo?.generated_by) {
      doc.text(`Por: ${reportInfo.generated_by}`, 14, yPos);
      yPos += 5;
    }
    
    devLog('📊 Añadiendo tabla de datos...');
    // Tabla de datos - LIMITAR PDF A 100 REGISTROS para evitar archivos muy pesados
    if (data.headers && data.rows) {
      const PDF_MAX_ROWS = 100;
      const totalRows = data.rows.length;
      const limitedRows = data.rows.slice(0, PDF_MAX_ROWS);
      
      devLog(`📋 Total de registros: ${totalRows}, Mostrando en PDF: ${limitedRows.length}`);
      
      const tableOptions = {
        startY: yPos + 5,
        head: [data.headers],
        body: limitedRows,  // Solo los primeros 100 registros
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [59, 130, 246] }
      };
      
      // Intentar usar doc.autoTable primero, si no está disponible usar autoTable(doc, ...)
      if (typeof doc.autoTable === 'function') {
        devLog('✅ Usando doc.autoTable');
        doc.autoTable(tableOptions);
      } else if (typeof autoTable === 'function') {
        devLog('✅ Usando autoTable(doc, options)');
        autoTable(doc, tableOptions);
      } else {
        throw new Error('autoTable no está disponible');
      }
      
      const finalY = doc.lastAutoTable?.finalY || doc.previousAutoTable?.finalY || yPos + 50;
      
      // Mensaje si hay más registros de los mostrados
      if (totalRows > PDF_MAX_ROWS) {
        doc.setFontSize(9);
        doc.setTextColor(200, 0, 0); // Rojo
        doc.setFont(undefined, 'italic');
        doc.text(
          `⚠️ Mostrando ${PDF_MAX_ROWS} de ${totalRows} registros. Descarga en Excel para ver todos.`,
          14,
          finalY + 10
        );
        doc.setTextColor(0, 0, 0); // Reset a negro
        doc.setFont(undefined, 'normal');
      }
      
      // Totales si existen
      if (data.totals && Object.keys(data.totals).length > 0) {
        const totalsY = totalRows > PDF_MAX_ROWS ? finalY + 20 : finalY + 10;
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Totales:', 14, totalsY);
        
        doc.setFont(undefined, 'normal');
        doc.setFontSize(9);
        let totalsYPos = totalsY + 5;
        Object.entries(data.totals).forEach(([key, value]) => {
          doc.text(`${key}: ${value}`, 14, totalsYPos);
          totalsYPos += 5;
        });
      }
    }
    
    // Descargar
    devLog(`💾 Guardando PDF: ${filename}`);
    doc.save(filename);
    devLog('✅ PDF generado y descargado exitosamente');
  } catch (error) {
    devLog('❌ Error generando PDF:', error);
    console.error('Error detallado en generatePDF:', error);
    console.error('Stack:', error.stack);
    throw new Error(`Error al generar PDF: ${error.message}`);
  }
};

/**
 * Genera un Excel a partir de los datos del reporte
 * IMPORTANTE: Excel incluye TODOS los registros sin límite (a diferencia del PDF que tiene límite de 100)
 * @private
 */
const generateExcel = async (reportData, filename) => {
  try {
    devLog('🔍 Iniciando generación de Excel...');
    devLog('📊 Datos recibidos:', reportData);
    
    // Importación dinámica de xlsx
    devLog('📦 Importando xlsx...');
    const XLSX = await import('xlsx');
    
    const data = reportData.data;
    const reportInfo = reportData.report_info;
    
    const totalRows = data.rows?.length || 0;
    devLog(`📝 Preparando datos para Excel... Total de registros: ${totalRows}`);
    
    // Crear array de datos para el Excel
    const excelData = [];
    
    // Agregar título y metadata
    excelData.push([data.title || 'Reporte']);
    if (data.subtitle) {
      excelData.push([data.subtitle]);
    }
    excelData.push([]);
    
    if (reportInfo?.generated_at) {
      excelData.push(['Generado:', new Date(reportInfo.generated_at).toLocaleString()]);
    }
    if (reportInfo?.generated_by) {
      excelData.push(['Por:', reportInfo.generated_by]);
    }
    excelData.push([]);
    
    // Agregar headers y datos - TODOS LOS REGISTROS (sin límite)
    if (data.headers && data.rows) {
      excelData.push(data.headers);
      // Excel incluye TODAS las filas, sin importar la cantidad
      data.rows.forEach(row => excelData.push(row));
      
      devLog(`✅ Se agregaron ${data.rows.length} registros al Excel`);
      
      // Agregar totales
      if (data.totals && Object.keys(data.totals).length > 0) {
        excelData.push([]);
        excelData.push(['TOTALES']);
        Object.entries(data.totals).forEach(([key, value]) => {
          excelData.push([key, value]);
        });
      }
    }
    
    devLog('📊 Creando workbook...');
    // Crear workbook y worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(excelData);
    
    // Ajustar anchos de columna
    if (data.headers) {
      const colWidths = data.headers.map(() => ({ wch: 15 }));
      ws['!cols'] = colWidths;
    }
    
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    
    // Descargar
    devLog(`💾 Guardando Excel: ${filename}`);
    XLSX.writeFile(wb, filename);
    devLog('✅ Excel generado y descargado exitosamente');
  } catch (error) {
    devLog('❌ Error generando Excel:', error);
    console.error('Error detallado en generateExcel:', error);
    throw new Error(`Error al generar Excel: ${error.message}`);
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
