import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useSalesPredictions from '../hooks/useSalesPredictions';

// Components
import ChartCard from '../components/dashboard/ChartCard';
import LoadingSkeleton from '../components/dashboard/LoadingSkeleton';
import EmptyState from '../components/dashboard/EmptyState';
import ModelInfoBadge from '../components/dashboard/ModelInfoBadge';
import '../components/dashboard/dashboard.css';
import './pages.css';

// Charts
import LineChartComponent from '../components/charts/LineChartComponent';
import ComposedChartComponent from '../components/charts/ComposedChartComponent';
import AreaChartComponent from '../components/charts/AreaChartComponent';

// Utils
import { formatCurrency, formatNumber, formatRelativeDate } from '../utils/formatters';
import { CHART_COLORS } from '../utils/chartHelpers';

/**
 * Página de Dashboard de Predicciones ML
 * Muestra predicciones de ventas usando Machine Learning
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
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleBack}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <span>←</span>
          <span>Volver</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Predicciones de Ventas
          </h1>
          <p className="text-gray-600 mt-2">
            Análisis predictivo usando Machine Learning
          </p>
          {lastFetch && (
            <p className="text-sm text-gray-500 mt-1">
              Última actualización: {formatRelativeDate(lastFetch)}
            </p>
          )}
          {isStale && (
            <p className="text-sm text-orange-600 mt-1">
              ⚠️ Los datos pueden estar desactualizados
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button
            onClick={refetch}
            disabled={loading}
            className="button button-secondary flex items-center gap-2 disabled:opacity-50"
          >
            <span>🔄</span>
            <span>{loading ? 'Actualizando...' : 'Actualizar'}</span>
          </button>

          <button
            onClick={handleTrainModel}
            className="button button-primary flex items-center gap-2"
          >
            <span>🤖</span>
            <span>Entrenar Modelo</span>
          </button>
        </div>
      </div>

      {/* Información del modelo */}
      {predictions?.model_info && (
        <div className="mt-4">
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
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <span className="text-sm font-bold text-gray-700">Periodo:</span>
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => handlePeriodChange(period.value)}
          disabled={loading}
          className={`button ${
            selectedPeriod === period.value
              ? 'text-white'
              : 'button-secondary'
          } disabled:opacity-50`}
          style={
            selectedPeriod === period.value
              ? { backgroundColor: period.color }
              : {}
          }
        >
          {period.label}
        </button>
      ))}

      <div className="ml-auto flex items-center gap-2">
        <input
          type="checkbox"
          id="includeHistorical"
          checked={includeHistorical}
          onChange={(e) => setIncludeHistorical(e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded"
        />
        <label htmlFor="includeHistorical" className="text-sm text-gray-700">
          Incluir histórico
        </label>
      </div>
    </div>
  );

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
      <div className="stat-card">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Resumen de Predicciones
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Predicho</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.total_predicted || 0)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Promedio Diario</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.daily_average || 0)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Precisión del Modelo</p>
            <p className="text-2xl font-bold text-gray-900">
              {metrics.r2_score ? `${(metrics.r2_score * 100).toFixed(1)}%` : 'N/A'}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Rango de Incertidumbre</p>
            <p className="text-2xl font-bold text-gray-900">
              ±{formatCurrency(avgInterval / 2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Intervalo 95%</p>
            <p className="text-xs text-gray-500 mt-1">Intervalo 95%</p>
          </div>
        </div>

        {summary.trend && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-bold">Tendencia:</span> {summary.trend}
            </p>
          </div>
        )}
      </div>
    );
  };

  /**
   * Renderiza el estado de error
   */
  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          {renderHeader()}
          <div className="stat-card p-12">
            <EmptyState
              icon="⚠️"
              title="Error al cargar predicciones"
              description={error}
              actionText="Reintentar"
              onAction={refetch}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {renderHeader()}
        {renderPeriodSelector()}

        {/* Métricas del modelo */}
        <div className="mb-8">
          {renderModelMetrics()}
        </div>

        {/* Gráfico combinado principal */}
        <div className="mb-8">
          {renderCombinedChart()}
        </div>

        {/* Grid de 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {renderPredictionLineChart()}
          {renderConfidenceChart()}
        </div>

        {/* Tarjeta informativa sobre intervalos de confianza */}
        <div className="stat-card bg-gradient-to-br from-blue-50 to-indigo-50 border-l-4 border-indigo-500">
          <div className="flex items-start gap-4">
            <div className="text-4xl">📊</div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                ¿Qué son los Intervalos de Confianza?
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                Los intervalos de confianza muestran el <strong>rango probable</strong> de ventas con un 95% de certeza. 
                Esto significa que hay un 95% de probabilidad de que las ventas reales estén entre el límite mínimo y máximo.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white rounded-lg p-3 border border-red-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-red-500 rounded"></div>
                    <span className="text-sm font-semibold text-gray-900">Escenario Pesimista (5%)</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Ventas mínimas esperadas. Útil para planificar presupuestos conservadores y gestión de riesgos.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-blue-500 rounded"></div>
                    <span className="text-sm font-semibold text-gray-900">Predicción Media</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Valor más probable según el modelo. Base para objetivos y metas del equipo.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-3 h-3 bg-green-500 rounded"></div>
                    <span className="text-sm font-semibold text-gray-900">Escenario Optimista (95%)</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Ventas máximas esperadas. Útil para preparar inventario extra y planificar recursos adicionales.
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-200">
                <p className="text-xs text-gray-700">
                  <strong>💡 Consejo:</strong> Un intervalo amplio indica mayor incertidumbre. 
                  Para reducirlo, entrena el modelo con más datos históricos o verifica que no haya anomalías en las ventas recientes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionsDashboard;
