import { useState, useRef, useEffect } from 'react';
import { searchProductsByVoice } from '../services/voiceSearchService';

/**
 * Hook personalizado para búsqueda por voz usando Web Speech API
 * Maneja la captura de voz, transcripción y comunicación con el backend
 */
export const useVoiceSearch = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [interpretation, setInterpretation] = useState(null);
  
  const recognitionRef = useRef(null);

  // Verificar soporte del navegador
  const isBrowserSupported = () => {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  };

  // Inicializar Web Speech API
  useEffect(() => {
    if (!isBrowserSupported()) {
      setError('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
      return;
    }

    const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'es-ES';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // Cuando se captura voz
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscription(transcript);
      setIsListening(false);
      setIsProcessing(true);

      try {
        // Obtener token de localStorage
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          throw new Error('No estás autenticado. Por favor inicia sesión.');
        }

        // Enviar al backend
        const data = await searchProductsByVoice(transcript, token);
        
        setResults(data.products || []);
        setInterpretation({
          original: transcript,
          understood: data.interpretation || '',
          confidence: data.confidence || 0,
          filters: data.filters_applied || {},
        });
        setError(null);
      } catch (err) {
        setError(err.message || 'Error al procesar la búsqueda por voz');
        setResults(null);
        setInterpretation(null);
      } finally {
        setIsProcessing(false);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setIsProcessing(false);
      
      if (event.error === 'no-speech') {
        setError('No se detectó voz. Intenta de nuevo.');
      } else if (event.error === 'not-allowed') {
        setError('Permiso denegado. Habilita el micrófono en tu navegador.');
      } else {
        setError(`Error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []); // Sin dependencias, solo se inicializa una vez

  // Iniciar escucha
  const startListening = () => {
    if (!isBrowserSupported()) {
      setError('Tu navegador no soporta reconocimiento de voz.');
      return;
    }

    setError(null);
    setTranscription('');
    setResults(null);
    setInterpretation(null);
    setIsListening(true);
    
    try {
      recognitionRef.current?.start();
    } catch (err) {
      console.error('Error al iniciar reconocimiento:', err);
      setIsListening(false);
    }
  };

  // Detener escucha
  const stopListening = () => {
    setIsListening(false);
    recognitionRef.current?.stop();
  };

  // Resetear búsqueda
  const resetSearch = () => {
    setTranscription('');
    setResults(null);
    setError(null);
    setInterpretation(null);
    setIsListening(false);
    setIsProcessing(false);
  };

  return {
    isListening,
    isProcessing,
    transcription,
    results,
    error,
    interpretation,
    isBrowserSupported: isBrowserSupported(),
    startListening,
    stopListening,
    resetSearch,
  };
};
