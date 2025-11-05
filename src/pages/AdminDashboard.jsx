import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useDashboardRealtime from '../hooks/useDashboardRealtime';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Components
import StatCard from '../components/dashboard/StatCard';
import ChartCard from '../components/dashboard/ChartCard';
import AlertBadge from '../components/dashboard/AlertBadge';
import LoadingSkeleton from '../components/dashboard/LoadingSkeleton';
import EmptyState from '../components/dashboard/EmptyState';
import '../components/dashboard/dashboard.css';
import './pages.css';

// Charts
import LineChartComponent from '../components/charts/LineChartComponent';
import BarChartComponent from '../components/charts/BarChartComponent';
import PieChartComponent from '../components/charts/PieChartComponent';

// Utils
import { formatCurrency, formatNumber, formatRelativeDate } from '../utils/formatters';
import { calculatePercentageChange } from '../utils/chartHelpers';

/**
 * Página principal del Dashboard del Administrador
 * Muestra KPIs en tiempo real, gráficos de ventas, predicciones ML y alertas
 */
const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Estado para controlar refrescos manuales
  const [refreshKey, setRefreshKey] = useState(0);

  // Hook de datos en tiempo real (auto-refresh cada 5 min)
  const {
    data: dashboardData,
    loading,
    error,
    lastFetch,
    refresh,
    invalidateCache,
  } = useDashboardRealtime({
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutos
  });

  /**
   * Maneja el refresh manual
   */
  const handleRefresh = () => {
    invalidateCache();
    setRefreshKey(prev => prev + 1);
  };

  /**
   * Navegar a predicciones ML
   */
  const handleViewPredictions = () => {
    navigate('/admin/dashboard/predictions');
  };

  /**
   * Navegar a alertas de stock
   */
  const handleViewAlerts = () => {
    navigate('/admin/dashboard/alerts');
  };

  /**
   * Navegar a entrenamiento de modelo
   */
  const handleTrainModel = () => {
    navigate('/admin/dashboard/train-model');
  };

  /**
   * Renderiza el header del dashboard
   */
  const renderHeader = () => (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Administrativo
          </h1>
          <p className="text-gray-600 mt-2">
            Bienvenido, <span className="font-bold">{user?.username || 'Administrador'}</span>
          </p>
          {lastFetch && (
            <p className="text-sm text-gray-500 mt-1">
              Última actualización: {formatRelativeDate(lastFetch)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="button button-secondary flex items-center gap-2 disabled:opacity-50"
          >
            <span>🔄</span>
            <span>{loading ? 'Actualizando...' : 'Actualizar'}</span>
          </button>

          <button
            onClick={handleTrainModel}
            className="button button-primary flex items-center gap-2"
          >
            <span>🤖</span>
            <span>Entrenar Modelo</span>
          </button>
        </div>
      </div>
    </div>
  );

  /**
   * Renderiza los KPI cards
   */
  const renderKPICards = () => {
    if (loading && !dashboardData) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <LoadingSkeleton key={i} type="card" />
          ))}
        </div>
      );
    }

    // Estructura real del backend según FRONTEND_DASHBOARD.md
    const monthData = dashboardData?.month || {};
    const weekData = dashboardData?.week || {};
    const todayData = dashboardData?.today || {};

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Ventas del Mes */}
        <StatCard
          title="Ventas del Mes"
          value={monthData.total_sales || 0}
          format="currency"
          subtitle={`${monthData.order_count || 0} órdenes`}
          icon="💰"
          loading={loading}
        />

        {/* Ventas de la Semana */}
        <StatCard
          title="Ventas de la Semana"
          value={weekData.total_sales || 0}
          format="currency"
          subtitle={`${weekData.order_count || 0} órdenes`}
          icon="📈"
          loading={loading}
        />

        {/* Ventas de Hoy */}
        <StatCard
          title="Ventas de Hoy"
          value={todayData.total_sales || 0}
          format="currency"
          subtitle={`${todayData.order_count || 0} órdenes`}
          icon="📊"
          loading={loading}
        />

        {/* Clientes Activos */}
        <StatCard
          title="Clientes Activos"
          value={dashboardData?.customers?.active_count || 0}
          format="number"
          subtitle={`${dashboardData?.customers?.new_this_month || 0} nuevos`}
          icon="👥"
          loading={loading}
        />
      </div>
    );
  };

  /**
   * Renderiza el gráfico de ventas
   */
  const renderSalesChart = () => {
    if (loading && !dashboardData) {
      return <LoadingSkeleton type="chart" height={400} />;
    }

    // Estructura real del backend: sales_trend con date, total_sales, order_count
    const salesData = dashboardData?.sales_trend || [];

    if (salesData.length === 0) {
      return (
        <ChartCard title="Tendencia de Ventas" subtitle="Últimos 7 días">
          <EmptyState
            icon="📈"
            title="No hay datos de ventas"
            description="Aún no se han registrado ventas en este periodo"
          />
        </ChartCard>
      );
    }

    return (
      <ChartCard
        title="Tendencia de Ventas"
        subtitle="Últimos 7 días"
        actions={
          <button
            onClick={handleViewPredictions}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver predicciones →
          </button>
        }
      >
        <LineChartComponent
          data={salesData}
          lines={[
            {
              dataKey: 'total_sales',  // ← Campo correcto del backend
              name: 'Ventas',
              color: '#3B82F6',
              strokeWidth: 3,
            },
          ]}
          xAxisKey="date"
          height={400}
          formatValue="currency"
        />
      </ChartCard>
    );
  };

  /**
   * Renderiza el gráfico de categorías
   */
  const renderCategoryChart = () => {
    if (loading && !dashboardData) {
      return <LoadingSkeleton type="chart" height={350} />;
    }

    // Estructura real del backend: top_categories con category_name y revenue
    const categoryData = (dashboardData?.top_categories || []).map(cat => ({
      name: cat.category_name || 'Sin categoría',
      value: cat.revenue || 0
    }));

    if (categoryData.length === 0) {
      return (
        <ChartCard title="Ventas por Categoría" subtitle="Distribución">
          <EmptyState
            icon="📊"
            title="No hay datos de categorías"
            description="No se encontraron ventas por categoría"
          />
        </ChartCard>
      );
    }

    return (
      <ChartCard title="Ventas por Categoría" subtitle="Distribución del mes">
        <PieChartComponent
          data={categoryData}
          nameKey="name"
          valueKey="value"
          height={350}
          formatValue="currency"
          innerRadius={60}
          showPercentage={true}
        />
      </ChartCard>
    );
  };

  /**
   * Renderiza el gráfico de productos top
   */
  const renderTopProductsChart = () => {
    if (loading && !dashboardData) {
      return <LoadingSkeleton type="chart" height={350} />;
    }

    // Estructura real del backend: top_products con product_name y quantity_sold
    // Definir una paleta de colores para los productos
    const productColors = [
      '#10B981', // Verde
      '#3B82F6', // Azul
      '#F59E0B', // Amarillo
      '#EF4444', // Rojo
      '#8B5CF6', // Púrpura
      '#EC4899', // Rosa
      '#14B8A6', // Teal
      '#F97316', // Naranja
      '#6366F1', // Índigo
      '#84CC16', // Lima
    ];
    
    const topProducts = (dashboardData?.top_products || []).map((prod, index) => ({
      name: prod.product_name || 'Producto',
      quantity: prod.quantity_sold || 0,
      revenue: prod.revenue || 0,
      color: productColors[index % productColors.length], // Asignar color rotativo
    }));
    
    // 🔍 DEBUG: Ver los datos que se están pasando al gráfico
    console.log('📊 Top Products Data:', {
      raw: dashboardData?.top_products,
      mapped: topProducts,
      firstItem: topProducts[0]
    });

    if (topProducts.length === 0) {
      return (
        <ChartCard title="Productos Más Vendidos" subtitle="Top 10">
          <EmptyState
            icon="🏆"
            title="No hay datos de productos"
            description="No se encontraron productos vendidos"
          />
        </ChartCard>
      );
    }

    return (
      <ChartCard title="Productos Más Vendidos" subtitle="Top 10 del mes">
        {/* Gráfico de barras mejorado */}
        <div style={{ width: '100%', height: 450 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={topProducts.slice(0, 10)} 
              margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
              barSize={50}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                height={100}
                interval={0}
                tick={{ fontSize: 11, fill: '#6B7280' }}
                tickFormatter={(value) => value.length > 25 ? value.substring(0, 25) + '...' : value}
              />
              
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                label={{ 
                  value: 'Unidades Vendidas', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: 12, fill: '#374151' }
                }}
              />
              
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFF', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                formatter={(value) => [`${value} unidades`, 'Cantidad Vendida']}
                labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '5px' }}
              />
              
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="rect"
              />
              
              <Bar 
                dataKey="quantity" 
                name="Cantidad Vendida"
                radius={[8, 8, 0, 0]}
                animationDuration={1000}
              >
                {topProducts.slice(0, 10).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    );
  };

  /**
   * Renderiza la tabla de alertas
   */
  const renderAlertsTable = () => {
    if (loading && !dashboardData) {
      return <LoadingSkeleton type="table" rows={5} />;
    }

    // El backend devuelve inventory.low_stock_count y inventory.out_of_stock_count
    const lowStockCount = dashboardData?.inventory?.low_stock_count || 0;
    const outOfStockCount = dashboardData?.inventory?.out_of_stock_count || 0;
    const totalAlerts = lowStockCount + outOfStockCount;

    if (totalAlerts === 0) {
      return (
        <ChartCard title="Alertas de Stock" subtitle="Estado actual">
          <EmptyState
            icon="✅"
            title="No hay alertas"
            description="Todos los productos tienen stock suficiente"
          />
        </ChartCard>
      );
    }

    return (
      <ChartCard
        title="Alertas de Stock"
        subtitle={`${totalAlerts} productos requieren atención`}
        actions={
          <button
            onClick={handleViewAlerts}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver todas →
          </button>
        }
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="font-semibold text-gray-900">Stock Bajo</h4>
                <p className="text-sm text-gray-600">{lowStockCount} productos con stock limitado</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-yellow-600">{lowStockCount}</span>
          </div>

          {outOfStockCount > 0 && (
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔴</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Sin Stock</h4>
                  <p className="text-sm text-gray-600">{outOfStockCount} productos agotados</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-red-600">{outOfStockCount}</span>
            </div>
          )}
        </div>
      </ChartCard>
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
              title="Error al cargar el dashboard"
              description={error}
              actionText="Reintentar"
              onAction={handleRefresh}
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
        
        {/* KPI Cards */}
        {renderKPICards()}

        {/* Gráfico de ventas principal */}
        <div className="mb-8">
          {renderSalesChart()}
        </div>

        {/* Grid de 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {renderCategoryChart()}
          {renderTopProductsChart()}
        </div>

        {/* Tabla de alertas */}
        <div className="mb-8">
          {renderAlertsTable()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
