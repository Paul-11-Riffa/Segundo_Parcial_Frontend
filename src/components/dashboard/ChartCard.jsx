import PropTypes from 'prop-types';
import './dashboard.css';

/**
 * Componente contenedor para gráficos
 * Proporciona un wrapper consistente con título, subtítulo y acciones
 * 
 * @example
 * <ChartCard 
 *   title="Tendencia de Ventas"
 *   subtitle="Últimos 7 días"
 *   actions={<button>Exportar</button>}
 * >
 *   <LineChart data={data} />
 * </ChartCard>
 */
const ChartCard = ({
  title,
  subtitle = null,
  children,
  actions = null,
  loading = false,
  className = '',
  noPadding = false,
}) => {
  if (loading) {
    return (
      <div className={`chart-card skeleton ${className}`}>
        <div className="skeleton-line w-third mb-2"></div>
        {subtitle && <div className="skeleton-line-sm w-quarter mb-4"></div>}
        <div className="skeleton-chart"></div>
      </div>
    );
  }

  return (
    <div className={`chart-card ${className}`}>
      {/* Header */}
      {(title || actions) && (
        <div className="chart-card-header">
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h3 className="chart-card-title">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="chart-card-subtitle">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Acciones (botones, filtros, etc.) */}
            {actions && (
                <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Contenido del gráfico */}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};

ChartCard.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  actions: PropTypes.node,
  loading: PropTypes.bool,
  className: PropTypes.string,
  noPadding: PropTypes.bool,
};

export default ChartCard;
