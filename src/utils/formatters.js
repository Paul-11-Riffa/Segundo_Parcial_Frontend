/**
 * Utilidades para formatear datos
 * Funciones para formatear moneda, números, fechas, porcentajes, etc.
 */

/**
 * Formatea un número como moneda (USD)
 * @param {number} value - Valor a formatear
 * @param {string} currency - Código de moneda (default: 'USD')
 * @returns {string} Valor formateado (ej: "$1,234.56")
 */
export const formatCurrency = (value, currency = 'USD') => {
  if (value === null || value === undefined || isNaN(value)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

/**
 * Formatea un número con separadores de miles
 * @param {number} value - Valor a formatear
 * @param {number} decimals - Número de decimales (default: 0)
 * @returns {string} Número formateado (ej: "1,234")
 */
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Formatea un porcentaje
 * @param {number} value - Valor a formatear (0-100 o 0-1)
 * @param {boolean} isDecimal - Si el valor está en decimal (0-1)
 * @param {number} decimals - Número de decimales (default: 1)
 * @returns {string} Porcentaje formateado (ej: "12.5%")
 */
export const formatPercent = (value, isDecimal = false, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0%';
  }

  const actualValue = isDecimal ? value * 100 : value;
  return `${actualValue.toFixed(decimals)}%`;
};

/**
 * Formatea una fecha en formato legible
 * @param {string|Date} date - Fecha a formatear
 * @param {string} format - Formato deseado ('short', 'long', 'relative')
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '-';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  if (format === 'relative') {
    return formatRelativeDate(dateObj);
  }

  const options = format === 'long'
    ? { year: 'numeric', month: 'long', day: 'numeric' }
    : { year: 'numeric', month: 'short', day: 'numeric' };

  return new Intl.DateTimeFormat('es-ES', options).format(dateObj);
};

/**
 * Formatea una fecha de manera relativa (hace X días)
 * @param {Date} date - Fecha a formatear
 * @returns {string} Fecha relativa (ej: "hace 2 días")
 */
export const formatRelativeDate = (date) => {
  const now = new Date();
  const diffInMs = now - date;
  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInSeconds < 60) return 'hace unos segundos';
  if (diffInMinutes < 60) return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  if (diffInHours < 24) return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  if (diffInDays < 7) return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  if (diffInDays < 30) return `hace ${Math.floor(diffInDays / 7)} semana${Math.floor(diffInDays / 7) > 1 ? 's' : ''}`;
  if (diffInDays < 365) return `hace ${Math.floor(diffInDays / 30)} mes${Math.floor(diffInDays / 30) > 1 ? 'es' : ''}`;
  return `hace ${Math.floor(diffInDays / 365)} año${Math.floor(diffInDays / 365) > 1 ? 's' : ''}`;
};

/**
 * Formatea una fecha con hora
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (date) => {
  if (!date) return '-';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
};

/**
 * Abrevia un número grande (ej: 1,234,567 -> 1.2M)
 * @param {number} value - Valor a abreviar
 * @param {number} decimals - Número de decimales (default: 1)
 * @returns {string} Número abreviado
 */
export const formatCompactNumber = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }

  const absValue = Math.abs(value);

  if (absValue >= 1000000000) {
    return (value / 1000000000).toFixed(decimals) + 'B';
  } else if (absValue >= 1000000) {
    return (value / 1000000).toFixed(decimals) + 'M';
  } else if (absValue >= 1000) {
    return (value / 1000).toFixed(decimals) + 'K';
  }

  return value.toString();
};

/**
 * Trunca un texto largo
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado con "..."
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitaliza la primera letra de un texto
 * @param {string} text - Texto a capitalizar
 * @returns {string} Texto capitalizado
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Obtiene el nombre del día de la semana
 * @param {string|Date} date - Fecha
 * @returns {string} Nombre del día (ej: "Lunes")
 */
export const getDayName = (date) => {
  if (!date) return '-';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('es-ES', { weekday: 'long' }).format(dateObj);
};

/**
 * Formatea un rango de fechas
 * @param {string|Date} startDate - Fecha inicial
 * @param {string|Date} endDate - Fecha final
 * @returns {string} Rango formateado (ej: "1 - 30 Nov 2024")
 */
export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '-';

  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return '-';
  }

  const startFormatted = formatDate(start, 'short');
  const endFormatted = formatDate(end, 'short');

  return `${startFormatted} - ${endFormatted}`;
};
