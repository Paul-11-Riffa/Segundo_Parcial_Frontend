import PropTypes from 'prop-types';
import {
  AreaChart,
  Area,
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
 * Componente de gráfico de área para mostrar tendencias con relleno
 * Ideal para mostrar intervalos de confianza, rangos, acumulados
 * 
 * @example
 * <AreaChartComponent
 *   data={confidenceData}
 *   areas={[
 *     { dataKey: 'min', name: 'Mínimo', color: '#EF4444', fillOpacity: 0.2 },
 *     { dataKey: 'promedio', name: 'Promedio', color: '#3B82F6', fillOpacity: 0.6 },
 *     { dataKey: 'max', name: 'Máximo', color: '#10B981', fillOpacity: 0.2 }
 *   ]}
 *   xAxisKey="fecha"
 *   height={400}
 *   stacked
 * />
 */
const AreaChartComponent = ({
  data = [],
  areas = [],
  xAxisKey = 'date',
  height = 350,
  formatValue = 'number',
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  currency = 'USD',
  stacked = false,
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
        <AreaChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          stackOffset={stacked ? 'none' : 'none'}
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
              iconType="rect"
            />
          )}
          
          {areas.map((area, index) => (
            <Area
              key={index}
              type="monotone"
              dataKey={area.dataKey}
              name={area.name || area.dataKey}
              stackId={stacked ? '1' : undefined}
              stroke={area.color || CHART_COLORS.predictions['30d']}
              fill={area.color || CHART_COLORS.predictions['30d']}
              fillOpacity={area.fillOpacity || 0.6}
              strokeWidth={area.strokeWidth || 2}
              animationDuration={800}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

AreaChartComponent.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  areas: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      name: PropTypes.string,
      color: PropTypes.string,
      fillOpacity: PropTypes.number,
      strokeWidth: PropTypes.number,
    })
  ).isRequired,
  xAxisKey: PropTypes.string,
  height: PropTypes.number,
  formatValue: PropTypes.oneOf(['currency', 'number', 'compact']),
  showGrid: PropTypes.bool,
  showLegend: PropTypes.bool,
  showTooltip: PropTypes.bool,
  currency: PropTypes.string,
  stacked: PropTypes.bool,
  className: PropTypes.string,
};

export default AreaChartComponent;
