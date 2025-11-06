/**
 * Página de Historial de Reportes por Comando de Voz
 * Muestra todos los reportes generados por el usuario mediante comandos de voz
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Calendar,
  Filter,
  Search,
  Mic,
  Plus,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { getCommandHistory, downloadReport } from '../../../services/admin/voiceCommandService';
import VoiceCommandGuide from '../../../components/admin/voice/VoiceCommandGuide';
import { useVoiceCommandContext } from '../../../context/VoiceCommandContext';

const VoiceReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, EXECUTED, FAILED, PROCESSING
  const [showGuide, setShowGuide] = useState(false);

  // Hook de comando de voz desde el CONTEXTO GLOBAL
  const { openModal } = useVoiceCommandContext();

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadReports();
  }, [currentPage, statusFilter]);

  const loadReports = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: currentPage,
        page_size: pageSize
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const result = await getCommandHistory(params);

      if (result.success) {
        setReports(result.data.results || result.data);
        
        // Calcular páginas totales
        if (result.data.count) {
          setTotalPages(Math.ceil(result.data.count / pageSize));
        }
      } else {
        setError(result.error || 'No se pudo cargar el historial');
      }
    } catch (err) {
      console.error('Error cargando reportes:', err);
      setError('Error al cargar los reportes');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId, format = 'pdf') => {
    try {
      await downloadReport(reportId, format);
    } catch (err) {
      console.error('Error descargando reporte:', err);
      alert('No se pudo descargar el reporte');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      EXECUTED: {
        icon: CheckCircle2,
        text: 'Completado',
        class: 'bg-green-100 text-green-800 border-green-200'
      },
      PROCESSING: {
        icon: Loader2,
        text: 'Procesando',
        class: 'bg-blue-100 text-blue-800 border-blue-200'
      },
      FAILED: {
        icon: XCircle,
        text: 'Fallido',
        class: 'bg-red-100 text-red-800 border-red-200'
      }
    };

    const badge = badges[status] || badges.PROCESSING;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${badge.class}`}>
        <Icon className={`w-3 h-3 ${status === 'PROCESSING' ? 'animate-spin' : ''}`} />
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredReports = reports.filter(report =>
    report.command_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.command_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Mic className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Reportes por Comando de Voz
                </h1>
                <p className="text-sm text-gray-500">
                  Historial de reportes generados mediante comandos de voz
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-3">
              {/* Botón de ayuda/guía */}
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                <HelpCircle className="w-5 h-5" />
                <span className="hidden sm:inline">{showGuide ? 'Ocultar' : 'Ver'} Guía</span>
              </button>

              {/* Botón para nuevo comando de voz */}
              <button
                onClick={openModal}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
              >
                <Sparkles className="w-5 h-5" />
                <span>Nuevo Comando de Voz</span>
              </button>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Barra de búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por comando o tipo de reporte..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro de estado */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">Todos los estados</option>
                <option value="EXECUTED">Completados</option>
                <option value="PROCESSING">En proceso</option>
                <option value="FAILED">Fallidos</option>
              </select>
            </div>
          </div>
        </div>

        {/* Guía de comandos (condicional) */}
        {showGuide && (
          <div className="mb-6 animate-fadeIn">
            <VoiceCommandGuide />
          </div>
        )}

        {/* Lista de reportes */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">Cargando reportes...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center">
            <XCircle className="w-12 h-12 text-red-600 mb-4" />
            <p className="text-red-600 font-medium mb-2">Error al cargar reportes</p>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <button
              onClick={loadReports}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Mic className="w-12 h-12 text-blue-400" />
            </div>
            <p className="text-gray-900 font-semibold text-lg mb-2">
              {searchTerm ? 'No se encontraron resultados' : '¡Comienza a usar comandos de voz!'}
            </p>
            <p className="text-gray-500 text-sm mb-6 max-w-md text-center">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda o genera un nuevo reporte'
                : 'Presiona el botón de abajo y di algo como: "Genera el reporte de ventas del último mes"'
              }
            </p>
            <button
              onClick={openModal}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              <Mic className="w-5 h-5" />
              <span>Crear mi primer reporte</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {report.command_type || 'Comando de Voz'}
                        </h3>
                        {getStatusBadge(report.status)}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 italic">
                        "{report.command_text}"
                      </p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(report.created_at)}
                        </div>
                        
                        {report.processing_time_ms && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {report.processing_time_ms}ms
                          </div>
                        )}

                        {report.confidence_score !== null && (
                          <div className="flex items-center gap-1">
                            <span className="font-medium">Confianza:</span>
                            <span className={`font-semibold ${
                              report.confidence_score > 0.8 ? 'text-green-600' : 
                              report.confidence_score > 0.5 ? 'text-yellow-600' : 
                              'text-red-600'
                            }`}>
                              {(report.confidence_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botones de acción */}
                    {report.status === 'EXECUTED' && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => handleDownload(report.id, 'pdf')}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          title="Descargar PDF"
                        >
                          <Download className="w-4 h-4" />
                          PDF
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Información adicional si está disponible */}
                  {report.interpreted_params && Object.keys(report.interpreted_params).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-semibold text-gray-600 mb-2">Parámetros interpretados:</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(report.interpreted_params).map(([key, value]) => (
                          <span
                            key={key}
                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                          >
                            <span className="font-medium">{key}:</span> {String(value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Mensaje de error si falló */}
                  {report.status === 'FAILED' && report.error_message && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-start gap-2 text-sm text-red-600">
                        <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>{report.error_message}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* NOTA: El modal se muestra desde el Header global */}
    </div>
  );
};

export default VoiceReportsPage;
