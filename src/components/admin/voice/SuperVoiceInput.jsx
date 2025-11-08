/**
 * SUPER COMPONENTE DE VOZ - VERSION ULTRA VISIBLE
 * Este componente GARANTIZA aparecer en pantalla
 */

import React from 'react';
import { Mic, Sparkles } from 'lucide-react';
import { useVoiceCommandContext } from '../../../context/VoiceCommandContext';

const SuperVoiceInput = () => {
  console.log('🚀 [SuperVoiceInput] RENDERIZANDO...');
  
  let openModal = null;
  
  try {
    const context = useVoiceCommandContext();
    openModal = context?.openModal;
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  const handleClick = () => {
    console.log('🔥 CLICK DETECTADO EN SUPER VOICE INPUT');
    if (openModal) {
      openModal();
    } else {
      alert('⚠️ openModal no disponible. Verifica el contexto.');
    }
  };
  
  return (
    <div className="w-full space-y-4">
      {/* Indicador visible de que el componente está renderizado */}
      <div className="bg-green-500 text-white p-2 rounded text-center font-bold">
        ✅ COMPONENTE RENDERIZADO CORRECTAMENTE
      </div>
      
      {/* Botón principal ENORME y visible */}
      <button
        onClick={handleClick}
        className="
          w-full 
          p-8
          bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600
          text-white
          rounded-2xl
          shadow-2xl
          hover:shadow-3xl
          hover:scale-105
          transition-all
          duration-300
          cursor-pointer
          border-4
          border-white
        "
      >
        <div className="flex items-center justify-center gap-4">
          <Mic className="w-12 h-12 animate-pulse" />
          <div className="text-left">
            <h2 className="text-3xl font-black mb-2">
              Comandos de Voz
            </h2>
            <p className="text-lg text-white/90">
              Click aquí para hablar o escribir tu comando
            </p>
          </div>
          <Sparkles className="w-12 h-12 animate-spin" />
        </div>
      </button>
      
      {/* Campo de texto alternativo */}
      <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-gray-300">
        <label className="block text-gray-700 font-bold mb-3 text-lg">
          📝 O escribe tu comando aquí:
        </label>
        <input
          type="text"
          placeholder='Ejemplo: "Genera el reporte de ventas del último mes"'
          className="w-full px-4 py-3 border-2 border-blue-500 rounded-lg text-lg focus:ring-4 focus:ring-blue-300 focus:border-blue-600"
          onFocus={handleClick}
        />
        <p className="text-sm text-gray-500 mt-2">
          💡 Al hacer click en el campo, se abrirá el modal de comandos
        </p>
      </div>
      
      {/* Información de estado */}
      <div className="bg-gray-100 p-4 rounded-lg text-sm">
        <p className="font-mono">
          🔍 Estado: openModal = {openModal ? '✅ Disponible' : '❌ No disponible'}
        </p>
      </div>
    </div>
  );
};

export default SuperVoiceInput;
