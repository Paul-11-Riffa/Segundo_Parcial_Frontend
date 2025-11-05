import PropTypes from 'prop-types';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CHART_COLORS } from '../../utils/chartHelpers';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';
import '../dashboard/dashboard.css';

/**
 * Componente de gráfico circular (Pie/Donut) para mostrar distribución
 * Ideal para mostrar porcentajes, categorías, composición
 * 
 * @example
 * <PieChartComponent
 *   data={[
 *     { name: 'Electrónica', value: 45000, color: '#3B82F6' },
 *     { name: 'Ropa', value: 32000, color: '#10B981' },
 *     { name: 'Alimentos', value: 28000, color: '#F59E0B' }
 *   ]}
 *   nameKey="name"
 *   valueKey="value"
 *   height={400}
 *   formatValue="currency"
 *   innerRadius={60}
 * />
 */
const PieChartComponent = ({
  data = [],
  nameKey = 'name',
  valueKey = 'value',
  height = 350,
  formatValue = 'number',
  showLegend = true,
  showTooltip = true,
  showLabels = true,
  showPercentage = true,
  currency = 'USD',
  innerRadius = 0, // 0 = Pie, >0 = Donut
  outerRadius = 100,
  colors = null, // Array de colores personalizados
  className = '',
}) => {
  /**
   * Colores por defecto si no se especifican
   */
  const defaultColors = [
    CHART_COLORS.predictions['7d'],
    CHART_COLORS.predictions['14d'],
    CHART_COLORS.predictions['30d'],
    CHART_COLORS.predictions['90d'],
    CHART_COLORS.alerts.WARNING,
    CHART_COLORS.alerts.CRITICAL,
    '#8B5CF6',
    '#EC4899',
    '#14B8A6',
    '#F97316',
  ];

  const chartColors = colors || defaultColors;

  /**
   * Calcula el total para porcentajes
   */
  const total = data.reduce((sum, entry) => sum + (entry[valueKey] || 0), 0);

  /**
   * Formatea el valor según el tipo
   */
  const formatDisplayValue = (value) => {
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
   * Renderiza las etiquetas personalizadas
   */
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius: ir,
    outerRadius: or,
    percent,
    index,
  }) => {
    if (!showLabels) return null;

    const RADIAN = Math.PI / 180;
    const radius = or + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Solo mostrar si el porcentaje es mayor al 3%
    if (percent < 0.03) return null;

    return (
      <text
        x={x}
        y={y}
        fill="#374151"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        style={{ fontSize: '12px', fontWeight: '500' }}
      >
        {showPercentage ? formatPercent(percent, true) : data[index][nameKey]}
      </text>
    );
  };

  /**
   * Tooltip personalizado
   */
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;

    const entry = payload[0];
    const percentage = (entry.value / total) * 100;

    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">
          {entry.name}
        </p>
        <div className="chart-tooltip-body">
          <div className="chart-tooltip-item">
            <span className="chart-tooltip-item-label">Valor:</span>
            <span className="chart-tooltip-value" style={{ color: entry.payload.fill }}>
              {formatDisplayValue(entry.value)}
            </span>
          </div>
          <div className="chart-tooltip-item">
            <span className="chart-tooltip-item-label">Porcentaje:</span>
            <span className="chart-tooltip-value" style={{ color: entry.payload.fill }}>
              {formatPercent(percentage / 100, true)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Renderiza leyenda personalizada
   */
  const renderLegend = (props) => {
    const { payload } = props;
    
    return (
      <div className="chart-legend">
        {payload.map((entry, index) => {
          const percentage = (data[index][valueKey] / total) * 100;
          return (
            <div key={`legend-${index}`} className="chart-legend-item">
              <span
                className="chart-legend-indicator chart-legend-indicator-square"
                style={{ backgroundColor: entry.color }}
              />
              <span className="chart-legend-text">
                {entry.value} ({percentage.toFixed(1)}%)
              </span>
            </div>
          );
        })}
      </div>
    );
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
        <PieChart>
          <Pie
            data={data}
            dataKey={valueKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            label={renderCustomLabel}
            labelLine={showLabels}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color || chartColors[index % chartColors.length]}
              />
            ))}
          </Pie>
          
          {showTooltip && (
            <Tooltip content={<CustomTooltip />} />
          )}
          
          {showLegend && (
            <Legend content={renderLegend} />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

PieChartComponent.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  nameKey: PropTypes.string,
  valueKey: PropTypes.string,
  height: PropTypes.number,
  formatValue: PropTypes.oneOf(['currency', 'number', 'compact']),
  showLegend: PropTypes.bool,
  showTooltip: PropTypes.bool,
  showLabels: PropTypes.bool,
  showPercentage: PropTypes.bool,
  currency: PropTypes.string,
  innerRadius: PropTypes.number,
  outerRadius: PropTypes.number,
  colors: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
};

export default PieChartComponent;
