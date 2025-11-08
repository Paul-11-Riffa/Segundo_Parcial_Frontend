/**
 * ReportDetailDrawer - Panel lateral para mostrar detalles completos de un reporte
 * Se desliza desde la derecha mostrando información detallada
 */

import React from 'react';
import {
  X,
  Download,
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Code,
  User,
  Loader2
} from 'lucide-react';
import { downloadReport } from '../../../services/admin/voiceCommandService';

const ReportDetailDrawer = ({ report, isOpen, onClose }) => {
  if (!isOpen || !report) return null;

  const getStatusConfig = (status) => {
    const configs = {
      EXECUTED: {
        icon: CheckCircle2,
        text: 'Completado Exitosamente',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        iconColor: 'text-green-600'
      },
      PROCESSING: {
        icon: Loader2,
        text: 'Procesando...',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600'
      },
      FAILED: {
        icon: XCircle,
        text: 'Error en la Ejecución',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-600'
      }
    };

    return configs[status] || configs.PROCESSING;
  };

  const statusConfig = getStatusConfig(report.status);
  const StatusIcon = statusConfig.icon;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  const handleDownload = () => {
    if (report.file_url) {
      window.open(report.file_url, '_blank');
      return;
    }

    // Si no hay file_url, intentar descargar vía endpoint
    (async () => {
      try {
        const res = await downloadReport(report.id, 'pdf');
        if (!res.success) {
          alert(`Error al descargar: ${res.error}`);
        }
      } catch (err) {
        console.error('Error descargando reporte desde drawer:', err);
        alert('Error al descargar el reporte.');
      }
    })();
  };

  return (
    <>
      {/* Overlay de fondo */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Panel lateral */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-y-auto">
        {/* Header del drawer */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Detalles del Reporte</h2>
              <p className="text-sm text-gray-500">ID: #{report.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Contenido del drawer */}
        <div className="p-6 space-y-6">
          {/* Estado del reporte */}
          <div className={`${statusConfig.bgColor} border ${statusConfig.borderColor} rounded-lg p-4`}>
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-6 h-6 ${statusConfig.iconColor} ${report.status === 'PROCESSING' ? 'animate-spin' : ''}`} />
              <div>
                <p className={`font-semibold ${statusConfig.textColor}`}>{statusConfig.text}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Estado actual del reporte
                </p>
              </div>
            </div>
          </div>

          {/* Comando Original */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-900 mb-2">Comando Original</p>
                <p className="text-base text-purple-800 font-medium italic">
                  "{report.command_text}"
                </p>
              </div>
            </div>
          </div>

          {/* Parámetros Interpretados */}
          {report.interpreted_params && Object.keys(report.interpreted_params).length > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-gray-700" />
                <h3 className="font-semibold text-gray-900">Parámetros Interpretados</h3>
              </div>
              <div className="space-y-2">
                {Object.entries(report.interpreted_params).map(([key, value]) => (
                  <div key={key} className="flex items-start gap-3 bg-white p-3 rounded border border-gray-200">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-500 uppercase">{key}</p>
                      <p className="text-sm text-gray-900 mt-1 font-mono break-all">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje de Error (si existe) - mostrar error general y detalles por campo cuando estén presentes */}
          {(
            report.status === 'FAILED' && (report.error_message || report.error || report.details)
          ) && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-5">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900 mb-2">Error Detectado</p>

                  {/* Mensaje principal de error */}
                  {(report.error_message || report.error) && (
                    <p className="text-sm text-red-800 bg-red-100 p-3 rounded border border-red-200 font-mono">
                      {report.error_message || report.error}
                    </p>
                  )}

                  {/* Detalles por campo si el backend los proporcionó */}
                  {report.details && typeof report.details === 'object' && Object.keys(report.details).length > 0 && (
                    <div className="mt-3 text-sm text-red-700">
                      <p className="font-medium mb-2">Detalles:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {Object.entries(report.details).map(([field, msgs]) => (
                          <li key={field}>
                            <strong className="capitalize">{field}</strong>: {Array.isArray(msgs) ? msgs.join(', ') : String(msgs)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-xs text-red-700 mt-3">
                    💡 Intenta reformular el comando o verifica que los parámetros sean correctos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tipo de comando */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-500" />
                <p className="text-xs font-medium text-gray-500 uppercase">Tipo de Reporte</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {report.command_type || 'No especificado'}
              </p>
            </div>

            {/* Fecha de creación */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <p className="text-xs font-medium text-gray-500 uppercase">Fecha de Creación</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(report.created_at)}
              </p>
            </div>

            {/* Tiempo de procesamiento */}
            {report.processing_time_ms && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <p className="text-xs font-medium text-gray-500 uppercase">Tiempo de Procesamiento</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {report.processing_time_ms}ms
                </p>
              </div>
            )}

            {/* Nivel de confianza */}
            {report.confidence_score && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-gray-500" />
                  <p className="text-xs font-medium text-gray-500 uppercase">Confianza</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {Math.round(report.confidence_score * 100)}%
                </p>
              </div>
            )}
          </div>

          {/* Botón de descarga (solo si está completado) */}
          {report.status === 'EXECUTED' && report.file_url && (
            <div className="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
              >
                <Download className="w-5 h-5" />
                <span>Descargar Reporte (PDF)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ReportDetailDrawer;
