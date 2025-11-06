/**
 * Contexto global para el sistema de comandos de voz
 * Permite compartir el estado entre todos los componentes
 */

import React, { createContext, useContext } from 'react';
import useVoiceCommand from '../hooks/admin/useVoiceCommand';

const VoiceCommandContext = createContext(null);

/**
 * Provider del contexto de comandos de voz
 * Debe envolver la aplicación o al menos el AdminLayout
 */
export const VoiceCommandProvider = ({ children }) => {
  const voiceCommand = useVoiceCommand();

  return (
    <VoiceCommandContext.Provider value={voiceCommand}>
      {children}
    </VoiceCommandContext.Provider>
  );
};

/**
 * Hook para usar el contexto de comandos de voz
 * @returns {Object} Estado y funciones del comando de voz
 */
export const useVoiceCommandContext = () => {
  const context = useContext(VoiceCommandContext);
  
  if (!context) {
    throw new Error(
      'useVoiceCommandContext debe usarse dentro de un VoiceCommandProvider'
    );
  }
  
  return context;
};

export default VoiceCommandContext;
