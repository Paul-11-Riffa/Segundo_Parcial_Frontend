import PropTypes from 'prop-types';
import { formatPercent, formatRelativeDate, formatNumber } from '../../utils/formatters';
import './dashboard.css';

/**
 * Componente que muestra información del modelo de ML
 * Incluye métricas como R², fecha de entrenamiento y cantidad de muestras
 * 
 * @example
 * <ModelInfoBadge
 *   r2Score={0.87}
 *   lastTrained="2024-01-15T10:30:00Z"
 *   samples={1500}
 *   trainingDays={90}
 * />
 */
const ModelInfoBadge = ({
  r2Score = null,
  lastTrained = null,
  samples = null,
  trainingDays = null,
  version = null,
  size = 'md',
  className = '',
}) => {
  /**
   * Obtiene el color de badge según la precisión del modelo (R²)
   * R² >= 0.8: Excelente (verde)
   * R² >= 0.6: Bueno (amarillo)
   * R² < 0.6: Regular (naranja)
   */
  const getAccuracyColor = (r2) => {
    if (!r2) return { bg: '#F3F4F6', text: '#6B7280', border: '#E5E7EB' };
    if (r2 >= 0.8) return { bg: '#D1FAE5', text: '#065F46', border: '#10B981' };
    if (r2 >= 0.6) return { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B' };
    return { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444' };
  };

  /**
   * Obtiene el texto de calidad según R²
   */
  const getQualityText = (r2) => {
    if (!r2) return 'Sin datos';
    if (r2 >= 0.8) return 'Excelente';
    if (r2 >= 0.6) return 'Bueno';
    return 'Regular';
  };

  const colors = getAccuracyColor(r2Score);
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <div
      className={`model-info-badge model-info-badge-${size} ${className}`}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
    >
      {/* Icono del modelo */}
      <span className="mr-2">🤖</span>

      <div className="flex items-center gap-3">
        {/* R² Score */}
        {r2Score !== null && (
          <div className="flex items-center gap-1">
            <span className="font-semibold">R²:</span>
            <span className="font-bold">{formatPercent(r2Score, true, 2)}</span>
            <span className="text-xs opacity-75">({getQualityText(r2Score)})</span>
          </div>
        )}

        {/* Separador */}
        {r2Score !== null && (samples !== null || lastTrained || version) && (
          <span className="opacity-30">|</span>
        )}

        {/* Cantidad de muestras */}
        {samples !== null && (
          <div className="flex items-center gap-1">
            <span>📊</span>
            <span className="font-medium">{formatNumber(samples)}</span>
            <span className="text-xs opacity-75">muestras</span>
          </div>
        )}

        {/* Separador */}
        {samples !== null && (lastTrained || trainingDays) && (
          <span className="opacity-30">|</span>
        )}

        {/* Fecha de último entrenamiento */}
        {lastTrained && (
          <div className="flex items-center gap-1">
            <span>🕐</span>
            <span className="text-xs opacity-75">Entrenado {formatRelativeDate(lastTrained)}</span>
          </div>
        )}

        {/* Días de entrenamiento */}
        {trainingDays && !lastTrained && (
          <div className="flex items-center gap-1">
            <span>📅</span>
            <span className="text-xs opacity-75">{trainingDays} días</span>
          </div>
        )}

        {/* Versión del modelo */}
        {version && (
          <>
            <span className="opacity-30">|</span>
            <div className="flex items-center gap-1">
              <span className="text-xs opacity-75">v{version}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

ModelInfoBadge.propTypes = {
  r2Score: PropTypes.number,
  lastTrained: PropTypes.string,
  samples: PropTypes.number,
  trainingDays: PropTypes.number,
  version: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default ModelInfoBadge;
