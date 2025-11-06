/**
 * Componente de animación de ondas de voz
 * Se muestra cuando el sistema está escuchando el comando del usuario
 */

import React from 'react';
import './VoiceWaveAnimation.css';

const VoiceWaveAnimation = ({ isActive = true }) => {
  return (
    <div className={`voice-wave-container ${isActive ? 'active' : ''}`}>
      <div className="voice-wave-bar bar-1"></div>
      <div className="voice-wave-bar bar-2"></div>
      <div className="voice-wave-bar bar-3"></div>
      <div className="voice-wave-bar bar-4"></div>
      <div className="voice-wave-bar bar-5"></div>
    </div>
  );
};

export default VoiceWaveAnimation;
