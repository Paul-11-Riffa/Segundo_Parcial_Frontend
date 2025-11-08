import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/api';
import EmptyState from '../components/dashboard/EmptyState';
import './TrainModelPage.css';

/**
 * Página para entrenar el modelo de Machine Learning
 * Diseño minimalista moderno con CSS puro
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
    <div className="train-model-header">
      <button onClick={handleBack} className="train-model-back-button">
        <span>←</span>
        <span>Volver</span>
      </button>

      <div>
        <h1>Entrenar Modelo de Machine Learning</h1>
        <p>Configura y entrena el modelo predictivo de ventas</p>
      </div>
    </div>
  );

  /**
   * Renderiza el formulario de entrenamiento
   */
  const renderTrainingForm = () => (
    <div className="train-model-form-card">
      <h3>Configuración de Entrenamiento</h3>
      <p className="subtitle">Configura los parámetros del modelo</p>

      <form onSubmit={handleTrainModel} className="train-model-form">
        {/* Días de entrenamiento */}
        <div className="training-options-section">
          <label>Periodo de Entrenamiento</label>
          <div className="training-options-grid">
            {trainingOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTrainingDays(option.value)}
                disabled={isTraining}
                className={`training-option-card ${
                  trainingDays === option.value ? 'selected' : ''
                }`}
              >
                <div className="training-option-header">
                  <span className="training-option-label">{option.label}</span>
                  {trainingDays === option.value && (
                    <span className="training-option-check">✓</span>
                  )}
                </div>
                <p className="training-option-description">{option.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Versión del modelo */}
        <div className="form-group">
          <label htmlFor="version">Versión del Modelo (Opcional)</label>
          <input
            type="text"
            id="version"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            disabled={isTraining}
            placeholder="Ej: v2.1, beta-3, producción"
            className="form-input"
          />
          <p className="form-hint">
            Etiqueta para identificar esta versión del modelo
          </p>
        </div>

        {/* Notas */}
        <div className="form-group">
          <label htmlFor="notes">Notas (Opcional)</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isTraining}
            rows={4}
            placeholder="Describe los cambios o características de este entrenamiento..."
            className="form-textarea"
          />
        </div>

        {/* Botón de entrenar */}
        <div className="form-footer">
          <div className="form-footer-warning">
            <p>
              <strong>Advertencia:</strong> El entrenamiento puede tardar varios minutos.
            </p>
          </div>
          <button
            type="submit"
            disabled={isTraining}
            className="train-model-button"
          >
            <span>🤖</span>
            <span>{isTraining ? 'Entrenando...' : 'Iniciar Entrenamiento'}</span>
          </button>
        </div>
      </form>
    </div>
  );

  /**
   * Renderiza la barra de progreso
   */
  const renderProgress = () => {
    if (!isTraining && progress === 0) return null;

    return (
      <div className="progress-card">
        <h3>Progreso del Entrenamiento</h3>
        
        <div className="progress-section">
          {/* Barra de progreso */}
          <div className="progress-bar-container">
            <div className="progress-bar-header">
              <span className="progress-bar-label">
                {progress < 100 ? 'Entrenando modelo...' : 'Entrenamiento completado'}
              </span>
              <span className="progress-bar-percentage">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Mensajes de estado */}
          <div className={`progress-status ${progress === 100 ? 'success' : ''}`}>
            <span className="progress-status-icon">
              {progress < 100 ? '⏳' : '✅'}
            </span>
            <div className="progress-status-text">
              <p className="progress-status-title">
                {progress < 30 && 'Cargando datos de entrenamiento...'}
                {progress >= 30 && progress < 60 && 'Procesando características...'}
                {progress >= 60 && progress < 90 && 'Entrenando algoritmo de ML...'}
                {progress >= 90 && progress < 100 && 'Validando modelo...'}
                {progress === 100 && '¡Modelo entrenado exitosamente!'}
              </p>
              {progress === 100 && (
                <p className="progress-status-subtitle">
                  El modelo está listo para realizar predicciones
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
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
      <div className="results-card">
        <h3>Resultados del Entrenamiento</h3>
        <p className="subtitle">Métricas del modelo</p>

        {/* Métricas principales */}
        <div className="results-metrics-grid">
          <div className="result-metric-card success">
            <p className="result-metric-label">Precisión (R²)</p>
            <p className="result-metric-value">
              {metrics.r2_score ? (metrics.r2_score * 100).toFixed(2) : 'N/A'}%
            </p>
            <p className="result-metric-description">
              {metrics.r2_score >= 0.8 ? 'Excelente' : metrics.r2_score >= 0.6 ? 'Bueno' : 'Regular'}
            </p>
          </div>

          <div className="result-metric-card info">
            <p className="result-metric-label">Muestras</p>
            <p className="result-metric-value">
              {metrics.training_samples || info.training_samples || 'N/A'}
            </p>
            <p className="result-metric-description">
              Datos de entrenamiento
            </p>
          </div>

          <div className="result-metric-card warning">
            <p className="result-metric-label">Error MAE</p>
            <p className="result-metric-value">
              {metrics.mae ? metrics.mae.toFixed(2) : 'N/A'}
            </p>
            <p className="result-metric-description">
              Error absoluto medio
            </p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="results-info-section">
          <h4>Información del Modelo</h4>
          <div className="results-info-grid">
            {info.version && (
              <div className="results-info-item">
                <span className="label">Versión:</span>
                <span className="value">{info.version}</span>
              </div>
            )}
            {info.training_days && (
              <div className="results-info-item">
                <span className="label">Días de entrenamiento:</span>
                <span className="value">{info.training_days}</span>
              </div>
            )}
            {result.message && (
              <div className="results-info-item" style={{ gridColumn: '1 / -1' }}>
                <span className="label">Mensaje:</span>
                <span className="value">{result.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="results-actions">
          <button
            onClick={handleViewPredictions}
            className="results-button-primary"
          >
            <span>📈</span>
            <span>Ver Predicciones</span>
          </button>
          
          <button
            onClick={() => {
              setResult(null);
              setProgress(0);
            }}
            className="results-button-secondary"
          >
            Entrenar de Nuevo
          </button>
        </div>
      </div>
    );
  };

  /**
   * Renderiza el estado de error
   */
  const renderError = () => {
    if (!error) return null;

    return (
      <div className="error-card">
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
      </div>
    );
  };

  /**
   * Renderiza información sobre el entrenamiento
   */
  const renderInfo = () => (
    <div className="train-model-info-banner">
      <div className="train-model-info-content">
        <span className="train-model-info-icon">ℹ️</span>
        <div className="train-model-info-text">
          <h3>Sobre el Entrenamiento del Modelo</h3>
          <ul className="train-model-info-list">
            <li>El modelo utiliza datos históricos de ventas para predecir tendencias futuras</li>
            <li>Mayor cantidad de días = mayor precisión (recomendado: 90 días)</li>
            <li>El entrenamiento puede tardar de 2 a 10 minutos dependiendo del periodo</li>
            <li>Se recomienda reentrenar el modelo semanalmente para mantener la precisión</li>
            <li>Las predicciones mejoran con más datos históricos disponibles</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="train-model-container">
      {renderHeader()}
      {renderInfo()}
      {!result && renderTrainingForm()}
      {renderProgress()}
      {renderError()}
      {renderResults()}
    </div>
  );
};

export default TrainModelPage;
