import { useState, useEffect } from 'react';
import axios from 'axios';

const BackendStatus = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const checkBackend = async () => {
      try {
        // Simplemente verificar que el servidor responda sin hacer una petición compleja
        await axios.get('http://localhost:8000/', {
          timeout: 2000,
          validateStatus: (status) => status < 500 // Aceptar cualquier respuesta que no sea error de servidor
        });
        setIsOnline(true);
        setShowBanner(false);
      } catch (error) {
        // Solo mostrar el banner si realmente hay un error de conexión
        if (error.code === 'ECONNREFUSED' || error.code === 'ECONNABORTED' || error.message.includes('Network Error')) {
          setIsOnline(false);
          setShowBanner(true);
        }
      }
    };

    // Primera verificación después de 1 segundo para dar tiempo a que cargue
    const initialTimeout = setTimeout(checkBackend, 1000);
    const interval = setInterval(checkBackend, 30000); // Verificar cada 30 segundos

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-premium max-w-md">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-amber-900 mb-1">
              Backend no disponible
            </h4>
            <p className="text-sm text-amber-800 mb-2">
              El servidor backend no está corriendo. Inicia Django para usar todas las funcionalidades.
            </p>
            <button
              onClick={() => setShowBanner(false)}
              className="text-xs text-amber-700 hover:text-amber-900 font-medium"
            >
              Entendido
            </button>
          </div>
          <button
            onClick={() => setShowBanner(false)}
            className="flex-shrink-0 text-amber-600 hover:text-amber-900"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackendStatus;
