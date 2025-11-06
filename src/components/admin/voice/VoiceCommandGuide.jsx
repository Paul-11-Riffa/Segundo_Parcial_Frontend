/**
 * Guía visual de comandos de voz
 * Muestra información sobre cómo usar el sistema y ejemplos categorizados
 */

import React, { useState } from 'react';
import {
  FileText,
  TrendingUp,
  Package,
  Users,
  BarChart3,
  Calendar,
  Download,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

const VoiceCommandGuide = () => {
  const [expandedCategory, setExpandedCategory] = useState(null);

  const commandCategories = [
    {
      id: 'ventas',
      title: 'Reportes de Ventas',
      icon: TrendingUp,
      color: 'blue',
      description: 'Análisis de ventas por diferentes períodos y criterios',
      examples: [
        'Reporte de ventas del último mes',
        'Ventas de la semana pasada',
        'Comparativo de ventas entre enero y febrero',
        'Ventas por categoría del trimestre',
      ]
    },
    {
      id: 'productos',
      title: 'Análisis de Productos',
      icon: Package,
      color: 'green',
      description: 'Información sobre productos, inventario y movimientos',
      examples: [
        'Productos más vendidos esta semana',
        'Análisis ABC de productos',
        'Inventario con stock bajo',
        'Productos por categoría'
      ]
    },
    {
      id: 'clientes',
      title: 'Análisis de Clientes',
      icon: Users,
      color: 'purple',
      description: 'Reportes sobre comportamiento y segmentación de clientes',
      examples: [
        'Ventas por cliente del año 2024',
        'Análisis RFM de clientes',
        'Segmentación de clientes',
        'Clientes más frecuentes'
      ]
    },
    {
      id: 'predicciones',
      title: 'Predicciones y ML',
      icon: BarChart3,
      color: 'orange',
      description: 'Predicciones basadas en Machine Learning',
      examples: [
        'Predicciones de ventas para los próximos 7 días',
        'Forecast de ventas del próximo mes',
        'Predicción de demanda de productos',
        'Tendencias futuras de ventas'
      ]
    },
    {
      id: 'ejecutivo',
      title: 'Reportes Ejecutivos',
      icon: FileText,
      color: 'red',
      description: 'Dashboards y resúmenes ejecutivos completos',
      examples: [
        'Dashboard ejecutivo del mes de octubre',
        'Resumen ejecutivo del trimestre',
        'KPIs del último mes',
        'Reporte ejecutivo anual'
      ]
    }
  ];

  const toggleCategory = (categoryId) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-700',
        iconBg: 'bg-blue-100',
        iconText: 'text-blue-600',
        hover: 'hover:bg-blue-100'
      },
      green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-700',
        iconBg: 'bg-green-100',
        iconText: 'text-green-600',
        hover: 'hover:bg-green-100'
      },
      purple: {
        bg: 'bg-purple-50',
        border: 'border-purple-200',
        text: 'text-purple-700',
        iconBg: 'bg-purple-100',
        iconText: 'text-purple-600',
        hover: 'hover:bg-purple-100'
      },
      orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-700',
        iconBg: 'bg-orange-100',
        iconText: 'text-orange-600',
        hover: 'hover:bg-orange-100'
      },
      red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-700',
        iconBg: 'bg-red-100',
        iconText: 'text-red-600',
        hover: 'hover:bg-red-100'
      }
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6" />
          <h2 className="text-xl font-bold">Guía de Comandos de Voz</h2>
        </div>
        <p className="text-blue-100 text-sm">
          Aprende cómo usar el sistema de comandos de voz para generar reportes inteligentes
        </p>
      </div>

      {/* Instrucciones generales */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="flex items-start gap-3 mb-4">
          <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Consejos para mejores resultados:</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Habla con claridad y a un ritmo normal</li>
              <li>• Menciona el tipo de reporte que necesitas</li>
              <li>• Especifica el período de tiempo (semana, mes, año)</li>
              <li>• Puedes pedir el formato: PDF o Excel</li>
              <li>• Sé específico con fechas si las conoces</li>
            </ul>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Download className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Formatos disponibles:</h3>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                PDF
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                Excel
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                JSON
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Categorías de comandos */}
      <div className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Categorías de Reportes
        </h3>
        
        <div className="space-y-3">
          {commandCategories.map((category) => {
            const Icon = category.icon;
            const colors = getColorClasses(category.color);
            const isExpanded = expandedCategory === category.id;

            return (
              <div
                key={category.id}
                className={`border rounded-lg overflow-hidden transition-all ${colors.border}`}
              >
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`w-full p-4 flex items-center justify-between ${colors.bg} ${colors.hover} transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 ${colors.iconBg} rounded-lg`}>
                      <Icon className={`w-5 h-5 ${colors.iconText}`} />
                    </div>
                    <div className="text-left">
                      <h4 className={`font-semibold ${colors.text}`}>
                        {category.title}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className={`w-5 h-5 ${colors.text}`} />
                  ) : (
                    <ChevronDown className={`w-5 h-5 ${colors.text}`} />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-4 bg-white border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 mb-3">
                      Ejemplos de comandos:
                    </p>
                    <div className="space-y-2">
                      {category.examples.map((example, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 text-sm text-gray-700 p-2 rounded hover:bg-gray-50 transition-colors"
                        >
                          <span className={`font-semibold ${colors.text}`}>•</span>
                          <span className="italic">"{example}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer con nota */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          💡 <span className="font-medium">Tip:</span> Puedes combinar diferentes criterios en un solo comando. 
          Ejemplo: "Reporte de ventas por categoría del último trimestre en Excel"
        </p>
      </div>
    </div>
  );
};

export default VoiceCommandGuide;
