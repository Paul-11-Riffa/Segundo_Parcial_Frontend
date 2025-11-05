import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/api';

// Components
import ChartCard from '../components/dashboard/ChartCard';
import EmptyState from '../components/dashboard/EmptyState';
import '../components/dashboard/dashboard.css';
import './pages.css';

/**
 * Página para entrenar el modelo de Machine Learning
 * Permite configurar parámetros y entrenar el modelo predictivo
 */
const TrainModelPage = () => {
  const navigate = useNavigate();

  // Estado del formulario
  const [trainingDays, setTrainingDays] = useState(90);
  const [notes, setNotes] = useState('');
  const [version, setVersion] = useState('');

  // Estado de la operación
  const [isTraining, setIsTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Opciones de días de entrenamiento
   */
  const trainingOptions = [
    { value: 30, label: '30 días', description: 'Entrenamiento rápido, menor precisión' },
    { value: 60, label: '60 días', description: 'Balance entre velocidad y precisión' },
    { value: 90, label: '90 días', description: 'Recomendado - Buena precisión' },
    { value: 180, label: '180 días', description: 'Mayor precisión, más tiempo' },
    { value: 365, label: '1 año', description: 'Máxima precisión, incluye estacionalidad' },
  ];

  /**
   * Volver al dashboard
   */
  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  /**
   * Ver predicciones
   */
  const handleViewPredictions = () => {
    navigate('/admin/dashboard/predictions');
  };

  /**
   * Simula el progreso del entrenamiento
   */
  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 95) {
        clearInterval(interval);
        setProgress(95);
      } else {
        setProgress(Math.min(currentProgress, 95));
      }
    }, 500);
    return interval;
  };

  /**
   * Maneja el entrenamiento del modelo
   */
  const handleTrainModel = async (e) => {
    e.preventDefault();
    
    setIsTraining(true);
    setProgress(0);
    setError(null);
    setResult(null);

    // Simular progreso
    const progressInterval = simulateProgress();

    try {
      const response = await dashboardService.trainMLModel({
        training_days: trainingDays,
        notes: notes || undefined,
        version: version || undefined,
      });

      clearInterval(progressInterval);
      setProgress(100);
      setResult(response);
      
      // Limpiar formulario
      setNotes('');
      setVersion('');
    } catch (err) {
      clearInterval(progressInterval);
      console.error('Error training model:', err);
      setError(err.response?.data?.message || 'Error al entrenar el modelo');
    } finally {
      setIsTraining(false);
    }
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

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Entrenar Modelo de Machine Learning
        </h1>
        <p className="text-gray-600 mt-2">
          Configura y entrena el modelo predictivo de ventas
        </p>
      </div>
    </div>
  );

  /**
   * Renderiza el formulario de entrenamiento
   */
  const renderTrainingForm = () => (
    <ChartCard title="Configuración de Entrenamiento" subtitle="Configura los parámetros del modelo">
      <form onSubmit={handleTrainModel} className="space-y-6">
        {/* Días de entrenamiento */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            Periodo de Entrenamiento
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trainingOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTrainingDays(option.value)}
                disabled={isTraining}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                  trainingDays === option.value
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg font-bold text-gray-900">
                    {option.label}
                  </span>
                  {trainingDays === option.value && (
                    <span className="text-blue-600">✓</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Versión del modelo */}
        <div>
          <label htmlFor="version" className="block text-sm font-bold text-gray-900 mb-2">
            Versión del Modelo (Opcional)
          </label>
          <input
            type="text"
            id="version"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            disabled={isTraining}
            placeholder="Ej: v2.1, beta-3, producción"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Etiqueta para identificar esta versión del modelo
          </p>
        </div>

        {/* Notas */}
        <div>
          <label htmlFor="notes" className="block text-sm font-bold text-gray-900 mb-2">
            Notas (Opcional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isTraining}
            rows={4}
            placeholder="Describe los cambios o características de este entrenamiento..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
          />
        </div>

        {/* Botón de entrenar */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p>
              <span className="font-bold">Advertencia:</span> El entrenamiento puede tardar
              varios minutos.
            </p>
          </div>
          <button
            type="submit"
            disabled={isTraining}
            className="button button-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
          >
            <span>🤖</span>
            <span>{isTraining ? 'Entrenando...' : 'Iniciar Entrenamiento'}</span>
          </button>
        </div>
      </form>
    </ChartCard>
  );

  /**
   * Renderiza la barra de progreso
   */
  const renderProgress = () => {
    if (!isTraining && progress === 0) return null;

    return (
      <ChartCard title="Progreso del Entrenamiento">
        <div className="space-y-4">
          {/* Barra de progreso */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                {progress < 100 ? 'Entrenando modelo...' : 'Entrenamiento completado'}
              </span>
              <span className="text-sm font-bold text-gray-900">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Mensajes de estado */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">
                {progress < 100 ? '⏳' : '✅'}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  {progress < 30 && 'Cargando datos de entrenamiento...'}
                  {progress >= 30 && progress < 60 && 'Procesando características...'}
                  {progress >= 60 && progress < 90 && 'Entrenando algoritmo de ML...'}
                  {progress >= 90 && progress < 100 && 'Validando modelo...'}
                  {progress === 100 && '¡Modelo entrenado exitosamente!'}
                </p>
                {progress === 100 && (
                  <p className="text-xs text-blue-700 mt-1">
                    El modelo está listo para realizar predicciones
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </ChartCard>
    );
  };

  /**
   * Renderiza los resultados del entrenamiento
   */
  const renderResults = () => {
    if (!result) return null;

    const metrics = result.metrics || {};
    const info = result.model_info || {};

    return (
      <ChartCard title="Resultados del Entrenamiento" subtitle="Métricas del modelo">
        <div className="space-y-6">
          {/* Métricas principales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700 mb-1">Precisión (R²)</p>
              <p className="text-3xl font-bold text-green-900">
                {metrics.r2_score ? (metrics.r2_score * 100).toFixed(2) : 'N/A'}%
              </p>
              <p className="text-xs text-green-600 mt-1">
                {metrics.r2_score >= 0.8 ? 'Excelente' : metrics.r2_score >= 0.6 ? 'Bueno' : 'Regular'}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-700 mb-1">Muestras</p>
              <p className="text-3xl font-bold text-blue-900">
                {metrics.training_samples || info.training_samples || 'N/A'}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Datos de entrenamiento
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-700 mb-1">Error MAE</p>
              <p className="text-3xl font-bold text-purple-900">
                {metrics.mae ? metrics.mae.toFixed(2) : 'N/A'}
              </p>
              <p className="text-xs text-purple-600 mt-1">
                Error absoluto medio
              </p>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Información del Modelo</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {info.version && (
                <div>
                  <span className="text-gray-600">Versión:</span>
                  <span className="ml-2 font-medium text-gray-900">{info.version}</span>
                </div>
              )}
              {info.training_days && (
                <div>
                  <span className="text-gray-600">Días de entrenamiento:</span>
                  <span className="ml-2 font-medium text-gray-900">{info.training_days}</span>
                </div>
              )}
              {result.message && (
                <div className="md:col-span-2">
                  <span className="text-gray-600">Mensaje:</span>
                  <span className="ml-2 font-medium text-gray-900">{result.message}</span>
                </div>
              )}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-center gap-4 pt-4">
            <button
              onClick={handleViewPredictions}
              className="button button-primary flex items-center gap-2 font-bold"
            >
              <span>📈</span>
              <span>Ver Predicciones</span>
            </button>
            
            <button
              onClick={() => {
                setResult(null);
                setProgress(0);
              }}
              className="button button-secondary font-bold"
            >
              Entrenar de Nuevo
            </button>
          </div>
        </div>
      </ChartCard>
    );
  };

  /**
   * Renderiza el estado de error
   */
  const renderError = () => {
    if (!error) return null;

    return (
      <ChartCard title="Error">
        <EmptyState
          icon="⚠️"
          title="Error al entrenar el modelo"
          description={error}
          actionText="Reintentar"
          onAction={() => {
            setError(null);
            setProgress(0);
          }}
        />
      </ChartCard>
    );
  };

  /**
   * Renderiza información sobre el entrenamiento
   */
  const renderInfo = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
      <div className="flex items-start gap-3">
        <span className="text-2xl">ℹ️</span>
        <div className="flex-1">
          <h3 className="font-bold text-blue-900 mb-2">
            Sobre el Entrenamiento del Modelo
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• El modelo utiliza datos históricos de ventas para predecir tendencias futuras</li>
            <li>• Mayor cantidad de días = mayor precisión (recomendado: 90 días)</li>
            <li>• El entrenamiento puede tardar de 2 a 10 minutos dependiendo del periodo</li>
            <li>• Se recomienda reentrenar el modelo semanalmente para mantener la precisión</li>
            <li>• Las predicciones mejoran con más datos históricos disponibles</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-page">
      <div className="max-w-5xl mx-auto">
        {renderHeader()}
        {renderInfo()}
        {!result && renderTrainingForm()}
        {renderProgress()}
        {renderError()}
        {renderResults()}
      </div>
    </div>
  );
};

export default TrainModelPage;
