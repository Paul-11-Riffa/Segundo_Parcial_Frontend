import PropTypes from 'prop-types';
import { formatCurrency, formatNumber, formatPercent } from '../../utils/formatters';
import { getTrendColor } from '../../utils/chartHelpers';
import './dashboard.css';

/**
 * Componente de tarjeta de estadística
 * Muestra un KPI con valor, título, cambio y tendencia
 * 
 * @example
 * <StatCard 
 *   title="Ventas Hoy"
 *   value={4580.50}
 *   format="currency"
 *   change={12.5}
 *   subtitle="23 órdenes"
 *   icon="💰"
 * />
 */
const StatCard = ({
  title,
  value,
  format = 'number',
  change = null,
  subtitle = null,
  icon = null,
  trend = null,
  loading = false,
  className = '',
}) => {
  // Formatear el valor según el tipo
  const formatValue = (val, fmt) => {
    if (val === null || val === undefined) return '-';

    switch (fmt) {
      case 'currency':
        return formatCurrency(val);
      case 'percent':
        return formatPercent(val);
      case 'number':
      default:
        return formatNumber(val);
    }
  };

  // Determinar el color de la tendencia
  const getTrendStyle = () => {
    if (change === null || change === 0) return { color: '#6B7280', icon: '—' };
    
    if (change > 0) {
      return {
        color: getTrendColor('positive'),
        icon: '↑',
        badgeClass: 'trend-badge-positive',
      };
    }

    return {
      color: getTrendColor('negative'),
      icon: '↓',
      badgeClass: 'trend-badge-negative',
    };
  };

  const trendStyle = getTrendStyle();

  if (loading) {
    return (
      <div className={`stat-card skeleton ${className}`}>
        <div className="skeleton-line w-half mb-4"></div>
        <div className="skeleton-line-thick w-three-quarter mb-2"></div>
        <div className="skeleton-line-sm w-third"></div>
      </div>
    );
  }

  return (
    <div className={`stat-card ${className}`}>
      {/* Header con título e ícono */}
      <div className="stat-card-header">
        <h3 className="stat-card-title">
          {title}
        </h3>
        {icon && (
          <span className="stat-card-icon" role="img" aria-label={title}>
            {icon}
          </span>
        )}
      </div>

      {/* Valor principal */}
      <div className="mb-2">
        <p className="stat-card-value">
          {formatValue(value, format)}
        </p>
      </div>

      {/* Footer con cambio y subtítulo */}
      <div className="flex items-center justify-between">
        {/* Cambio/Tendencia */}
        {change !== null && (
          <div className={`stat-card-badge ${trendStyle.badgeClass || ''}`}>
            <span className="stat-card-badge-icon mr-1">
              {trendStyle.icon}
            </span>
            <span className="stat-card-badge-text">
              {formatPercent(Math.abs(change), false, 1)}
            </span>
          </div>
        )}

        {/* Subtítulo */}
        {subtitle && (
          <p className="stat-card-subtitle">
            {subtitle}
          </p>
        )}
      </div>

      {/* Tendencia personalizada (si se proporciona) */}
      {trend && (
        <div className="stat-card-footer">
          <p className="stat-card-trend">
            {trend}
          </p>
        </div>
      )}
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  format: PropTypes.oneOf(['currency', 'number', 'percent']),
  change: PropTypes.number,
  subtitle: PropTypes.string,
  icon: PropTypes.string,
  trend: PropTypes.string,
  loading: PropTypes.bool,
  className: PropTypes.string,
};

export default StatCard;
