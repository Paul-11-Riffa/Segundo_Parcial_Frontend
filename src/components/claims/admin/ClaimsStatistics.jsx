import React, { useState, useEffect } from 'react';
import claimService from '../../../services/claimService';

const ClaimsStatistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    loadStatistics();
  }, [period]);

  const loadStatistics = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await claimService.getStatistics({ days: period });
      setStats(data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      setError('Error al cargar las estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header con Selector de Período */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Estadísticas de Reclamos</h2>
          {stats.period && (
            <p className="text-gray-600 mt-1">
              Período: {formatDate(stats.period.from)} - {formatDate(stats.period.to)}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setPeriod(7)}
            className={`px-4 py-2 rounded-md ${
              period === 7
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            7 días
          </button>
          <button
            onClick={() => setPeriod(30)}
            className={`px-4 py-2 rounded-md ${
              period === 30
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            30 días
          </button>
          <button
            onClick={() => setPeriod(90)}
            className={`px-4 py-2 rounded-md ${
              period === 90
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            90 días
          </button>
        </div>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Reclamos</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.summary?.total_claims || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Resueltos</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.summary?.resolved || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-full p-3">
              <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.summary?.pending || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-full p-3">
              <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Calificación</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.summary?.avg_rating ? stats.summary.avg_rating.toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-100 rounded-full p-3">
              <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tiempo Prom.</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.summary?.avg_resolution_time_hours
                  ? `${stats.summary.avg_resolution_time_hours.toFixed(1)}h`
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por Estado */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Estado</h3>
          <div className="space-y-3">
            {stats.by_status &&
              Object.entries(stats.by_status).map(([key, data]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{data.label}</span>
                      <span className="text-sm text-gray-600">
                        {data.count} ({data.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${data.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Por Prioridad */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Prioridad</h3>
          <div className="space-y-3">
            {stats.by_priority &&
              Object.entries(stats.by_priority).map(([key, data]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{data.label}</span>
                      <span className="text-sm text-gray-600">
                        {data.count} ({data.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          key === 'URGENT'
                            ? 'bg-red-500'
                            : key === 'HIGH'
                            ? 'bg-orange-500'
                            : key === 'MEDIUM'
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                        }`}
                        style={{ width: `${data.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Por Tipo de Daño */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Tipo de Daño</h3>
          <div className="space-y-3">
            {stats.by_damage_type &&
              Object.entries(stats.by_damage_type).map(([key, data]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{data.label}</span>
                      <span className="text-sm text-gray-600">
                        {data.count} ({data.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${data.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Productos con Más Reclamos */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Productos con Más Reclamos
          </h3>
          {stats.top_products && stats.top_products.length > 0 ? (
            <div className="space-y-3">
              {stats.top_products.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full text-sm font-bold mr-3">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {product.product__name}
                      </p>
                      <p className="text-xs text-gray-500">ID: {product.product__id}</p>
                    </div>
                  </div>
                  <span className="bg-red-100 text-red-800 text-sm font-semibold px-3 py-1 rounded-full">
                    {product.count} reclamos
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
          )}
        </div>
      </div>

      {/* Botón de Actualizar */}
      <div className="flex justify-center">
        <button
          onClick={loadStatistics}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Actualizar Estadísticas
        </button>
      </div>
    </div>
  );
};

export default ClaimsStatistics;
