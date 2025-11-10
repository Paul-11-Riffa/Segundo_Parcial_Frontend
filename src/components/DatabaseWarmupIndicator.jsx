// src/components/DatabaseWarmupIndicator.jsx
import { useState, useEffect } from 'react';
import { isDatabaseAwake } from '../utils/dbWarmup';

/**
 * Indicador visual del estado de la base de datos Neon
 * Muestra un banner cuando la DB está "dormida" y despertando
 */
const DatabaseWarmupIndicator = () => {
  const [isAwake, setIsAwake] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Verificar estado inicial
    const checkDatabase = async () => {
      const awake = await isDatabaseAwake();
      setIsAwake(awake);
      setIsChecking(false);
    };

    checkDatabase();

    // Verificar periódicamente durante los primeros 60 segundos
    const interval = setInterval(async () => {
      if (!isAwake) {
        const awake = await isDatabaseAwake();
        if (awake) {
          setIsAwake(true);
          clearInterval(interval);
        }
      }
    }, 5000); // Cada 5 segundos

    // Limpiar después de 60 segundos
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setIsChecking(false);
    }, 60000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isAwake]);

  // No mostrar nada si está despierta o ya no estamos verificando
  if (isAwake || !isChecking) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '12px 20px',
        textAlign: 'center',
        zIndex: 10000,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '14px',
        fontWeight: 500,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        {/* Spinner animado */}
        <div
          style={{
            width: '18px',
            height: '18px',
            border: '3px solid rgba(255,255,255,0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        
        <div>
          <strong>🔥 Base de datos despertando...</strong>
          <span style={{ marginLeft: '8px', opacity: 0.9 }}>
            Esto puede tomar unos segundos en la primera carga.
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DatabaseWarmupIndicator;
