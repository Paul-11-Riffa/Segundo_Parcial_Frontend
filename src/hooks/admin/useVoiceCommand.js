/**
 * Hook personalizado para gestionar comandos de voz
 * Maneja todos los estados de la interacción: escuchando, procesando, éxito, error
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { processVoiceCommand, COMMAND_STATES, getCommandDetails } from '../../services/admin/voiceCommandService';
import { devLog } from '../../utils/devLogger';

export const useVoiceCommand = () => {
  const [state, setState] = useState(COMMAND_STATES.IDLE);
  const [transcribedText, setTranscribedText] = useState('');
  const [reportData, setReportData] = useState(null);
  const [commandId, setCommandId] = useState(null);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  
  // Referencias para el reconocimiento de voz
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);
  const [isListening, setIsListening] = useState(false);
  const transcribedTextRef = useRef('');
  const stateRef = useRef(COMMAND_STATES.IDLE);
  const handleProcessCommandRef = useRef(null);

  // Helpers to keep refs in sync with state setters
  const setStateAndRef = useCallback((s) => {
    setState(s);
    stateRef.current = s;
  }, []);

  const setTranscribedTextAndRef = useCallback((t) => {
    setTranscribedText(t);
    transcribedTextRef.current = t;
  }, []);
  // Polling control
  const pollingRef = useRef({ cancelled: false, timerId: null, attempts: 0 });
  const [isPolling, setIsPolling] = useState(false);
  const [pollingAttempts, setPollingAttempts] = useState(0);
  const [lastPollingMessage, setLastPollingMessage] = useState('');
  const [lastPollingLink, setLastPollingLink] = useState(null);

  /**
   * Inicializa el reconocimiento de voz del navegador
   */
  const initializeSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech Recognition no está soportado en este navegador');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'es-ES'; // Español
    recognition.continuous = false; // Solo una frase
    recognition.interimResults = true; // Resultados mientras habla
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      devLog('🎤 Reconocimiento de voz iniciado');
      isListeningRef.current = true;
      setIsListening(true);
      setStateAndRef(COMMAND_STATES.LISTENING);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');

  devLog('📝 Transcripción:', transcript);
  setTranscribedTextAndRef(transcript);

      // Si es el resultado final, procesar
      if (event.results[0].isFinal) {
        devLog('✅ Resultado final:', transcript);
      }
    };

    recognition.onerror = (event) => {
      console.error('❌ Error en reconocimiento de voz:', event.error);
      
      let errorMessage = 'Error al reconocer la voz.';
      
      switch (event.error) {
        case 'no-speech':
          errorMessage = 'No se detectó ninguna voz. Por favor, intenta de nuevo.';
          break;
        case 'audio-capture':
          errorMessage = 'No se puede acceder al micrófono. Verifica los permisos.';
          break;
        case 'not-allowed':
          errorMessage = 'Permiso de micrófono denegado. Por favor, habilita el acceso.';
          break;
        case 'network':
          errorMessage = 'Error de red. Verifica tu conexión a internet.';
          break;
        default:
          errorMessage = `Error: ${event.error}`;
      }
      
      setError(errorMessage);
      setErrorDetails(null);
      setStateAndRef(COMMAND_STATES.ERROR);
      isListeningRef.current = false;
      setIsListening(false);
    };

    recognition.onend = () => {
      devLog('🛑 Reconocimiento de voz finalizado');
      isListeningRef.current = false;
      setIsListening(false);

      // Si tenemos texto transcrito, procesarlo usando refs para evitar stale closures
      const currentText = transcribedTextRef.current;
      const currentState = stateRef.current;
      if (currentText && currentState === COMMAND_STATES.LISTENING) {
        if (handleProcessCommandRef.current) handleProcessCommandRef.current(currentText);
      }
    };

    recognitionRef.current = recognition;
    return true;
  }, []);

  /**
   * Abre el modal y resetea el estado
   */
  const openModal = useCallback(() => {
    setIsModalOpen(true);
    setStateAndRef(COMMAND_STATES.IDLE);
    setTranscribedText('');
    setReportData(null);
    setCommandId(null);
    setError(null);
    setErrorDetails(null);
    setSuggestions([]);
    setProcessingMessage('');
    // Cancel any existing polling when opening for a fresh interaction
    pollingRef.current.cancelled = false;
    setIsPolling(false);
    setPollingAttempts(0);
  }, []);

  /**
   * Cierra el modal
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    stopListening();
    setStateAndRef(COMMAND_STATES.IDLE);
    // Cancel polling if user closes the modal
    pollingRef.current.cancelled = true;
    if (pollingRef.current.timerId) {
      clearTimeout(pollingRef.current.timerId);
      pollingRef.current.timerId = null;
    }
    setIsPolling(false);
  }, []);

  /**
   * Inicia la escucha (grabación de voz)
   */
  const startListening = useCallback(() => {
    if (isListeningRef.current) {
      devLog('Ya está escuchando');
      return;
    }

  // Resetear estado
  setTranscribedTextAndRef('');
    setError(null);
    setReportData(null);
    setSuggestions([]);

    // Inicializar reconocimiento si no existe
    if (!recognitionRef.current) {
      const initialized = initializeSpeechRecognition();
      if (!initialized) {
        setError('Tu navegador no soporta reconocimiento de voz. Por favor, escribe el comando manualmente.');
        setState(COMMAND_STATES.ERROR);
        return;
      }
    }

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Error al iniciar reconocimiento:', err);
      setError('No se pudo iniciar el reconocimiento de voz.');
      setState(COMMAND_STATES.ERROR);
    }
  }, [initializeSpeechRecognition]);

  /**
   * Detiene la escucha
   */
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, []);

  /**
   * Procesa el comando con el backend
   */
  const handleProcessCommand = useCallback(async (text) => {
    if (!text || text.trim().length === 0) {
      setError('Por favor, proporciona un comando válido.');
      setState(COMMAND_STATES.ERROR);
      return;
    }

  setStateAndRef(COMMAND_STATES.PROCESSING);
    setProcessingMessage(`Procesando: "${text}"`);
    setError(null);

    try {
      // Llamar al backend
      const result = await processVoiceCommand(text);

      if (!result.success) {
        setError(result.error || 'Error al procesar el comando.');
        setErrorDetails(result.details || null);
        setSuggestions(result.suggestions || []);
        setStateAndRef(COMMAND_STATES.ERROR);
        // Exponer el fallo como reportData para que la UI (drawer/list) pueda mostrar detalles
        const fallbackId = result.data?.command_id || result.data?.id || null;
        setReportData({
          id: fallbackId,
          status: 'FAILED',
          error: result.error || null,
          details: result.details || null
        });
        return;
      }

      const responseData = result.data;

      // Guardar command_id para descargas y polling
      const returnedId = responseData.command_id || responseData.id;
      if (returnedId) {
        setCommandId(returnedId);
        devLog('✅ Command ID guardado:', returnedId);
      }

      // Si el backend indica fallo inmediato
      if (responseData.status === 'FAILED' || responseData.error_message) {
        setError(responseData.error_message || 'No se pudo procesar el comando.');
        setStateAndRef(COMMAND_STATES.ERROR);
        return;
      }

      // Si backend devuelve PROCESSING -> iniciar polling
      if (responseData.status === 'PROCESSING' && (returnedId || responseData.command_id)) {
        setStateAndRef(COMMAND_STATES.PROCESSING);
        setProcessingMessage(responseData.message || `Generando reporte...`);
        // iniciar polling asíncrono (no bloquear)
        startPolling(returnedId || responseData.command_id);
        return;
      }

      // Si backend devolvió resultado final (asumimos ya generado)
      if (responseData.status === 'EXECUTED' || responseData.status === 'SUCCESS' || responseData.status === 'COMPLETED' || responseData.file_url || responseData.result_data) {
  setStateAndRef(COMMAND_STATES.GENERATING);
        setProcessingMessage('¡Entendido! Generando tu reporte...');

        // Simular pequeño delay y mostrar resultado
        setTimeout(() => {
          setReportData(responseData);
          setStateAndRef(COMMAND_STATES.SUCCESS);
          setProcessingMessage('');
        }, 800);
        return;
      }

      // Fallback
      setReportData(responseData);
      setStateAndRef(COMMAND_STATES.SUCCESS);
      setProcessingMessage('');
    } catch (err) {
      console.error('Error procesando comando:', err);
      setError('Error inesperado al procesar el comando. Por favor, intenta de nuevo.');
      setErrorDetails(null);
      setStateAndRef(COMMAND_STATES.ERROR);
    }
  }, []);

  // Keep a ref to the latest handleProcessCommand to avoid stale closures in recognition handlers
  useEffect(() => {
    handleProcessCommandRef.current = handleProcessCommand;
  }, [handleProcessCommand]);

  /**
   * Inicia polling para un comando que está en estado PROCESSING
   * Usa backoff exponencial con límite de intentos. Permite cancelar.
   */
  const startPolling = useCallback((id, opts = {}) => {
    if (!id) return;

    // Cancel cualquier polling previo
    pollingRef.current.cancelled = false;
    if (pollingRef.current.timerId) {
      clearTimeout(pollingRef.current.timerId);
    }

    const maxAttempts = opts.maxAttempts || 8; // intentos totales
    const baseDelay = opts.baseDelay || 1000; // ms
    const maxTotalMs = opts.maxTotalMs || 60000; // timeout total

    pollingRef.current.attempts = 0;
    setIsPolling(true);
    setPollingAttempts(0);

    const startTime = Date.now();

    const attempt = async () => {
      devLog(`Polling attempt #${pollingRef.current.attempts + 1} for id=${id}`);
      setLastPollingMessage(`Intento ${pollingRef.current.attempts + 1} para ${id}...`);
      if (pollingRef.current.cancelled) {
        setIsPolling(false);
        setLastPollingMessage('Polling cancelado por el usuario.');
        return;
      }

      pollingRef.current.attempts += 1;
      setPollingAttempts(pollingRef.current.attempts);

      try {
  const res = await getCommandDetails(id);
        if (!res.success) {
          // Error obteniendo detalles -> mostrar error y detener
          setError(res.error || 'Error consultando estado del reporte.');
          setErrorDetails(res.details || null);
          setStateAndRef(COMMAND_STATES.ERROR);
          setIsPolling(false);
          return;
        }

        const data = res.data;

        // Si sigue PROCESSING, planificar nuevo intento
        if (data.status === 'PROCESSING') {
          devLog(`Respuesta mock/process: status=PROCESSING for ${id} (attempt ${pollingRef.current.attempts})`);
          setLastPollingMessage(`Servidor: PROCESSING (intento ${pollingRef.current.attempts})`);
          // Si excede timeout total
          if (Date.now() - startTime > maxTotalMs || pollingRef.current.attempts >= maxAttempts) {
            setError('El servidor está tardando en generar el reporte. Puedes intentarlo más tarde o revisar el historial.');
            setLastPollingMessage('Timeout de polling: servidor tardó demasiado.');
            setStateAndRef(COMMAND_STATES.ERROR);
            setIsPolling(false);
            return;
          }

          // Exponencial backoff
          const delay = Math.min(baseDelay * Math.pow(2, pollingRef.current.attempts - 1), 10000);
          pollingRef.current.timerId = setTimeout(attempt, delay);
          return;
        }

        // Si el estado es final
        if (data.status === 'FAILED' || data.error_message) {
          devLog('Polling result: FAILED for', id, data.error_message);
          setLastPollingMessage(data.error_message || 'El servidor devolvió FAILED.');
          setError(data.error_message || 'No se pudo generar el reporte.');
          // Mostrar detalles si el backend los incluye
          if (data.details) setReportData(data);
          setStateAndRef(COMMAND_STATES.ERROR);
          setIsPolling(false);
          return;
        }

        // Éxito
  devLog('Polling result: SUCCESS for', id, data);
        setLastPollingMessage('Reporte generado correctamente.');
  setReportData(data);
  setStateAndRef(COMMAND_STATES.SUCCESS);
        setProcessingMessage('');
        // En modo desarrollo, exponer link para que la UI muestre un toast con el enlace
        if (import.meta.env.DEV && data?.file_url) {
          setLastPollingLink(data.file_url);
          setLastPollingMessage('Reporte listo: haz clic en el enlace para ver el PDF.');
          devLog('DEV: Reporte listo, link guardado en lastPollingLink ->', data.file_url);
        }
        setIsPolling(false);
        return;
      } catch (err) {
        console.error('Error en polling de reporte:', err);
        setError('Error consultando estado del reporte.');
        setErrorDetails(null);
        setStateAndRef(COMMAND_STATES.ERROR);
        setIsPolling(false);
        return;
      }
    };

    // Ejecutar primer intento inmediatamente
    attempt();
  }, []);

  const cancelPolling = useCallback(() => {
    pollingRef.current.cancelled = true;
    if (pollingRef.current.timerId) {
      clearTimeout(pollingRef.current.timerId);
      pollingRef.current.timerId = null;
    }
    setIsPolling(false);
    setPollingAttempts(pollingRef.current.attempts || 0);
    setLastPollingMessage('Polling cancelado por el usuario.');
  }, []);

  const clearLastPolling = useCallback(() => {
    setLastPollingMessage('');
    setLastPollingLink(null);
  }, []);

  /**
   * Procesa un comando de texto (sin voz)
   */
  const processTextCommand = useCallback(async (text) => {
    setTranscribedTextAndRef(text);
    await handleProcessCommand(text);
  }, [handleProcessCommand]);

  /**
   * Reinicia el estado para un nuevo comando
   */
  const resetState = useCallback(() => {
    setStateAndRef(COMMAND_STATES.IDLE);
    setTranscribedTextAndRef('');
    setReportData(null);
    setCommandId(null);
    setError(null);
    setErrorDetails(null);
    setSuggestions([]);
    setProcessingMessage('');
  }, []);

  return {
    // Estado
    state,
    transcribedText,
    reportData,
    commandId,
    error,
  errorDetails,
    suggestions,
    isModalOpen,
    processingMessage,
    isListening,

    // Acciones del modal
    openModal,
    closeModal,

  // Acciones de voz
    startListening,
    stopListening,
    processTextCommand,
    resetState,
  // Polling
  isPolling,
  pollingAttempts,
  cancelPolling,
  startPolling,
    lastPollingMessage,
    lastPollingLink,
    clearLastPolling,

    // Estados posibles (para comparación)
    STATES: COMMAND_STATES
  };
};

export default useVoiceCommand;
