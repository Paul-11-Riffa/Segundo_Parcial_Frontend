/**
 * Modal de Comando de Voz - Centro de Interacción
 * Gestiona todos los estados de la interacción con el usuario:
 * 1. IDLE: Listo para escuchar
 * 2. LISTENING: Grabando audio
 * 3. PROCESSING: Backend procesando
 * 4. GENERATING: Generando PDF
 * 5. SUCCESS: Reporte generado
 * 6. ERROR: Error en el proceso
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../ui/dialog';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import {
  Mic,
  MicOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Download,
  FileText,
  X,
  HelpCircle,
  Info,
  Lightbulb
} from 'lucide-react';
import VoiceWaveAnimation from './VoiceWaveAnimation';
import { COMMAND_EXAMPLES } from '../../../services/admin/voiceCommandService';

const VoiceCommandModal = ({ 
  isOpen, 
  onClose,
  // Estado del comando de voz (viene del padre)
  state,
  transcribedText,
  reportData,
  error,
  suggestions,
  processingMessage,
  isListening,
  // Acciones (callbacks del padre)
  startListening,
  stopListening,
  processTextCommand,
  resetState,
  STATES
}) => {
  const [manualInput, setManualInput] = useState('');
  const [showExamples, setShowExamples] = useState(false);

  // Limpiar estado cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      setManualInput('');
      setShowExamples(false);
    }
  }, [isOpen]);

  // Manejadores de acciones
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualInput.trim()) {
      processTextCommand(manualInput.trim());
      setManualInput('');
    }
  };

  const handleTryAgain = () => {
    resetState();
  };

  const handleClose = () => {
    resetState();
    setManualInput('');
    setShowExamples(false);
    onClose();
  };

  const handleDownloadReport = (format = 'pdf') => {
    if (reportData && reportData.file_url) {
      window.open(reportData.file_url, '_blank');
    }
  };

  const handleExampleClick = (example) => {
    setManualInput(example);
    setShowExamples(false);
  };

  // Renderizado condicional según el estado
  const renderContent = () => {
    switch (state) {
      // ===== ESTADO 1: LISTO PARA ESCUCHAR =====
      case STATES.IDLE:
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            {/* Info Banner */}
            <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  ¿Cómo funciona?
                </p>
                <p className="text-xs text-blue-700">
                  Presiona el micrófono y di tu comando en español, o escríbelo manualmente. 
                  Puedo generar 14 tipos de reportes diferentes en PDF o Excel.
                </p>
              </div>
            </div>

            <button
              onClick={handleMicClick}
              className="group relative w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              <Mic className="absolute inset-0 m-auto w-16 h-16 text-white" />
              <div className="absolute inset-0 rounded-full bg-blue-400 opacity-0 group-hover:opacity-20 animate-pulse"></div>
            </button>

            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-gray-700">
                Presiona el ícono y habla
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Info className="w-4 h-4" />
                <span>Ejemplo: "Genera el reporte de ventas del último mes en PDF"</span>
              </div>
            </div>

            {/* Input manual alternativo */}
            <div className="w-full max-w-md space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">O escribe tu comando</span>
                </div>
              </div>

              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <Input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Ejemplo: Reporte de ventas del último mes..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!manualInput.trim()}>
                  Enviar
                </Button>
              </form>

              <button
                onClick={() => setShowExamples(!showExamples)}
                className="flex items-center justify-center w-full text-sm text-blue-600 hover:text-blue-700 gap-1"
              >
                <HelpCircle className="w-4 h-4" />
                {showExamples ? 'Ocultar ejemplos' : 'Ver ejemplos de comandos'}
              </button>

              {showExamples && (
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-3 flex items-center gap-1">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    Comandos que puedes usar:
                  </p>
                  {COMMAND_EXAMPLES.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(example)}
                      className="block w-full text-left text-sm text-gray-700 hover:text-blue-600 hover:bg-white px-3 py-2 rounded transition-colors border border-transparent hover:border-blue-200"
                    >
                      • {example}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      // ===== ESTADO 2: ESCUCHANDO =====
      case STATES.LISTENING:
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className="relative">
              <button
                onClick={handleMicClick}
                className="relative w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg focus:outline-none focus:ring-4 focus:ring-red-300 animate-pulse"
              >
                <Mic className="absolute inset-0 m-auto w-16 h-16 text-white" />
              </button>
              <div className="absolute -inset-4 rounded-full border-4 border-red-400 animate-ping opacity-50"></div>
            </div>

            <VoiceWaveAnimation isActive={true} />

            <div className="text-center space-y-2">
              <p className="text-xl font-semibold text-gray-800 animate-pulse">
                Escuchando...
              </p>
              {transcribedText && (
                <p className="text-sm text-gray-600 max-w-md px-4 py-2 bg-blue-50 rounded-lg">
                  "{transcribedText}"
                </p>
              )}
              <p className="text-xs text-gray-500">
                Presiona nuevamente para detener
              </p>
            </div>
          </div>
        );

      // ===== ESTADO 3: PROCESANDO =====
      case STATES.PROCESSING:
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className="relative w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            </div>

            <div className="text-center space-y-2">
              <p className="text-xl font-semibold text-gray-800">
                Procesando comando...
              </p>
              {transcribedText && (
                <div className="max-w-md px-4 py-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Comando recibido:
                  </p>
                  <p className="text-sm text-gray-600">
                    "{transcribedText}"
                  </p>
                </div>
              )}
              {processingMessage && (
                <p className="text-sm text-gray-500">
                  {processingMessage}
                </p>
              )}
            </div>
          </div>
        );

      // ===== ESTADO 4: GENERANDO PDF =====
      case STATES.GENERATING:
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className="relative w-32 h-32 rounded-full bg-green-100 flex items-center justify-center">
              <FileText className="w-16 h-16 text-green-600 animate-bounce" />
              <Loader2 className="absolute w-20 h-20 text-green-400 animate-spin" />
            </div>

            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <p className="text-xl font-semibold text-gray-800">
                  ¡Entendido!
                </p>
              </div>
              <p className="text-lg text-gray-700">
                Generando tu reporte...
              </p>
              <p className="text-sm text-gray-500">
                Esto puede tardar unos segundos
              </p>

              {/* Barra de progreso */}
              <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden mt-4">
                <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 animate-progress"></div>
              </div>
            </div>
          </div>
        );

      // ===== ESTADO 5: ÉXITO =====
      case STATES.SUCCESS:
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className="relative w-32 h-32 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-20 h-20 text-green-600 animate-bounce-once" />
            </div>

            <div className="text-center space-y-2">
              <p className="text-2xl font-bold text-green-600">
                ¡Reporte generado!
              </p>
              <p className="text-sm text-gray-600">
                Tu reporte está listo para descargar
              </p>
            </div>

            {/* Información del reporte */}
            {reportData && (
              <div className="w-full max-w-md bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-800">
                      {reportData.command_type || 'Reporte'}
                    </p>
                    {reportData.interpreted_params && (
                      <p className="text-sm text-gray-600">
                        {reportData.interpreted_params.period_text || 'Período personalizado'}
                      </p>
                    )}
                  </div>
                  {reportData.processing_time_ms && (
                    <span className="text-xs text-gray-500">
                      {reportData.processing_time_ms}ms
                    </span>
                  )}
                </div>

                {/* Estadísticas rápidas si están disponibles */}
                {reportData.result_data && reportData.result_data.summary && (
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    {Object.entries(reportData.result_data.summary).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="text-center">
                        <p className="text-xs text-gray-500 capitalize">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm font-semibold text-gray-800">
                          {typeof value === 'number' ? value.toLocaleString() : value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex gap-3">
              <Button
                onClick={() => handleDownloadReport('pdf')}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar PDF
              </Button>
              <Button
                onClick={handleTryAgain}
                variant="outline"
              >
                Nuevo reporte
              </Button>
            </div>
          </div>
        );

      // ===== ESTADO 6: ERROR =====
      case STATES.ERROR:
      case STATES.LOW_CONFIDENCE:
        return (
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className="relative w-32 h-32 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-20 h-20 text-red-600" />
            </div>

            <div className="text-center space-y-2">
              <p className="text-xl font-semibold text-gray-800">
                {state === STATES.LOW_CONFIDENCE ? 'No estoy seguro...' : 'Algo salió mal'}
              </p>
              <p className="text-sm text-red-600 max-w-md">
                {error || 'Ocurrió un error inesperado'}
              </p>

              {/* Sugerencias si las hay */}
              {suggestions && suggestions.length > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200 max-w-md">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    ¿Quisiste decir?
                  </p>
                  <div className="space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => processTextCommand(suggestion)}
                        className="block w-full text-left text-sm text-blue-600 hover:text-blue-700 hover:bg-white px-3 py-2 rounded transition-colors"
                      >
                        • {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button onClick={handleTryAgain} className="flex items-center gap-2">
              <MicOff className="w-4 h-4" />
              Intentar de nuevo
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Comando de Voz
            </DialogTitle>
            <button
              onClick={handleClose}
              className="rounded-full p-1 hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <DialogDescription>
            {state === STATES.IDLE && '¿Qué reporte necesitas?'}
            {state === STATES.LISTENING && 'Estoy escuchando tu comando...'}
            {state === STATES.PROCESSING && 'Analizando tu solicitud...'}
            {state === STATES.GENERATING && 'Creando tu reporte personalizado...'}
            {state === STATES.SUCCESS && '¡Listo para descargar!'}
            {(state === STATES.ERROR || state === STATES.LOW_CONFIDENCE) && 'Inténtalo nuevamente'}
          </DialogDescription>
        </DialogHeader>

        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default VoiceCommandModal;
