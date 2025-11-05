import PropTypes from 'prop-types';
import { getAlertBadge } from '../../utils/stockAlertHelpers';

/**
 * Componente de badge para alertas de stock
 * Muestra un badge con color según el nivel de alerta
 * 
 * @example
 * <AlertBadge level="CRITICAL" text="Crítico" />
 * <AlertBadge level="WARNING" showIcon={true} />
 */
const AlertBadge = ({
  level = 'OK',
  text = null,
  showIcon = true,
  size = 'md',
  className = '',
}) => {
  const badge = getAlertBadge(level);

  // Tamaños
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const sizeClass = sizes[size] || sizes.md;

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${sizeClass} ${className}`}
      style={{
        backgroundColor: badge.bgColor,
        color: badge.color,
        borderColor: badge.borderColor,
      }}
    >
      {showIcon && (
        <span className="mr-1" role="img" aria-label={level}>
          {badge.icon}
        </span>
      )}
      {text || badge.text}
    </span>
  );
};

AlertBadge.propTypes = {
  level: PropTypes.oneOf(['CRITICAL', 'WARNING', 'CAUTION', 'OK']).isRequired,
  text: PropTypes.string,
  showIcon: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default AlertBadge;
