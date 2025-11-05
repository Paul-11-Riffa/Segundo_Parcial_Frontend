/**
 * Utilidades para alertas de stock
 * Funciones helper para trabajar con alertas de inventario
 */

import { CHART_COLORS } from './chartHelpers';

/**
 * Obtiene el color según el nivel de alerta
 * @param {string} level - Nivel (CRITICAL, WARNING, CAUTION, OK)
 * @returns {string} Color hexadecimal
 */
export const getAlertColor = (level) => {
  const colors = {
    CRITICAL: CHART_COLORS.alerts.CRITICAL,
    WARNING: CHART_COLORS.alerts.WARNING,
    CAUTION: CHART_COLORS.alerts.CAUTION,
    OK: CHART_COLORS.alerts.OK,
  };

  return colors[level] || colors.OK;
};

/**
 * Obtiene el ícono según el nivel de alerta
 * @param {string} level - Nivel de alerta
 * @returns {string} Emoji del ícono
 */
export const getAlertIcon = (level) => {
  const icons = {
    CRITICAL: '🔴',
    WARNING: '⚠️',
    CAUTION: '⚡',
    OK: '✅',
  };

  return icons[level] || icons.OK;
};

/**
 * Obtiene el texto descriptivo del nivel de alerta
 * @param {string} level - Nivel de alerta
 * @returns {string} Texto descriptivo
 */
export const getAlertLevelText = (level) => {
  const texts = {
    CRITICAL: 'Crítico',
    WARNING: 'Advertencia',
    CAUTION: 'Precaución',
    OK: 'Normal',
  };

  return texts[level] || texts.OK;
};

/**
 * Genera un mensaje personalizado según la alerta
 * @param {Object} alert - Objeto de alerta del backend
 * @returns {string} Mensaje formateado
 */
export const getAlertMessage = (alert) => {
  if (!alert) return '';

  const { alert_level, product_name, days_until_stockout, current_stock } = alert;

  if (alert_level === 'CRITICAL') {
    return `🔴 Stock crítico - "${product_name}" se agotará en ${days_until_stockout} día${days_until_stockout !== 1 ? 's' : ''}. Reposición URGENTE requerida.`;
  }

  if (alert_level === 'WARNING') {
    return `⚠️ Advertencia - "${product_name}" tiene stock bajo (${current_stock} unidades). Se agotará en ${days_until_stockout} día${days_until_stockout !== 1 ? 's' : ''}.`;
  }

  if (alert_level === 'CAUTION') {
    return `⚡ Precaución - Monitorear el stock de "${product_name}". Stock actual: ${current_stock} unidades.`;
  }

  return `✅ Stock suficiente para "${product_name}".`;
};

/**
 * Ordena alertas por prioridad (CRITICAL > WARNING > CAUTION > OK)
 * @param {Array} alerts - Array de alertas
 * @returns {Array} Alertas ordenadas
 */
export const sortAlertsByPriority = (alerts) => {
  if (!Array.isArray(alerts) || alerts.length === 0) {
    return [];
  }

  const priority = {
    CRITICAL: 1,
    WARNING: 2,
    CAUTION: 3,
    OK: 4,
  };

  return [...alerts].sort((a, b) => {
    const priorityA = priority[a.alert_level] || 5;
    const priorityB = priority[b.alert_level] || 5;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Si tienen la misma prioridad, ordenar por días hasta agotarse
    return (a.days_until_stockout || 999) - (b.days_until_stockout || 999);
  });
};

/**
 * Filtra alertas por nivel
 * @param {Array} alerts - Array de alertas
 * @param {string|Array} levels - Nivel(es) a filtrar
 * @returns {Array} Alertas filtradas
 */
export const filterAlertsByLevel = (alerts, levels) => {
  if (!Array.isArray(alerts) || alerts.length === 0) {
    return [];
  }

  const levelsArray = Array.isArray(levels) ? levels : [levels];

  return alerts.filter(alert => levelsArray.includes(alert.alert_level));
};

/**
 * Cuenta alertas por nivel
 * @param {Array} alerts - Array de alertas
 * @returns {Object} Conteo por nivel { CRITICAL: 3, WARNING: 5, ... }
 */
export const countAlertsByLevel = (alerts) => {
  if (!Array.isArray(alerts) || alerts.length === 0) {
    return {
      CRITICAL: 0,
      WARNING: 0,
      CAUTION: 0,
      OK: 0,
    };
  }

  return alerts.reduce((acc, alert) => {
    const level = alert.alert_level || 'OK';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {
    CRITICAL: 0,
    WARNING: 0,
    CAUTION: 0,
    OK: 0,
  });
};

/**
 * Obtiene el badge de prioridad para UI
 * @param {string} level - Nivel de alerta
 * @returns {Object} { color, bgColor, text }
 */
export const getAlertBadge = (level) => {
  const badges = {
    CRITICAL: {
      color: '#FFFFFF',
      bgColor: '#EF4444',
      borderColor: '#DC2626',
      text: 'Crítico',
      icon: '🔴',
    },
    WARNING: {
      color: '#78350F',
      bgColor: '#FEF3C7',
      borderColor: '#F59E0B',
      text: 'Advertencia',
      icon: '⚠️',
    },
    CAUTION: {
      color: '#7C2D12',
      bgColor: '#FED7AA',
      borderColor: '#F97316',
      text: 'Precaución',
      icon: '⚡',
    },
    OK: {
      color: '#14532D',
      bgColor: '#D1FAE5',
      borderColor: '#10B981',
      text: 'Normal',
      icon: '✅',
    },
  };

  return badges[level] || badges.OK;
};

/**
 * Calcula la urgencia de la alerta (0-100)
 * @param {Object} alert - Objeto de alerta
 * @returns {number} Score de urgencia (0-100)
 */
export const calculateAlertUrgency = (alert) => {
  if (!alert) return 0;

  const { alert_level, days_until_stockout, current_stock } = alert;

  let urgency = 0;

  // Puntuación por nivel
  if (alert_level === 'CRITICAL') urgency += 70;
  else if (alert_level === 'WARNING') urgency += 50;
  else if (alert_level === 'CAUTION') urgency += 30;
  else urgency += 10;

  // Puntuación por días hasta agotarse
  if (days_until_stockout <= 2) urgency += 30;
  else if (days_until_stockout <= 7) urgency += 20;
  else if (days_until_stockout <= 14) urgency += 10;

  // Penalización si el stock actual es 0
  if (current_stock === 0) urgency = 100;

  return Math.min(urgency, 100);
};

/**
 * Sugiere una acción según la alerta
 * @param {Object} alert - Objeto de alerta
 * @returns {string} Acción sugerida
 */
export const suggestAction = (alert) => {
  if (!alert) return 'Sin acción necesaria';

  const { alert_level, recommended_reorder_quantity } = alert;

  if (alert_level === 'CRITICAL') {
    return `Generar orden de compra URGENTE por ${recommended_reorder_quantity || 'N/A'} unidades`;
  }

  if (alert_level === 'WARNING') {
    return `Planificar orden de compra por ${recommended_reorder_quantity || 'N/A'} unidades`;
  }

  if (alert_level === 'CAUTION') {
    return 'Monitorear stock en los próximos días';
  }

  return 'Sin acción necesaria';
};

/**
 * Formatea el resumen de alertas para dashboard
 * @param {Object} summary - Objeto summary del backend
 * @returns {Array} Array con datos formateados para cards
 */
export const formatAlertSummary = (summary) => {
  if (!summary) {
    return [];
  }

  return [
    {
      level: 'CRITICAL',
      count: summary.critical_alerts || 0,
      label: 'Críticas',
      ...getAlertBadge('CRITICAL'),
    },
    {
      level: 'WARNING',
      count: summary.warning_alerts || 0,
      label: 'Advertencias',
      ...getAlertBadge('WARNING'),
    },
    {
      level: 'CAUTION',
      count: summary.caution_alerts || 0,
      label: 'Precauciones',
      ...getAlertBadge('CAUTION'),
    },
  ];
};

/**
 * Verifica si hay alertas urgentes
 * @param {Array} alerts - Array de alertas
 * @returns {boolean} True si hay alertas CRITICAL o WARNING
 */
export const hasUrgentAlerts = (alerts) => {
  if (!Array.isArray(alerts) || alerts.length === 0) {
    return false;
  }

  return alerts.some(alert => 
    alert.alert_level === 'CRITICAL' || alert.alert_level === 'WARNING'
  );
};

/**
 * Obtiene el total de productos afectados
 * @param {Array} alerts - Array de alertas
 * @returns {number} Número de productos únicos con alertas
 */
export const getTotalAffectedProducts = (alerts) => {
  if (!Array.isArray(alerts) || alerts.length === 0) {
    return 0;
  }

  const uniqueProducts = new Set(alerts.map(alert => alert.product_id));
  return uniqueProducts.size;
};
