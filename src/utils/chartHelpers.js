/**
 * Utilidades para preparar datos para gráficos
 * Funciones helper para Recharts y otros
 */

/**
 * Colores para los gráficos del dashboard
 */
export const CHART_COLORS = {
  predictions: {
    '7d': '#3B82F6',   // Azul
    '14d': '#8B5CF6',  // Morado
    '30d': '#10B981',  // Verde
    '90d': '#F59E0B',  // Naranja
    historical: '#6B7280', // Gris
  },
  alerts: {
    CRITICAL: '#EF4444',  // Rojo
    WARNING: '#F59E0B',   // Amarillo/Naranja
    CAUTION: '#F97316',   // Naranja
    OK: '#10B981',        // Verde
  },
  trends: {
    positive: '#10B981',  // Verde
    negative: '#EF4444',  // Rojo
    stable: '#6B7280',    // Gris
  },
  categories: [
    '#3B82F6', // Azul
    '#8B5CF6', // Morado
    '#10B981', // Verde
    '#F59E0B', // Naranja
    '#EF4444', // Rojo
    '#06B6D4', // Cyan
    '#EC4899', // Rosa
    '#84CC16', // Lima
  ],
};

/**
 * Prepara datos para gráfico de líneas (predicciones)
 * @param {Array} predictions - Array de predicciones del backend
 * @param {string} valueKey - Key del valor (default: 'value')
 * @returns {Array} Datos formateados para Recharts
 */
export const prepareLineChartData = (predictions, valueKey = 'value') => {
  if (!Array.isArray(predictions) || predictions.length === 0) {
    return [];
  }

  return predictions.map(item => ({
    date: item.date,
    value: item[valueKey] || item.predicted_sales || item.total_sales || 0,
    lower: item.lower_bound || null,
    upper: item.upper_bound || null,
    label: item.day_name || item.date,
  }));
};

/**
 * Prepara datos para gráfico de barras
 * @param {Array} data - Array de datos
 * @param {string} nameKey - Key del nombre
 * @param {string} valueKey - Key del valor
 * @returns {Array} Datos formateados para Recharts
 */
export const prepareBarChartData = (data, nameKey = 'name', valueKey = 'value') => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  return data.map(item => ({
    name: item[nameKey],
    value: item[valueKey] || 0,
    color: item.color || CHART_COLORS.categories[0],
  }));
};

/**
 * Prepara datos para gráfico de dona/pie
 * @param {Array} data - Array de datos
 * @param {string} nameKey - Key del nombre
 * @param {string} valueKey - Key del valor
 * @returns {Array} Datos formateados para Recharts
 */
export const prepareDoughnutData = (data, nameKey = 'name', valueKey = 'value') => {
  if (!Array.isArray(data) || data.length === 0) {
    return [];
  }

  return data.map((item, index) => ({
    name: item[nameKey],
    value: item[valueKey] || 0,
    color: CHART_COLORS.categories[index % CHART_COLORS.categories.length],
    percentage: 0, // Se calculará después
  })).map(item => {
    const total = data.reduce((sum, d) => sum + (d[valueKey] || 0), 0);
    return {
      ...item,
      percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0,
    };
  });
};

/**
 * Prepara datos comparativos (histórico vs predicción)
 * @param {Object} data - Objeto con historical_data y predictions
 * @returns {Array} Datos combinados para gráfico
 */
export const prepareComposedChartData = (data) => {
  const { historical_data, predictions_7d, predictions_14d, predictions_30d, predictions_90d } = data;

  const result = [];

  // Agregar datos históricos
  if (historical_data && historical_data.dates && historical_data.values) {
    historical_data.dates.forEach((date, index) => {
      result.push({
        date,
        historical: historical_data.values[index],
        type: 'historical',
      });
    });
  }

  // Agregar predicciones (tomamos la de 30d como principal)
  if (predictions_30d && predictions_30d.daily_predictions) {
    predictions_30d.daily_predictions.forEach(pred => {
      result.push({
        date: pred.date,
        prediction: pred.value,
        lower: pred.lower_bound,
        upper: pred.upper_bound,
        type: 'prediction',
      });
    });
  }

  return result;
};

/**
 * Prepara datos para comparar múltiples períodos
 * @param {Object} data - Objeto con predictions_7d, 14d, 30d, 90d
 * @returns {Array} Array con totales por período
 */
export const preparePeriodComparisonData = (data) => {
  const periods = [
    { key: 'predictions_7d', label: '7 días', color: CHART_COLORS.predictions['7d'] },
    { key: 'predictions_14d', label: '14 días', color: CHART_COLORS.predictions['14d'] },
    { key: 'predictions_30d', label: '30 días', color: CHART_COLORS.predictions['30d'] },
    { key: 'predictions_90d', label: '90 días', color: CHART_COLORS.predictions['90d'] },
  ];

  return periods.map(period => ({
    period: period.label,
    value: data[period.key]?.summary?.total_sales || 0,
    average: data[period.key]?.summary?.average_daily || 0,
    growth: data[period.key]?.summary?.growth_rate || 0,
    color: period.color,
  }));
};

/**
 * Obtiene configuración de color según nivel de alerta
 * @param {string} level - Nivel de alerta (CRITICAL, WARNING, CAUTION, OK)
 * @returns {string} Color hexadecimal
 */
export const getAlertColor = (level) => {
  return CHART_COLORS.alerts[level] || CHART_COLORS.alerts.OK;
};

/**
 * Obtiene configuración de color según tendencia
 * @param {string} trend - Tendencia (growing, declining, stable)
 * @returns {string} Color hexadecimal
 */
export const getTrendColor = (trend) => {
  if (trend === 'growing' || trend === 'positive') return CHART_COLORS.trends.positive;
  if (trend === 'declining' || trend === 'negative') return CHART_COLORS.trends.negative;
  return CHART_COLORS.trends.stable;
};

/**
 * Calcula el cambio porcentual entre dos valores
 * @param {number} current - Valor actual
 * @param {number} previous - Valor anterior
 * @returns {number} Cambio porcentual
 */
export const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Formatea datos de top productos para gráfico de barras
 * @param {Array} products - Array de productos del backend
 * @returns {Array} Datos formateados
 */
export const prepareTopProductsData = (products) => {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }

  return products.slice(0, 10).map((product, index) => ({
    name: product.product_name || product.product__name || 'Producto',
    value: product.total_sold || product.predicted_units || 0,
    revenue: product.revenue || product.predicted_revenue || 0,
    color: CHART_COLORS.categories[index % CHART_COLORS.categories.length],
  }));
};

/**
 * Prepara datos de tendencia de ventas (últimos 7 días)
 * @param {Array} salesTrend - Array de ventas por día
 * @returns {Array} Datos formateados
 */
export const prepareSalesTrendData = (salesTrend) => {
  if (!Array.isArray(salesTrend) || salesTrend.length === 0) {
    return [];
  }

  return salesTrend.map(day => ({
    date: day.date,
    day_name: day.day_name,
    sales: day.total_sales || 0,
    orders: day.order_count || 0,
    label: new Date(day.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
  }));
};

/**
 * Calcula el máximo y mínimo de un dataset para escala del gráfico
 * @param {Array} data - Array de datos
 * @param {string} key - Key del valor
 * @returns {Object} { min, max, domain }
 */
export const calculateChartDomain = (data, key = 'value') => {
  if (!Array.isArray(data) || data.length === 0) {
    return { min: 0, max: 100, domain: [0, 100] };
  }

  const values = data.map(d => d[key]).filter(v => v !== null && v !== undefined);
  const min = Math.min(...values);
  const max = Math.max(...values);

  // Agregar padding del 10%
  const padding = (max - min) * 0.1;

  return {
    min: Math.floor(min - padding),
    max: Math.ceil(max + padding),
    domain: [Math.floor(min - padding), Math.ceil(max + padding)],
  };
};

/**
 * Genera gradiente para área de confianza en gráficos
 * @param {string} color - Color base
 * @returns {Object} Configuración de gradiente
 */
export const generateGradient = (color) => {
  return {
    id: `gradient-${color.replace('#', '')}`,
    color: color,
    opacity: 0.1,
  };
};

/**
 * Formatea tooltip personalizado para gráficos
 * @param {Object} payload - Datos del tooltip de Recharts
 * @param {Function} formatter - Función de formateo personalizada
 * @returns {string} HTML del tooltip
 */
export const formatChartTooltip = (payload, formatter = null) => {
  if (!payload || !Array.isArray(payload) || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;
  
  if (formatter) {
    return formatter(data);
  }

  return data;
};
