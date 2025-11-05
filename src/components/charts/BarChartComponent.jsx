import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { CHART_COLORS } from '../../utils/chartHelpers';
import { formatCurrency, formatNumber } from '../../utils/formatters';
import '../dashboard/dashboard.css';

/**
 * Componente de gráfico de barras para comparaciones
 * Ideal para comparar categorías, productos, periodos
 * 
 * @example
 * <BarChartComponent
 *   data={categoryData}
 *   bars={[
 *     { dataKey: 'ventas', name: 'Ventas', color: '#3B82F6' },
 *     { dataKey: 'stock', name: 'Stock', color: '#10B981' }
 *   ]}
 *   xAxisKey="categoria"
 *   height={400}
 *   formatValue="currency"
 * />
 */
const BarChartComponent = ({
  data = [],
  bars = [],
  xAxisKey = 'name',
  height = 350,
  formatValue = 'number',
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  currency = 'USD',
  layout = 'vertical', // 'vertical' | 'horizontal'
  useCustomColors = false, // Si true, usa data[index].color para cada barra
  className = '',
}) => {
  /**
   * Formatea el valor según el tipo especificado
   */
  const formatAxisValue = (value) => {
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
   * Trunca etiquetas largas
   */
  const truncateLabel = (label, maxLength = 15) => {
    if (typeof label !== 'string') return label;
    return label.length > maxLength ? `${label.substring(0, maxLength)}...` : label;
  };

  /**
   * Tooltip personalizado
   */
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="chart-tooltip-item">
            <span
              className="chart-tooltip-item-label"
              style={{ color: entry.color }}
            >
              <span
                className="chart-tooltip-indicator chart-tooltip-indicator-square"
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

  // Si no hay datos
  if (!data || data.length === 0) {
    return (
      <div className={`chart-empty ${className}`} style={{ height }}>
        <p className="chart-empty-text">No hay datos para mostrar</p>
      </div>
    );
  }

  // Calcular el máximo valor para ajustar el dominio del eje
  let maxValue = 1; // Valor por defecto
  
  try {
    const values = data.map(item => 
      Math.max(...bars.map(bar => Number(item[bar.dataKey]) || 0))
    ).filter(v => !isNaN(v) && v > 0);
    
    if (values.length > 0) {
      maxValue = Math.max(...values);
    }
  } catch (error) {
    console.error('Error calculating maxValue:', error);
  }
  
  // Asegurar que el dominio superior sea al menos 5 para valores pequeños
  const upperBound = Math.max(Math.ceil(maxValue * 1.2), 5);
  const yAxisDomain = [0, upperBound];
  
  // 🔍 DEBUG
  console.log('📊 BarChart Debug:', {
    layout,
    dataLength: data.length,
    firstItem: data[0],
    bars,
    maxValue,
    upperBound,
    yAxisDomain,
    sampleValues: data.slice(0, 3).map(item => ({
      name: item.name,
      values: bars.map(bar => ({ 
        key: bar.dataKey, 
        value: item[bar.dataKey],
        type: typeof item[bar.dataKey]
      }))
    }))
  });

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          )}
          
          {layout === 'vertical' ? (
            <>
              <XAxis
                type="category"
                dataKey={xAxisKey}
                tickFormatter={(value) => truncateLabel(value)}
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                type="number"
                tickFormatter={formatAxisValue}
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                allowDataOverflow={false}
              />
            </>
          ) : (
            <>
              <XAxis
                type="number"
                tickFormatter={formatAxisValue}
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                domain={yAxisDomain}
              />
              <YAxis
                type="category"
                dataKey={xAxisKey}
                tickFormatter={(value) => truncateLabel(value)}
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                width={100}
              />
            </>
          )}
          
          {showTooltip && (
            <Tooltip content={<CustomTooltip />} />
          )}
          
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }}
              iconType="rect"
            />
          )}
          
          {bars.map((bar, barIndex) => {
            console.log(`🎨 Rendering Bar ${barIndex}:`, {
              dataKey: bar.dataKey,
              name: bar.name,
              color: bar.color,
              dataCount: data.length,
              firstDataPoint: data[0]?.[bar.dataKey]
            });
            
            return (
              <Bar
                key={barIndex}
                dataKey={bar.dataKey}
                name={bar.name || bar.dataKey}
                fill={bar.color || CHART_COLORS.predictions['30d']}
                radius={layout === 'vertical' ? [4, 4, 0, 0] : [0, 4, 4, 0]}
                animationDuration={800}
                minPointSize={5}
                isAnimationActive={true}
              >
                {useCustomColors && data.map((entry, index) => {
                  console.log(`  Cell ${index}:`, entry.name, '→', entry.color);
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color || bar.color} 
                    />
                  );
                })}
              
                {/* Agregar labels si bar.label es true */}
                {bar.label && (
                  <LabelList
                    dataKey={bar.dataKey}
                    position={layout === 'vertical' ? 'top' : 'right'}
                    formatter={(value) => formatAxisValue(value)}
                    style={{ fontSize: '12px', fontWeight: 'bold', fill: '#374151' }}
                  />
                )}
              </Bar>
            );
          })}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

BarChartComponent.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  bars: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string.isRequired,
      name: PropTypes.string,
      color: PropTypes.string,
      label: PropTypes.bool, // Nuevo: mostrar labels en las barras
    })
  ).isRequired,
  xAxisKey: PropTypes.string,
  height: PropTypes.number,
  formatValue: PropTypes.oneOf(['currency', 'number', 'compact']),
  showGrid: PropTypes.bool,
  showLegend: PropTypes.bool,
  showTooltip: PropTypes.bool,
  currency: PropTypes.string,
  layout: PropTypes.oneOf(['vertical', 'horizontal']),
  useCustomColors: PropTypes.bool,
  className: PropTypes.string,
};

export default BarChartComponent;
