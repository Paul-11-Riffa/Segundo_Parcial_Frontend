/**
 * VoiceInputTrigger - Trigger de input fijo para comandos de voz
 * Componente que simula una barra de input pero actúa como botón para abrir el modal
 */

import React from 'react';
import { Mic, Sparkles, Wand2 } from 'lucide-react';
import { useVoiceCommandContext } from '../../../context/VoiceCommandContext';

const VoiceInputTrigger = () => {
  console.log('🎯 VoiceInputTrigger está renderizando...');
  
  // Manejo seguro del contexto
  let openModal;
  try {
    const context = useVoiceCommandContext();
    openModal = context?.openModal;
    console.log('✅ Contexto obtenido:', { hasOpenModal: !!openModal });
  } catch (error) {
    console.error('❌ Error obteniendo contexto:', error);
    // Fallback: mostrar componente de error
    return (
      <div className="w-full p-4 bg-red-50 border-2 border-red-300 rounded-xl">
        <p className="text-red-700 font-medium">
          ⚠️ Error: Contexto de voz no disponible
        </p>
        <p className="text-red-600 text-sm mt-1">
          {error.message}
        </p>
      </div>
    );
  }
  
  if (!openModal) {
    console.warn('⚠️ openModal no está disponible en el contexto');
    return (
      <div className="w-full p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
        <p className="text-yellow-700 font-medium">
          ⚠️ Función openModal no disponible
        </p>
      </div>
    );
  }
  
  console.log('🎯 Renderizando componente completo');

  const handleClick = () => {
    console.log('👆 Click en VoiceInputTrigger');
    if (openModal) {
      openModal();
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="
        w-full 
        p-4 
        bg-gradient-to-r from-white to-blue-50
        rounded-xl
        shadow-md 
        border-2 border-blue-200
        flex items-center 
        gap-4
        cursor-pointer 
        hover:shadow-xl
        hover:border-blue-400
        hover:from-blue-50
        hover:to-blue-100
        transition-all 
        duration-300
        group
        relative
        overflow-hidden
      "
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Efecto de brillo animado */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 group-hover:animate-pulse"></div>

      {/* Icono de Micrófono con animación */}
      <div 
        className="
          flex-shrink-0 
          w-12 h-12
          flex items-center 
          justify-center 
          bg-gradient-to-br from-blue-500 to-blue-600
          rounded-full
          shadow-lg
          group-hover:scale-110
          group-hover:rotate-12
          transition-all
          duration-300
          relative
        "
      >
        <Mic className="w-6 h-6 text-white" />
        
        {/* Indicador de disponibilidad */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></span>
      </div>

      {/* Texto de Placeholder con efecto de typing */}
      <div className="flex-1 min-w-0">
        <p className="text-base text-gray-500 group-hover:text-gray-700 transition-colors font-medium">
          Escribe o di un comando de voz...
        </p>
        <p className="text-xs text-gray-400 mt-1 group-hover:text-blue-600 transition-colors">
          💡 Ejemplo: "Genera el reporte de ventas del último mes en PDF"
        </p>
      </div>

      {/* Icono decorativo de IA */}
      <div className="hidden sm:flex items-center gap-2 text-blue-600 group-hover:text-blue-700">
        <Wand2 className="w-5 h-5 animate-pulse" />
      </div>

      {/* Botón "Generar" visual */}
      <button 
        tabIndex={-1}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        className="
          flex items-center 
          gap-2 
          px-6 py-3
          bg-gradient-to-r from-blue-600 to-blue-700
          text-white 
          rounded-lg
          font-semibold
          shadow-md
          group-hover:from-blue-700
          group-hover:to-blue-800
          group-hover:shadow-lg
          group-hover:scale-105
          transition-all
          duration-300
          relative
          overflow-hidden
        "
      >
        {/* Efecto de brillo en el botón */}
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
        
        <Sparkles className="w-5 h-5 relative z-10" />
        <span className="relative z-10">Generar Reporte</span>
      </button>
    </div>
  );
};

export default VoiceInputTrigger;
