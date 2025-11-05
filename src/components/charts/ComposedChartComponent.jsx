import PropTypes from 'prop-types';
import {
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { CHART_COLORS } from '../../utils/chartHelpers';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';
import '../dashboard/dashboard.css';


/**
 * Componente de gráfico compuesto (barras + líneas + áreas)
 * Ideal para mostrar datos históricos con predicciones futuras
 * Combina múltiples tipos de visualización en un solo gráfico
 * 
 * @example
 * <ComposedChartComponent
 *   data={historicalAndPredictions}
 *   elements={[
 *     { type: 'bar', dataKey: 'ventas_reales', name: 'Ventas Reales', color: '#3B82F6' },
 *     { type: 'line', dataKey: 'prediccion', name: 'Predicción', color: '#10B981', strokeDasharray: '5 5' },
 *     { type: 'area', dataKey: 'confianza', name: 'Intervalo', color: '#10B981', fillOpacity: 0.2 }
 *   ]}
 *   xAxisKey="fecha"
 *   referenceLine="2024-01-15"
 *   height={400}
 * />
 */
const ComposedChartComponent = ({
  data = [],
  elements = [],
  xAxisKey = 'date',
  height = 350,
  formatValue = 'number',
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  currency = 'USD',
  referenceLine = null, // Línea de referencia vertical (ej: fecha actual)
  referenceLineLabel = 'Hoy',
  className = '',
}) => {
  /**
   * Formatea el valor del eje Y
   */
  const formatYAxis = (value) => {
    if (formatValue === 'currency') {
      return formatCurrency(value, currency);
    }
    if (formatValue === 'number') {
      return formatNumber(value, 0);
    }
    if (formatValue === 'compact') {
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
      return value.toString();
    }
    return value;
  };

  /**
   * Tooltip personalizado
   */
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    // Detectar si es una fecha futura (predicción)
    const isFuture = referenceLine && new Date(label) > new Date(referenceLine);

    return (
      <div className="chart-tooltip">
        <div className="chart-tooltip-header">
          <p className="chart-tooltip-label">
            {formatDate(label, 'medium')}
          </p>
          {isFuture && (
            <span className="chart-tooltip-badge">
              Predicción
            </span>
          )}
        </div>
        {payload.map((entry, index) => (
          <div key={index} className="chart-tooltip-item">
            <span
              className="chart-tooltip-item-label"
              style={{ color: entry.color }}
            >
              <span
                className="chart-tooltip-indicator"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}:
            </span>
            <span className="chart-tooltip-value" style={{ color: entry.color }}>
              {formatValue === 'currency'
                ? formatCurrency(entry.value, currency)
                : formatNumber(entry.value, 0)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  /**
   * Formatea el eje X (fechas)
   */
  const formatXAxis = (value) => {
    return formatDate(value, 'short');
  };

  /**
   * Renderiza el elemento según su tipo
   */
  const renderElement = (element, index) => {
    const {
      type,
      dataKey,
      name,
      color,
      fillOpacity,
      strokeWidth,
      strokeDasharray,
      showDots,
    } = element;

    const defaultColor = CHART_COLORS.predictions['30d'];

    switch (type) {
      case 'bar':
        return (
          <Bar
            key={index}
            dataKey={dataKey}
            name={name || dataKey}
            fill={color || defaultColor}
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          />
        );

      case 'line':
        return (
          <Line
            key={index}
            type="monotone"
            dataKey={dataKey}
            name={name || dataKey}
            stroke={color || defaultColor}
            strokeWidth={strokeWidth || 2}
            strokeDasharray={strokeDasharray || '0'}
            dot={showDots !== false ? { fill: color || defaultColor, r: 4 } : false}
            activeDot={showDots !== false ? { r: 6 } : false}
            animationDuration={800}
          />
        );

      case 'area':
        return (
          <Area
            key={index}
            type="monotone"
            dataKey={dataKey}
            name={name || dataKey}
            stroke={color || defaultColor}
            fill={color || defaultColor}
            fillOpacity={fillOpacity || 0.3}
            strokeWidth={strokeWidth || 2}
            animationDuration={800}
          />
        );

      default:
        return null;
    }
  };

  // Si no hay datos
  if (!data || data.length === 0) {
    return (
      <div className={`chart-empty ${className}`} style={{ height }}>
        <p className="chart-empty-text">No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          )}
          
          <XAxis
            dataKey={xAxisKey}
            tickFormatter={formatXAxis}
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          
          <YAxis
            tickFormatter={formatYAxis}
            stroke="#6B7280"
            style={{ fontSize: '12px' }}
          />
          
          {showTooltip && (
            <Tooltip content={<CustomTooltip />} />
          )}
          
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
              iconType="line"
            />
          )}
          
          {/* Línea de referencia (ej: separar histórico de predicciones) */}
          {referenceLine && (
            <ReferenceLine
              x={referenceLine}
              stroke="#9CA3AF"
              strokeDasharray="5 5"
              label={{
                value: referenceLineLabel,
                position: 'top',
                fill: '#6B7280',
                fontSize: 12,
              }}
            />
          )}
          
          {/* Renderizar todos los elementos (bars, lines, areas) */}
          {elements.map((element, index) => renderElement(element, index))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

ComposedChartComponent.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  elements: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['bar', 'line', 'area']).isRequired,
      dataKey: PropTypes.string.isRequired,
      name: PropTypes.string,
      color: PropTypes.string,
      fillOpacity: PropTypes.number,
      strokeWidth: PropTypes.number,
      strokeDasharray: PropTypes.string,
      showDots: PropTypes.bool,
    })
  ).isRequired,
  xAxisKey: PropTypes.string,
  height: PropTypes.number,
  formatValue: PropTypes.oneOf(['currency', 'number', 'compact']),
  showGrid: PropTypes.bool,
  showLegend: PropTypes.bool,
  showTooltip: PropTypes.bool,
  currency: PropTypes.string,
  referenceLine: PropTypes.string,
  referenceLineLabel: PropTypes.string,
  className: PropTypes.string,
};

export default ComposedChartComponent;
