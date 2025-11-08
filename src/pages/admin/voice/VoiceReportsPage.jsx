/**
 * Página de Generación de Reportes por Voz
 * Interfaz simple y directa para generar reportes mediante comandos de voz o texto
 */

import React, { useState } from 'react';
import { 
  Mic, 
  MicOff,
  Download, 
  Loader2,
  CheckCircle2, 
  XCircle,
  FileText,
  FileSpreadsheet,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import useVoiceCommand from '../../../hooks/admin/useVoiceCommand';
import { downloadReport } from '../../../services/admin/voiceCommandService';
import './VoiceReportsPage.css';

const VoiceReportsPage = () => {
  const [textInput, setTextInput] = useState('');
  const [downloadingFormat, setDownloadingFormat] = useState(null);

  // Hook de comando de voz
  const {
    state,
    transcribedText,
    reportData,
    commandId,
    error,
    errorDetails,
    suggestions,
    processingMessage,
    isListening,
    startListening,
    stopListening,
    processTextCommand,
    resetState,
    STATES
  } = useVoiceCommand();

  // Manejar envío de texto
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textInput.trim()) {
      processTextCommand(textInput.trim());
      setTextInput('');
    }
  };

  // Manejar clic en micrófono
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Manejar descarga
  const handleDownload = async (format) => {
    try {
      setDownloadingFormat(format);
      const target = reportData?.file_url || commandId;
      if (target) {
        await downloadReport(target, format);
      }
    } catch (err) {
      console.error('Error descargando:', err);
    } finally {
      setDownloadingFormat(null);
    }
  };

  // Determinar si mostrar botones de descarga
  const canDownload = reportData && (reportData.file_url || commandId) && state === STATES.SUCCESS;

  return (
    <div className="voice-reports-container">
      <div className="voice-reports-wrapper">
        {/* Header */}
        <div className="voice-reports-header">
          <div className="voice-reports-icon">
            <Sparkles />
          </div>
          <h1>Reportes por Comando de Voz</h1>
          <p>Genera reportes inteligentes usando lenguaje natural</p>
        </div>

        {/* Área de Input Principal */}
        <div className="voice-reports-input-card">
          <form onSubmit={handleTextSubmit} className="voice-reports-form">
            {/* Input de texto con botón de micrófono */}
            <div className="voice-reports-input-group">
              <label className="voice-reports-label">
                📝 Escribe o habla tu comando
              </label>
              
              <div className="voice-reports-input-wrapper">
                {/* Input de texto */}
                <div className="voice-reports-input-container">
                  <input
                    type="text"
                    value={isListening ? transcribedText : textInput}
                    onChange={(e) => !isListening && setTextInput(e.target.value)}
                    placeholder='Ejemplo: "Genera el reporte de ventas del último mes"'
                    disabled={isListening || state === STATES.PROCESSING}
                    className="voice-reports-input"
                  />
                  
                  {/* Indicador de escucha */}
                  {isListening && (
                    <div className="voice-reports-listening-indicator">
                      <div className="voice-reports-listening-dot" />
                      <span className="voice-reports-listening-text">Escuchando...</span>
                    </div>
                  )}
                </div>

                {/* Botón de Micrófono */}
                <button
                  type="button"
                  onClick={handleMicClick}
                  disabled={state === STATES.PROCESSING}
                  className={`voice-reports-mic-button ${isListening ? 'listening' : 'idle'}`}
                  title={isListening ? 'Detener grabación' : 'Iniciar grabación de voz'}
                >
                  {isListening ? (
                    <>
                      <MicOff />
                      <span className="hidden sm:inline">Detener</span>
                    </>
                  ) : (
                    <>
                      <Mic />
                      <span className="hidden sm:inline">Hablar</span>
                    </>
                  )}
                </button>

                {/* Botón de Enviar (solo visible si hay texto) */}
                {textInput && !isListening && (
                  <button
                    type="submit"
                    disabled={state === STATES.PROCESSING}
                    className="voice-reports-submit-button"
                  >
                    Generar
                  </button>
                )}
              </div>
            </div>

            {/* Mensaje de ayuda */}
            <div className="voice-reports-help">
              <AlertCircle className="voice-reports-help-icon" />
              <div className="voice-reports-help-content">
                <p>💡 Ejemplos de comandos:</p>
                <ul>
                  <li>• "Genera el reporte de ventas del último mes"</li>
                  <li>• "Muéstrame las estadísticas de productos más vendidos"</li>
                  <li>• "Crea un reporte de inventario actual"</li>
                </ul>
              </div>
            </div>
          </form>
        </div>

        {/* Área de Resultados */}
        <div className="voice-reports-results-card">
          {/* Estado: Idle */}
          {state === STATES.IDLE && (
            <div className="voice-reports-state">
              <div className="voice-reports-state-icon idle">
                <Mic />
              </div>
              <h3>¿Listo para comenzar?</h3>
              <p>Escribe o usa el micrófono para generar tu reporte</p>
            </div>
          )}

          {/* Estado: Listening */}
          {state === STATES.LISTENING && (
            <div className="voice-reports-state">
              <div className="voice-reports-state-icon listening">
                <Mic />
              </div>
              <h3>🎤 Escuchando...</h3>
              <p>Habla ahora para dictar tu comando</p>
              {transcribedText && (
                <p className="voice-reports-transcription">
                  "{transcribedText}"
                </p>
              )}
            </div>
          )}

          {/* Estado: Processing */}
          {state === STATES.PROCESSING && (
            <div className="voice-reports-state">
              <div className="voice-reports-state-icon processing">
                <Loader2 />
              </div>
              <h3>🔄 Procesando tu solicitud...</h3>
              <p>{processingMessage || 'Generando tu reporte, por favor espera'}</p>
            </div>
          )}

          {/* Estado: Success */}
          {state === STATES.SUCCESS && reportData && (
            <div className="voice-reports-success-content">
              <div className="voice-reports-state">
                <div className="voice-reports-state-icon success">
                  <CheckCircle2 />
                </div>
                <h3>✅ ¡Reporte generado con éxito!</h3>
                <p>Tu reporte está listo para descargar</p>

                {/* Botones de descarga */}
                {canDownload && (
                  <div className="voice-reports-download-buttons">
                    {/* Descargar PDF */}
                    <button
                      onClick={() => handleDownload('pdf')}
                      disabled={downloadingFormat !== null}
                      className="voice-reports-download-button pdf"
                    >
                      {downloadingFormat === 'pdf' ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <FileText />
                      )}
                      <span>Descargar PDF</span>
                      <Download />
                    </button>

                    {/* Descargar Excel */}
                    <button
                      onClick={() => handleDownload('excel')}
                      disabled={downloadingFormat !== null}
                      className="voice-reports-download-button excel"
                    >
                      {downloadingFormat === 'excel' ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <FileSpreadsheet />
                      )}
                      <span>Descargar Excel</span>
                      <Download />
                    </button>
                  </div>
                )}

                {/* Botón para nuevo reporte */}
                <button
                  onClick={resetState}
                  className="voice-reports-new-button"
                >
                  + Generar otro reporte
                </button>
              </div>

              {/* Información del reporte */}
              {reportData && (
                <div className="voice-reports-details">
                  <h4>📋 Detalles del reporte:</h4>
                  {reportData.command_type && (
                    <p>
                      <span>Tipo:</span> {reportData.command_type}
                    </p>
                  )}
                  {reportData.created_at && (
                    <p>
                      <span>Generado:</span>{' '}
                      {new Date(reportData.created_at).toLocaleString('es-ES')}
                    </p>
                  )}
                  {commandId && (
                    <p>
                      <span>ID:</span> {commandId}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Estado: Error */}
          {state === STATES.ERROR && (
            <div className="voice-reports-success-content">
              <div className="voice-reports-state">
                <div className="voice-reports-state-icon error">
                  <XCircle />
                </div>
                <h3>❌ Error al generar el reporte</h3>
                <p>{error || 'Ocurrió un error inesperado'}</p>

                {/* Detalles del error */}
                {errorDetails && typeof errorDetails === 'object' && Object.keys(errorDetails).length > 0 && (
                  <div className="voice-reports-error-details">
                    <h4>Detalles del error:</h4>
                    <ul>
                      {Object.entries(errorDetails).map(([field, msgs]) => (
                        <li key={field}>
                          <span>{field}:</span>{' '}
                          {Array.isArray(msgs) ? msgs.join(', ') : String(msgs)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sugerencias */}
                {suggestions && suggestions.length > 0 && (
                  <div className="voice-reports-suggestions">
                    <h4>💡 Sugerencias:</h4>
                    <ul>
                      {suggestions.map((suggestion, idx) => (
                        <li key={idx}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Botón de reintentar */}
                <button
                  onClick={resetState}
                  className="voice-reports-retry-button"
                >
                  🔄 Intentar de nuevo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer con tips */}
        <div className="voice-reports-footer">
          <p>
            💡 <strong>Tip:</strong> Sé específico con tus comandos para obtener mejores resultados
          </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceReportsPage;
