import PropTypes from 'prop-types';
import './dashboard.css';

/**
 * Componente de estado vacío para mostrar cuando no hay datos
 * Incluye icono, título, descripción y acción opcional
 * 
 * @example
 * <EmptyState
 *   icon="📊"
 *   title="No hay datos disponibles"
 *   description="Aún no se han registrado ventas"
 *   actionText="Ver tutorial"
 *   onAction={handleAction}
 * />
 */
const EmptyState = ({
  icon = '📊',
  title = 'No hay datos',
  description = '',
  actionText = null,
  onAction = null,
  className = '',
}) => {
  return (
    <div className={`empty-state ${className}`}>
      {/* Icono */}
      <div className="empty-state-icon">
        {icon}
      </div>

      {/* Título */}
      <h3 className="empty-state-title">
        {title}
      </h3>

      {/* Descripción */}
      {description && (
        <p className="empty-state-description">
          {description}
        </p>
      )}

      {/* Acción opcional */}
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="empty-state-button"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  actionText: PropTypes.string,
  onAction: PropTypes.func,
  className: PropTypes.string,
};

export default EmptyState;
