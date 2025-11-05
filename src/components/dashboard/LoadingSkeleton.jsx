import PropTypes from 'prop-types';
import './dashboard.css';

/**
 * Componente de skeleton loader para diferentes tipos de contenido
 * Muestra un placeholder animado mientras carga el contenido real
 * 
 * @example
 * <LoadingSkeleton type="card" />
 * <LoadingSkeleton type="chart" height={300} />
 * <LoadingSkeleton type="table" rows={5} />
 */
const LoadingSkeleton = ({ type = 'card', height = null, rows = 3, className = '' }) => {
  // Skeleton para card/tarjeta
  if (type === 'card') {
    return (
      <div className={`skeleton skeleton-card ${className}`}>
        <div className="skeleton-line w-third mb-4"></div>
        <div className="skeleton-line-thick w-two-thirds mb-2"></div>
        <div className="skeleton-line-sm w-quarter"></div>
      </div>
    );
  }

  // Skeleton para gráfico
  if (type === 'chart') {
    return (
      <div className={`skeleton skeleton-card ${className}`}>
        <div className="skeleton-line w-third mb-4"></div>
        <div className="skeleton-line-sm w-quarter mb-6"></div>
        <div className={height ? `skeleton-chart-${height}` : 'skeleton-chart'}></div>
      </div>
    );
  }

  // Skeleton para tabla
  if (type === 'table') {
    return (
      <div className={`skeleton skeleton-card ${className}`}>
        {/* Header de tabla */}
        <div className="skeleton-table-header">
          <div className="skeleton-line w-quarter"></div>
          <div className="skeleton-line w-quarter"></div>
          <div className="skeleton-line w-quarter"></div>
          <div className="skeleton-line w-quarter"></div>
        </div>

        {/* Filas de tabla */}
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="skeleton-table-row">
            <div className="skeleton-line-sm w-quarter"></div>
            <div className="skeleton-line-sm w-quarter"></div>
            <div className="skeleton-line-sm w-quarter"></div>
            <div className="skeleton-line-sm w-quarter"></div>
          </div>
        ))}
      </div>
    );
  }

  // Skeleton para dashboard completo
  if (type === 'dashboard') {
    return (
      <div className={`skeleton skeleton-dashboard ${className}`}>
        {/* Grid de cards */}
        <div className="skeleton-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="skeleton skeleton-card">
              <div className="skeleton-line w-two-thirds mb-4"></div>
              <div className="skeleton-line-thick w-three-quarter mb-2"></div>
              <div className="skeleton-line-sm w-third"></div>
            </div>
          ))}
        </div>

        {/* Gráfico grande */}
        <div className="skeleton skeleton-card">
          <div className="skeleton-line w-quarter mb-6"></div>
          <div className="skeleton-chart-lg"></div>
        </div>

        {/* Grid de 2 columnas */}
        <div className="skeleton-grid-2">
          <div className="skeleton skeleton-card">
            <div className="skeleton-line w-third mb-6"></div>
            <div className="skeleton-table-body">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="skeleton-table-row">
                  <div className="skeleton-line-sm w-third"></div>
                  <div className="skeleton-line-sm w-third"></div>
                  <div className="skeleton-line-sm w-third"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="skeleton skeleton-card">
            <div className="skeleton-line w-third mb-6"></div>
            <div className="skeleton-chart"></div>
          </div>
        </div>
      </div>
    );
  }

  // Skeleton para texto simple
  if (type === 'text') {
    return (
      <div className={`skeleton skeleton-text ${className}`}>
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className={`skeleton-line ${index === rows - 1 ? 'w-two-thirds' : 'w-full'}`}></div>
        ))}
      </div>
    );
  }

  // Default: card
  return (
    <div className={`skeleton skeleton-card ${className}`}>
      <div className="skeleton-line w-third mb-4"></div>
      <div className="skeleton-line-thick w-two-thirds"></div>
    </div>
  );
};

LoadingSkeleton.propTypes = {
  type: PropTypes.oneOf(['card', 'chart', 'table', 'dashboard', 'text']),
  height: PropTypes.number,
  rows: PropTypes.number,
  className: PropTypes.string,
};

export default LoadingSkeleton;
