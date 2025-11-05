import PropTypes from 'prop-types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '../../utils/chartHelpers';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';
import '../dashboard/dashboard.css';

/**
 * Componente de gráfico de líneas para mostrar tendencias y predicciones
 * Ideal para visualizar ventas, predicciones ML y series temporales
 * 
 * @example
 * <LineChartComponent
 *   data={salesData}
 *   lines={[
 *     { dataKey: 'ventas', name: 'Ventas', color: '#3B82F6' },
 *     { dataKey: 'prediccion', name: 'Predicción', color: '#10B981', strokeDasharray: '5 5' }
 *   ]}
 *   xAxisKey="fecha"
 *   height={400}
 *   formatValue="currency"
 * />
 */
const LineChartComponent = ({
  data = [],
  lines = [],
  xAxisKey = 'date',
  height = 350,
  formatValue = 'number',
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  currency = 'USD',
  className = '',
}) => {
  /**
   * Formatea el valor según el tipo especificado
   */
  const formatYAxis = (value) => {
    if (formatValue === 'currency') {
      return formatCurrency(value, currency);
    }
    if (formatValue === 'number') {
      return formatNumber(value, 0);
    }
    if (formatValue === 'compact') {
      // Formato compacto: 1.2M, 500K
      if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
      return value.toString();
    }
    return value;
  };

  /**
   * Formatea el tooltip personalizado
   */
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">
          {formatDate(label, 'medium')}
        </p>
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

  // Si no hay datos, mostrar mensaje
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
        <LineChart
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
          
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name || line.dataKey}
              stroke={line.color || CHART_COLORS.predictions['30d']}
              strokeWidth={line.strokeWidth || 2}
              strokeDasharray={line.strokeDasharray || '0'}
              dot={line.showDots !== false ? { fill: line.color, r: 4 } : false}
              activeDot={line.showDots !== false ? { r: 6 } : false}
              animationDuration={800}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

LineChartComponent.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  lines: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      name: PropTypes.string,
      color: PropTypes.string,
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
  className: PropTypes.string,
};

export default LineChartComponent;
