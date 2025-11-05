import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStockAlerts from '../hooks/useStockAlerts';

// Components
import ChartCard from '../components/dashboard/ChartCard';
import LoadingSkeleton from '../components/dashboard/LoadingSkeleton';
import EmptyState from '../components/dashboard/EmptyState';
import AlertBadge from '../components/dashboard/AlertBadge';
import '../components/dashboard/dashboard.css';
import './pages.css';

// Charts
import PieChartComponent from '../components/charts/PieChartComponent';
import BarChartComponent from '../components/charts/BarChartComponent';

// Utils
import { formatNumber, formatRelativeDate } from '../utils/formatters';
import { getAlertColor, getAlertIcon } from '../utils/stockAlertHelpers';

/**
 * Página de Dashboard de Alertas de Stock
 * Muestra alertas de productos con stock bajo y crítico
 */
const StockAlertsDashboard = () => {
  const navigate = useNavigate();
  
  // Estado para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevels, setSelectedLevels] = useState([]);

  // Hook de alertas (auto-refresh cada 15 min)
  const {
    alerts,
    allAlerts,
    loading,
    error,
    lastFetch,
    counts,
    refresh,
    applyFilters,
    getAlertsByLevel,
  } = useStockAlerts({
    filterLevels: selectedLevels.length > 0 ? selectedLevels : null,
    autoRefresh: true,
    autoSort: true,
  });

  /**
   * Niveles de alerta disponibles
   */
  const alertLevels = [
    { value: 'CRITICAL', label: 'Crítico', color: getAlertColor('CRITICAL'), icon: getAlertIcon('CRITICAL') },
    { value: 'WARNING', label: 'Alerta', color: getAlertColor('WARNING'), icon: getAlertIcon('WARNING') },
    { value: 'CAUTION', label: 'Precaución', color: getAlertColor('CAUTION'), icon: getAlertIcon('CAUTION') },
    { value: 'OK', label: 'Normal', color: getAlertColor('OK'), icon: getAlertIcon('OK') },
  ];

  /**
   * Maneja el cambio de filtro de nivel
   */
  const handleLevelToggle = (level) => {
    setSelectedLevels((prev) => {
      if (prev.includes(level)) {
        return prev.filter((l) => l !== level);
      } else {
        return [...prev, level];
      }
    });
  };

  /**
   * Filtra alertas por término de búsqueda
   */
  const filteredAlerts = alerts.filter((alert) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      alert.product_name?.toLowerCase().includes(term) ||
      alert.product_code?.toLowerCase().includes(term) ||
      alert.category?.toLowerCase().includes(term)
    );
  });

  /**
   * Volver al dashboard principal
   */
  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  /**
   * Ver detalles de un producto
   */
  const handleViewProduct = (productId) => {
    navigate(`/admin/dashboard/product/${productId}`);
  };

  /**
   * Renderiza el header
   */
  const renderHeader = () => (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={handleBack}
          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
        >
          <span>←</span>
          <span>Volver</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Alertas de Stock
          </h1>
          <p className="text-gray-600 mt-2">
            Gestión de inventario y productos con stock bajo
          </p>
          {lastFetch && (
            <p className="text-sm text-gray-500 mt-1">
              Última actualización: {formatRelativeDate(lastFetch)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button
            onClick={refresh}
            disabled={loading}
            className="button button-secondary flex items-center gap-2 disabled:opacity-50"
          >
            <span>🔄</span>
            <span>{loading ? 'Actualizando...' : 'Actualizar'}</span>
          </button>
        </div>
      </div>
    </div>
  );

  /**
   * Renderiza las estadísticas de alertas
   */
  const renderAlertStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {alertLevels.map((level) => (
        <div
          key={level.value}
          className="stat-card border-2 transition-all duration-200 hover:shadow-md"
          style={{ borderColor: level.color }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl">{level.icon}</span>
            <AlertBadge level={level.value} size="sm" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            {counts[level.value] || 0}
          </p>
          <p className="text-sm text-gray-600">{level.label}</p>
        </div>
      ))}
    </div>
  );

  /**
   * Renderiza los filtros
   */
  const renderFilters = () => (
    <div className="stat-card mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Buscador */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por producto, código o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filtros de nivel */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">Filtrar:</span>
          {alertLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => handleLevelToggle(level.value)}
              className={`px-3 py-1.5 rounded-lg font-bold text-sm transition-all duration-200 ${
                selectedLevels.includes(level.value)
                  ? 'text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              style={
                selectedLevels.includes(level.value)
                  ? { backgroundColor: level.color }
                  : {}
              }
            >
              {level.icon} {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Resultados */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Mostrando <span className="font-bold">{filteredAlerts.length}</span> de{' '}
          <span className="font-bold">{allAlerts.length}</span> productos
        </p>
      </div>
    </div>
  );

  /**
   * Renderiza la tabla de alertas
   */
  const renderAlertsTable = () => {
    if (loading && alerts.length === 0) {
      return <LoadingSkeleton type="table" rows={10} />;
    }

    if (filteredAlerts.length === 0) {
      return (
        <ChartCard title="Lista de Alertas">
          <EmptyState
            icon="🔍"
            title="No se encontraron alertas"
            description={
              searchTerm
                ? `No hay productos que coincidan con "${searchTerm}"`
                : 'No hay productos con alertas de stock'
            }
          />
        </ChartCard>
      );
    }

    return (
      <ChartCard
        title="Lista de Alertas"
        subtitle={`${filteredAlerts.length} productos`}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">
                  Nivel
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">
                  Producto
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">
                  Código
                </th>
                <th className="text-left py-3 px-4 text-sm font-bold text-gray-700">
                  Categoría
                </th>
                <th className="text-right py-3 px-4 text-sm font-bold text-gray-700">
                  Stock Actual
                </th>
                <th className="text-right py-3 px-4 text-sm font-bold text-gray-700">
                  Stock Mínimo
                </th>
                <th className="text-right py-3 px-4 text-sm font-bold text-gray-700">
                  Diferencia
                </th>
                <th className="text-center py-3 px-4 text-sm font-bold text-gray-700">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert, index) => {
                const difference = alert.current_stock - alert.min_stock;
                const percentage = ((alert.current_stock / alert.min_stock) * 100).toFixed(0);

                return (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="py-3 px-4">
                      <AlertBadge level={alert.alert_level} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                      {alert.product_name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {alert.product_code || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {alert.category || 'Sin categoría'}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      <span
                        className="font-semibold"
                        style={{ color: getAlertColor(alert.alert_level) }}
                      >
                        {formatNumber(alert.current_stock)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 text-right">
                      {formatNumber(alert.min_stock)}
                    </td>
                    <td className="py-3 px-4 text-sm text-right">
                      <span
                        className={`font-medium ${
                          difference < 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {difference > 0 ? '+' : ''}
                        {formatNumber(difference)} ({percentage}%)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleViewProduct(alert.product_id)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Ver detalles →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ChartCard>
    );
  };

  /**
   * Renderiza gráficos de análisis
   */
  const renderAnalysisCharts = () => {
    if (loading && alerts.length === 0) {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <LoadingSkeleton type="chart" height={350} />
          <LoadingSkeleton type="chart" height={350} />
        </div>
      );
    }

    // Preparar datos para distribución por nivel
    const distributionData = alertLevels.map((level) => ({
      name: level.label,
      value: counts[level.value] || 0,
      color: level.color,
    }));

    // Preparar datos para top productos críticos
    const criticalProducts = allAlerts
      .filter((alert) => alert.alert_level === 'CRITICAL' || alert.alert_level === 'WARNING')
      .slice(0, 10)
      .map((alert) => ({
        name: alert.product_name,
        value: alert.min_stock - alert.current_stock,
        color: getAlertColor(alert.alert_level),
      }));

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ChartCard title="Distribución de Alertas" subtitle="Por nivel de prioridad">
          <PieChartComponent
            data={distributionData}
            nameKey="name"
            valueKey="value"
            height={350}
            formatValue="number"
            innerRadius={60}
          />
        </ChartCard>

        <ChartCard title="Productos Críticos" subtitle="Mayor déficit de stock">
          <BarChartComponent
            data={criticalProducts}
            bars={[{ dataKey: 'value', name: 'Déficit', color: '#EF4444' }]}
            xAxisKey="name"
            height={350}
            formatValue="number"
            layout="horizontal"
            useCustomColors={true}
          />
        </ChartCard>
      </div>
    );
  };

  /**
   * Renderiza el estado de error
   */
  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          {renderHeader()}
          <div className="stat-card p-12">
            <EmptyState
              icon="⚠️"
              title="Error al cargar alertas"
              description={error}
              actionText="Reintentar"
              onAction={refresh}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {renderHeader()}
        {renderAlertStats()}
        {renderFilters()}
        {renderAnalysisCharts()}
        {renderAlertsTable()}
      </div>
    </div>
  );
};

export default StockAlertsDashboard;
