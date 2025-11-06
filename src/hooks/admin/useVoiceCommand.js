/**
 * Hook personalizado para gestionar comandos de voz
 * Maneja todos los estados de la interacción: escuchando, procesando, éxito, error
 */

import { useState, useCallback, useRef } from 'react';
import { processVoiceCommand, COMMAND_STATES } from '../../services/admin/voiceCommandService';

export const useVoiceCommand = () => {
  const [state, setState] = useState(COMMAND_STATES.IDLE);
  const [transcribedText, setTranscribedText] = useState('');
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  
  // Referencias para el reconocimiento de voz
  const recognitionRef = useRef(null);
  const isListeningRef = useRef(false);

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
      console.log('🎤 Reconocimiento de voz iniciado');
      isListeningRef.current = true;
      setState(COMMAND_STATES.LISTENING);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');

      console.log('📝 Transcripción:', transcript);
      setTranscribedText(transcript);

      // Si es el resultado final, procesar
      if (event.results[0].isFinal) {
        console.log('✅ Resultado final:', transcript);
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
      setState(COMMAND_STATES.ERROR);
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      console.log('🛑 Reconocimiento de voz finalizado');
      isListeningRef.current = false;
      
      // Si tenemos texto transcrito, procesarlo
      if (transcribedText && state === COMMAND_STATES.LISTENING) {
        handleProcessCommand(transcribedText);
      }
    };

    recognitionRef.current = recognition;
    return true;
  }, [transcribedText, state]);

  /**
   * Abre el modal y resetea el estado
   */
  const openModal = useCallback(() => {
    setIsModalOpen(true);
    setState(COMMAND_STATES.IDLE);
    setTranscribedText('');
    setReportData(null);
    setError(null);
    setSuggestions([]);
    setProcessingMessage('');
  }, []);

  /**
   * Cierra el modal
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    stopListening();
    setState(COMMAND_STATES.IDLE);
  }, []);

  /**
   * Inicia la escucha (grabación de voz)
   */
  const startListening = useCallback(() => {
    if (isListeningRef.current) {
      console.log('Ya está escuchando');
      return;
    }

    // Resetear estado
    setTranscribedText('');
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

    setState(COMMAND_STATES.PROCESSING);
    setProcessingMessage(`Procesando: "${text}"`);
    setError(null);

    try {
      // Llamar al backend
      const result = await processVoiceCommand(text);

      if (result.success) {
        const data = result.data.data || result.data;
        
        // Verificar el estado del comando
        if (data.status === 'FAILED' || data.error_message) {
          setError(data.error_message || 'No se pudo procesar el comando.');
          setState(COMMAND_STATES.ERROR);
          return;
        }

        // Verificar si es baja confianza
        if (data.confidence_score !== undefined && data.confidence_score < 0.5) {
          setError('No estoy seguro de haber entendido el comando. ¿Podrías ser más específico?');
          setSuggestions(data.suggestions || []);
          setState(COMMAND_STATES.LOW_CONFIDENCE);
          return;
        }

        // Estado de generación (simulado - el backend ya generó)
        setState(COMMAND_STATES.GENERATING);
        setProcessingMessage('¡Entendido! Generando tu reporte...');

        // Simular un pequeño delay para mejor UX
        setTimeout(() => {
          setReportData(data);
          setState(COMMAND_STATES.SUCCESS);
          setProcessingMessage('');
        }, 1000);

      } else {
        setError(result.error || 'Error al procesar el comando.');
        setSuggestions(result.suggestions || []);
        setState(COMMAND_STATES.ERROR);
      }
    } catch (err) {
      console.error('Error procesando comando:', err);
      setError('Error inesperado al procesar el comando. Por favor, intenta de nuevo.');
      setState(COMMAND_STATES.ERROR);
    }
  }, []);

  /**
   * Procesa un comando de texto (sin voz)
   */
  const processTextCommand = useCallback(async (text) => {
    setTranscribedText(text);
    await handleProcessCommand(text);
  }, [handleProcessCommand]);

  /**
   * Reinicia el estado para un nuevo comando
   */
  const resetState = useCallback(() => {
    setState(COMMAND_STATES.IDLE);
    setTranscribedText('');
    setReportData(null);
    setError(null);
    setSuggestions([]);
    setProcessingMessage('');
  }, []);

  return {
    // Estado
    state,
    transcribedText,
    reportData,
    error,
    suggestions,
    isModalOpen,
    processingMessage,
    isListening: isListeningRef.current,

    // Acciones del modal
    openModal,
    closeModal,

    // Acciones de voz
    startListening,
    stopListening,
    processTextCommand,
    resetState,

    // Estados posibles (para comparación)
    STATES: COMMAND_STATES
  };
};

export default useVoiceCommand;
