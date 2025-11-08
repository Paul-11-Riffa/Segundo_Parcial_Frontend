import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useSalesPredictions from '../hooks/useSalesPredictions';

// Components
import ChartCard from '../components/dashboard/ChartCard';
import LoadingSkeleton from '../components/dashboard/LoadingSkeleton';
import EmptyState from '../components/dashboard/EmptyState';
import ModelInfoBadge from '../components/dashboard/ModelInfoBadge';
import './PredictionsDashboard.css';

// Charts
import LineChartComponent from '../components/charts/LineChartComponent';
import ComposedChartComponent from '../components/charts/ComposedChartComponent';
import AreaChartComponent from '../components/charts/AreaChartComponent';

// Utils
import { formatCurrency, formatNumber, formatRelativeDate } from '../utils/formatters';
import { CHART_COLORS } from '../utils/chartHelpers';

/**
 * Página de Dashboard de Predicciones ML
 * Diseño moderno con insights inteligentes
 */
const PredictionsDashboard = () => {
  const navigate = useNavigate();
  
  // Estado para el periodo seleccionado
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [includeHistorical, setIncludeHistorical] = useState(true);

  // Hook de predicciones
  const {
    predictions,
    loading,
    error,
    lastFetch,
    refetch,
    isStale,
  } = useSalesPredictions({
    days: selectedPeriod,
    includeHistorical: includeHistorical,
    chartFormat: true,
    fetchOnMount: true,
  });

  // 🔍 DEBUG: Log del estado actual
  console.log('🔍 PredictionsDashboard State:', {
    predictions,
    loading,
    error,
    hasPredictions: !!predictions,
    chartDataLength: predictions?.chart_data?.length || 0,
    selectedPeriod,
  });
  
  // 🔍 DEBUG: Verificar intervalos de confianza
  if (predictions?.chart_data?.length > 0) {
    const sampleData = predictions.chart_data[0];
    console.log('📊 Sample chart data:', {
      date: sampleData.date,
      predicted_sales: sampleData.predicted_sales,
      lower_bound: sampleData.lower_bound,
      upper_bound: sampleData.upper_bound,
      confidence_lower: sampleData.confidence_lower,
      confidence_upper: sampleData.confidence_upper,
      hasConfidenceIntervals: !!(sampleData.lower_bound || sampleData.upper_bound)
    });
  }

  /**
   * Periodos disponibles
   */
  const periods = [
    { value: 7, label: '7 días', color: CHART_COLORS.predictions['7d'] },
    { value: 14, label: '14 días', color: CHART_COLORS.predictions['14d'] },
    { value: 30, label: '30 días', color: CHART_COLORS.predictions['30d'] },
    { value: 90, label: '90 días', color: CHART_COLORS.predictions['90d'] },
  ];

  /**
   * Calcular insights inteligentes de las predicciones
   */
  const insights = useMemo(() => {
    if (!predictions?.chart_data) return null;

    const chartData = predictions.chart_data;
    const summary = predictions.summary || {};
    
    // Datos históricos vs predicciones
    const historicalData = chartData.filter(item => item.actual_sales);
    const futureData = chartData.filter(item => !item.actual_sales && item.predicted_sales);
    
    // Calcular promedios
    const historicalAvg = historicalData.length > 0
      ? historicalData.reduce((sum, item) => sum + item.actual_sales, 0) / historicalData.length
      : 0;
    
    const predictedAvg = futureData.length > 0
      ? futureData.reduce((sum, item) => sum + item.predicted_sales, 0) / futureData.length
      : 0;
    
    // Calcular cambio porcentual
    const changePercent = historicalAvg > 0
      ? ((predictedAvg - historicalAvg) / historicalAvg) * 100
      : 0;
    
    // Mejor y peor día predicho
    const bestDay = futureData.length > 0
      ? futureData.reduce((max, item) => item.predicted_sales > max.predicted_sales ? item : max, futureData[0])
      : null;
    
    const worstDay = futureData.length > 0
      ? futureData.reduce((min, item) => item.predicted_sales < min.predicted_sales ? item : min, futureData[0])
      : null;
    
    // Calcular volatilidad (desviación estándar)
    const volatility = futureData.length > 1
      ? Math.sqrt(futureData.reduce((sum, item) => {
          const diff = item.predicted_sales - predictedAvg;
          return sum + (diff * diff);
        }, 0) / futureData.length)
      : 0;
    
    // Rango de incertidumbre promedio
    const avgUncertainty = futureData.length > 0
      ? futureData.reduce((sum, item) => {
          if (item.upper_bound && item.lower_bound) {
            return sum + (item.upper_bound - item.lower_bound);
          }
          return sum;
        }, 0) / futureData.length
      : 0;

    return {
      historicalAvg,
      predictedAvg,
      changePercent,
      bestDay,
      worstDay,
      volatility,
      avgUncertainty,
      totalPredicted: summary.total_predicted || 0,
      trend: changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable'
    };
  }, [predictions]);

  /**
   * Maneja el cambio de periodo
   */
  const handlePeriodChange = (days) => {
    setSelectedPeriod(days);
  };

  /**
   * Navegar al entrenamiento del modelo
   */
  const handleTrainModel = () => {
    navigate('/admin/dashboard/train-model');
  };

  /**
   * Volver al dashboard principal
   */
  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  /**
   * Renderiza el header
   */
  const renderHeader = () => (
    <div className="predictions-header">
      <button onClick={handleBack} className="predictions-back-button">
        <span>←</span>
        <span>Volver</span>
      </button>

      <div className="predictions-header-content">
        <div className="predictions-title-section">
          <h1>Predicciones de Ventas</h1>
          <p>Análisis predictivo usando Machine Learning</p>
          {lastFetch && (
            <p className="predictions-subtitle">
              Última actualización: {formatRelativeDate(lastFetch)}
            </p>
          )}
          {isStale && (
            <p className="predictions-warning">
              <span>⚠️</span>
              <span>Los datos pueden estar desactualizados</span>
            </p>
          )}
        </div>

        <div className="predictions-actions">
          <button
            onClick={refetch}
            disabled={loading}
            className="predictions-button predictions-button-secondary"
          >
            <span>🔄</span>
            <span>{loading ? 'Actualizando...' : 'Actualizar'}</span>
          </button>

          <button
            onClick={handleTrainModel}
            className="predictions-button predictions-button-primary"
          >
            <span>🤖</span>
            <span>Entrenar Modelo</span>
          </button>
        </div>
      </div>

      {/* Información del modelo */}
      {predictions?.model_info && (
        <div className="predictions-model-info">
          <ModelInfoBadge
            r2Score={predictions.model_info.r2_score}
            lastTrained={predictions.model_info.last_trained}
            samples={predictions.model_info.training_samples}
            trainingDays={predictions.model_info.training_days}
            version={predictions.model_info.version}
            size="lg"
          />
        </div>
      )}
    </div>
  );

  /**
   * Renderiza los botones de periodo
   */
  const renderPeriodSelector = () => (
    <div className="predictions-period-selector">
      <span className="predictions-period-label">Periodo:</span>
      <div className="predictions-period-buttons">
        {periods.map((period) => (
          <button
            key={period.value}
            onClick={() => handlePeriodChange(period.value)}
            disabled={loading}
            className={`predictions-period-button ${
              selectedPeriod === period.value ? 'active' : ''
            }`}
          >
            {period.label}
          </button>
        ))}
      </div>

      <div className="predictions-checkbox-wrapper">
        <input
          type="checkbox"
          id="includeHistorical"
          checked={includeHistorical}
          onChange={(e) => setIncludeHistorical(e.target.checked)}
          className="predictions-checkbox"
        />
        <label htmlFor="includeHistorical" className="predictions-checkbox-label">
          Incluir histórico
        </label>
      </div>
    </div>
  );

  /**
   * Renderiza los insights inteligentes
   */
  const renderInsights = () => {
    if (!insights || loading) return null;

    const { changePercent, trend, bestDay, worstDay, volatility, predictedAvg } = insights;

    return (
      <>
        {/* Alerta si hay cambio significativo */}
        {Math.abs(changePercent) > 10 && (
          <div className="predictions-alert">
            <div className="predictions-alert-icon">
              {trend === 'up' ? '📈' : trend === 'down' ? '📉' : '📊'}
            </div>
            <div className="predictions-alert-content">
              <h4>
                {trend === 'up' ? '¡Crecimiento Detectado!' : trend === 'down' ? 'Atención: Descenso Predicho' : 'Ventas Estables'}
              </h4>
              <p>
                {trend === 'up' 
                  ? `Las predicciones muestran un incremento del ${changePercent.toFixed(1)}% respecto al promedio histórico. Considera aumentar el inventario.`
                  : trend === 'down'
                  ? `Se predice una disminución del ${Math.abs(changePercent).toFixed(1)}% en ventas. Revisa estrategias de marketing.`
                  : 'Las ventas se mantendrán estables según las predicciones actuales.'}
              </p>
            </div>
          </div>
        )}

        {/* Grid de insights */}
        <div className="predictions-insights-grid">
          {/* Cambio vs Histórico */}
          <div className={`insight-card ${trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : ''}`}>
            <span className="insight-icon">{trend === 'up' ? '📈' : trend === 'down' ? '📉' : '➡️'}</span>
            <p className="insight-label">Cambio vs Histórico</p>
            <p className="insight-value">{changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%</p>
            <div className={`insight-change ${trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : 'neutral'}`}>
              <span>{trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}</span>
              <span>
                {trend === 'up' ? 'Crecimiento' : trend === 'down' ? 'Descenso' : 'Estable'}
              </span>
            </div>
            <p className="insight-description">
              Comparado con el promedio histórico de ventas
            </p>
          </div>

          {/* Mejor día */}
          {bestDay && (
            <div className="insight-card positive">
              <span className="insight-icon">🏆</span>
              <p className="insight-label">Mejor Día Predicho</p>
              <p className="insight-value">{formatCurrency(bestDay.predicted_sales)}</p>
              <div className="insight-change positive">
                <span>📅</span>
                <span>{new Date(bestDay.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              </div>
              <p className="insight-description">
                El día con mayores ventas esperadas
              </p>
            </div>
          )}

          {/* Peor día */}
          {worstDay && (
            <div className="insight-card">
              <span className="insight-icon">📊</span>
              <p className="insight-label">Día Más Bajo</p>
              <p className="insight-value">{formatCurrency(worstDay.predicted_sales)}</p>
              <div className="insight-change neutral">
                <span>📅</span>
                <span>{new Date(worstDay.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              </div>
              <p className="insight-description">
                El día con menores ventas esperadas
              </p>
            </div>
          )}

          {/* Volatilidad */}
          <div className={`insight-card ${volatility / predictedAvg > 0.3 ? 'warning' : ''}`}>
            <span className="insight-icon">📊</span>
            <p className="insight-label">Volatilidad</p>
            <p className="insight-value">±{formatCurrency(volatility)}</p>
            <div className={`insight-change ${volatility / predictedAvg > 0.3 ? 'negative' : 'neutral'}`}>
              <span>{volatility / predictedAvg > 0.3 ? '⚠️' : '✓'}</span>
              <span>{volatility / predictedAvg > 0.3 ? 'Alta' : 'Normal'}</span>
            </div>
            <p className="insight-description">
              Variación esperada en las predicciones
            </p>
          </div>

          {/* Promedio Diario Predicho */}
          <div className="insight-card">
            <span className="insight-icon">💰</span>
            <p className="insight-label">Promedio Diario</p>
            <p className="insight-value">{formatCurrency(predictedAvg)}</p>
            <div className="insight-change neutral">
              <span>📊</span>
              <span>Próximos {selectedPeriod} días</span>
            </div>
            <p className="insight-description">
              Ventas esperadas por día en promedio
            </p>
          </div>
        </div>
      </>
    );
  };

  /**
   * Renderiza el gráfico combinado (histórico + predicciones)
   */
  const renderCombinedChart = () => {
    if (loading && !predictions) {
      return <LoadingSkeleton type="chart" height={500} />;
    }

    const chartData = predictions?.chart_data || [];

    if (chartData.length === 0) {
      return (
        <ChartCard title="Histórico y Predicciones" subtitle="Comparación">
          <EmptyState
            icon="📊"
            title="No hay datos disponibles"
            description="No se pudieron cargar las predicciones. Entrena el modelo primero."
            actionText="Entrenar Modelo"
            onAction={handleTrainModel}
          />
        </ChartCard>
      );
    }

    // Encontrar la fecha de hoy para la línea de referencia
    const today = new Date().toISOString().split('T')[0];

    return (
      <ChartCard
        title="Histórico y Predicciones"
        subtitle={`Ventas reales vs predicciones (${selectedPeriod} días)`}
      >
        <ComposedChartComponent
          data={chartData}
          elements={[
            {
              type: 'bar',
              dataKey: 'actual_sales',
              name: 'Ventas Reales',
              color: CHART_COLORS.predictions['7d'],
            },
            {
              type: 'line',
              dataKey: 'predicted_sales',
              name: 'Predicción',
              color: CHART_COLORS.predictions['30d'],
              strokeWidth: 3,
              strokeDasharray: '5 5',
            },
            {
              type: 'area',
              dataKey: 'confidence_upper',
              name: 'Intervalo Superior',
              color: CHART_COLORS.predictions['30d'],
              fillOpacity: 0.1,
            },
          ]}
          xAxisKey="date"
          height={500}
          formatValue="currency"
          referenceLine={today}
          referenceLineLabel="Hoy"
        />
      </ChartCard>
    );
  };

  /**
   * Renderiza el gráfico de líneas de predicción
   */
  const renderPredictionLineChart = () => {
    if (loading && !predictions) {
      return <LoadingSkeleton type="chart" height={400} />;
    }

    const predictionData = predictions?.predictions || [];

    if (predictionData.length === 0) {
      return (
        <ChartCard title="Tendencia de Predicciones" subtitle="Solo predicciones futuras">
          <EmptyState
            icon="📈"
            title="No hay predicciones"
            description="No se encontraron predicciones para este periodo"
          />
        </ChartCard>
      );
    }

    return (
      <ChartCard
        title="Tendencia de Predicciones"
        subtitle={`Próximos ${selectedPeriod} días`}
      >
        <LineChartComponent
          data={predictionData}
          lines={[
            {
              dataKey: 'predicted_value',
              name: 'Predicción',
              color: CHART_COLORS.predictions['30d'],
              strokeWidth: 3,
            },
          ]}
          xAxisKey="date"
          height={400}
          formatValue="currency"
        />
      </ChartCard>
    );
  };

  /**
   * Renderiza el gráfico de intervalos de confianza
   */
  const renderConfidenceChart = () => {
    if (loading && !predictions) {
      return <LoadingSkeleton type="chart" height={400} />;
    }

    // Los intervalos de confianza están en chart_data
    const confidenceData = predictions?.chart_data || [];
    
    // Filtrar solo predicciones futuras (sin actual_sales)
    const futureData = confidenceData.filter(item => !item.actual_sales && item.predicted_sales);

    if (futureData.length === 0) {
      return (
        <ChartCard title="Intervalos de Confianza" subtitle="Rango de predicción (95%)">
          <EmptyState
            icon="📊"
            title="No hay intervalos de confianza"
            description="No se encontraron datos de predicción con intervalos"
          />
        </ChartCard>
      );
    }

    return (
      <ChartCard
        title="Intervalos de Confianza"
        subtitle={`Rango de predicción (Confianza 95%) - ${selectedPeriod} días`}
      >
        <AreaChartComponent
          data={futureData}
          areas={[
            {
              dataKey: 'lower_bound',
              name: 'Mínimo Esperado (5%)',
              color: '#EF4444',
              fillOpacity: 0.3,
            },
            {
              dataKey: 'predicted_sales',
              name: 'Predicción Media',
              color: CHART_COLORS.predictions['30d'],
              fillOpacity: 0.6,
            },
            {
              dataKey: 'upper_bound',
              name: 'Máximo Esperado (95%)',
              color: '#10B981',
              fillOpacity: 0.3,
            },
          ]}
          xAxisKey="date"
          height={400}
          formatValue="currency"
        />
      </ChartCard>
    );
  };

  /**
   * Renderiza las métricas del modelo
   */
  const renderModelMetrics = () => {
    if (loading && !predictions) {
      return <LoadingSkeleton type="card" />;
    }

    const metrics = predictions?.model_info || {};
    const summary = predictions?.summary || {};
    
    // Calcular ancho promedio del intervalo de confianza
    const chartData = predictions?.chart_data || [];
    const futureData = chartData.filter(item => item.lower_bound && item.upper_bound);
    const avgInterval = futureData.length > 0 
      ? futureData.reduce((sum, item) => sum + (item.upper_bound - item.lower_bound), 0) / futureData.length
      : 0;

    return (
      <div className="predictions-metrics">
        <h3>Resumen de Predicciones</h3>
        
        <div className="predictions-metrics-grid">
          <div className="metric-item">
            <p className="metric-label">Total Predicho</p>
            <p className="metric-value">
              {formatCurrency(summary.total_predicted || 0)}
            </p>
          </div>

          <div className="metric-item">
            <p className="metric-label">Promedio Diario</p>
            <p className="metric-value">
              {formatCurrency(summary.daily_average || 0)}
            </p>
          </div>

          <div className="metric-item">
            <p className="metric-label">Precisión del Modelo</p>
            <p className="metric-value">
              {metrics.r2_score ? `${(metrics.r2_score * 100).toFixed(1)}%` : 'N/A'}
            </p>
          </div>
          
          <div className="metric-item">
            <p className="metric-label">Rango de Incertidumbre</p>
            <p className="metric-value">
              ±{formatCurrency(avgInterval / 2)}
            </p>
            <p className="metric-subtext">Intervalo 95%</p>
          </div>
        </div>

        {summary.trend && (
          <div className="predictions-metrics-footer">
            <p>
              <strong>Tendencia:</strong> {summary.trend}
            </p>
          </div>
        )}
      </div>
    );
  };

  /**
   * Renderiza la tarjeta informativa sobre intervalos
   */
  const renderInfoCard = () => {
    return (
      <div className="predictions-info-card">
        <div className="predictions-info-header">
          <div className="predictions-info-icon">📊</div>
          <div className="predictions-info-content">
            <h3>¿Qué son los Intervalos de Confianza?</h3>
            <p>
              Los intervalos de confianza muestran el <strong>rango probable</strong> de ventas con un 95% de certeza. 
              Esto significa que hay un 95% de probabilidad de que las ventas reales estén entre el límite mínimo y máximo.
            </p>
          </div>
        </div>
            
        <div className="predictions-info-scenarios">
          <div className="scenario-card">
            <div className="scenario-header">
              <div className="scenario-indicator red"></div>
              <span className="scenario-title">Escenario Pesimista (5%)</span>
            </div>
            <p className="scenario-description">
              Ventas mínimas esperadas. Útil para planificar presupuestos conservadores y gestión de riesgos.
            </p>
          </div>

          <div className="scenario-card">
            <div className="scenario-header">
              <div className="scenario-indicator blue"></div>
              <span className="scenario-title">Predicción Media</span>
            </div>
            <p className="scenario-description">
              Valor más probable según el modelo. Base para objetivos y metas del equipo.
            </p>
          </div>

          <div className="scenario-card">
            <div className="scenario-header">
              <div className="scenario-indicator green"></div>
              <span className="scenario-title">Escenario Optimista (95%)</span>
            </div>
            <p className="scenario-description">
              Ventas máximas esperadas. Útil para preparar inventario extra y planificar recursos adicionales.
            </p>
          </div>
        </div>

        <div className="predictions-info-tip">
          <p>
            <strong>💡 Consejo:</strong> Un intervalo amplio indica mayor incertidumbre. 
            Para reducirlo, entrena el modelo con más datos históricos o verifica que no haya anomalías en las ventas recientes.
          </p>
        </div>
      </div>
    );
  };

  /**
   * Renderiza el estado de error
   */
  if (error) {
    return (
      <div className="predictions-container">
        {renderHeader()}
        <div className="predictions-metrics">
          <EmptyState
            icon="⚠️"
            title="Error al cargar predicciones"
            description={error}
            actionText="Reintentar"
            onAction={refetch}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="predictions-container">
      {renderHeader()}
      {renderPeriodSelector()}

      {/* Insights inteligentes */}
      {renderInsights()}

      {/* Métricas del modelo */}
      {renderModelMetrics()}

      {/* Gráfico combinado principal */}
      <div style={{ marginBottom: '2rem' }}>
        {renderCombinedChart()}
      </div>

      {/* Grid de 2 columnas */}
      <div className="predictions-charts-grid two-columns">
        {renderPredictionLineChart()}
        {renderConfidenceChart()}
      </div>

      {/* Tarjeta informativa */}
      {renderInfoCard()}

      {/* Spacer */}
      <div style={{ height: '4rem' }}></div>
    </div>
  );
};

export default PredictionsDashboard;
