/**
 * Componente de Pestañas (Tabs)
 * Sistema de navegación por pestañas accesible y responsive
 */

import React, { useState } from 'react';

const Tabs = ({ tabs, defaultTab = 0, className = '' }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className={`w-full ${className}`}>
      {/* Barra de pestañas */}
      <div className="border-b border-gray-200 bg-white rounded-t-lg">
        <div className="flex space-x-1 p-1">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === index;
            
            return (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200
                  ${isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
              >
                {Icon && <Icon className="w-5 h-5" />}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`
                    ml-2 px-2 py-0.5 rounded-full text-xs font-semibold
                    ${isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-200 text-gray-700'
                    }
                  `}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido de la pestaña activa */}
      <div className="bg-white rounded-b-lg">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default Tabs;
