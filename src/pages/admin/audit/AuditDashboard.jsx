import React, { useState, useEffect } from 'react';
import { getAuditStats } from '../../../services/admin/auditService';
import { 
  Activity, AlertTriangle, Users, Globe, Clock, TrendingUp,
  BarChart3, PieChart, Calendar, AlertCircle 
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';
import './Audit.css';

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              AUDIT DASHBOARD - ESTADÍSTICAS                  ║
 * ║  Dashboard principal con métricas y gráficos de auditoría    ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// Colores por tipo de acción
const ACTION_COLORS = {
  AUTH: '#8b5cf6',
  CREATE: '#10b981',
  READ: '#3b82f6',
  UPDATE: '#f59e0b',
  DELETE: '#ef4444',
  PAYMENT: '#f97316',
  REPORT: '#06b6d4',
  CONFIG: '#ec4899',
  ML: '#6366f1',
  OTHER: '#6b7280'
};

// Colores por severidad
const SEVERITY_COLORS = {
  LOW: '#6b7280',
  MEDIUM: '#3b82f6',
  HIGH: '#f59e0b',
  CRITICAL: '#ef4444'
};

const AuditDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [days, setDays] = useState(7);

  // Cargar estadísticas
  useEffect(() => {
    loadStats();
  }, [days]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAuditStats(days);
      console.log('📊 Datos recibidos del backend:', data);
      console.log('📊 Summary:', data?.summary);
      console.log('📊 By Day:', data?.by_day);
      console.log('📊 Top Users:', data?.top_users);
      console.log('📊 Top IPs:', data?.top_ips);
      setStats(data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      setError(err.response?.data?.detail || err.message || 'Error al cargar estadísticas de auditoría');
    } finally {
      setLoading(false);
    }
  };

  // Formatear números
  const formatNumber = (num) => {
    if (num == null || num === undefined) return '0';
    if (typeof num !== 'number') {
      const parsed = parseFloat(num);
      if (isNaN(parsed)) return '0';
      num = parsed;
    }
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  // Formatear tiempo en ms
  const formatTime = (ms) => {
    // Si no hay valor, mostrar N/A
    if (ms == null || ms === undefined) return 'N/A';
    if (typeof ms !== 'number') return 'N/A';
    if (ms < 1000) return `${ms.toFixed(0)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  // Preparar datos para gráfico de dona (Action Types)
  const prepareActionTypePieData = () => {
    if (!stats?.by_action_type) return [];
    return stats.by_action_type.map(item => ({
      name: item.action_type,
      value: item.count,
      color: ACTION_COLORS[item.action_type] || ACTION_COLORS.OTHER
    }));
  };

  // Preparar datos para gráfico de barras (Severity)
  const prepareSeverityBarData = () => {
    if (!stats?.by_severity) return [];
    return stats.by_severity.map(item => ({
      name: item.severity,
      Cantidad: item.count,
      fill: SEVERITY_COLORS[item.severity] || SEVERITY_COLORS.LOW
    }));
  };

  // Preparar datos para gráfico de líneas (Daily Activity)
  const prepareDailyLineData = () => {
    if (!stats?.by_day || !Array.isArray(stats.by_day)) {
      console.warn('⚠️ No hay datos de by_day o no es un array');
      return [];
    }
    
    return stats.by_day.map(item => {
      let formattedDate = 'N/A';
      try {
        // Backend envía campo 'day' (no 'date')
        const dateString = item.day || item.date;
        
        if (dateString) {
          const date = new Date(dateString);
          if (!isNaN(date.getTime())) {
            formattedDate = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
          } else {
            console.warn('⚠️ Fecha inválida:', dateString);
            formattedDate = dateString;
          }
        }
      } catch (e) {
        console.error('Error al parsear fecha:', item.day || item.date, e);
        formattedDate = String(item.day || item.date || 'N/A');
      }
      
      return {
        date: formattedDate,
        Acciones: item.count || item.total_actions || 0,
        Errores: item.error_count || 0
      };
    });
  };

  if (loading) {
    return (
      <div className="audit-dashboard">
        <div className="audit-loading">
          <div className="spinner"></div>
          <p>Cargando estadísticas de auditoría...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="audit-dashboard">
        <div className="audit-error">
          <AlertTriangle size={48} />
          <h3>Error al cargar estadísticas</h3>
          <p>{error}</p>
          {error.includes('Network Error') && (
            <p style={{ fontSize: '0.9rem', color: '#6b7280', marginTop: '1rem' }}>
              ⚠️ Asegúrate de que el servidor backend esté corriendo en <code>http://localhost:8000</code>
            </p>
          )}
          <button className="btn-primary" onClick={loadStats}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="audit-dashboard">
        <div className="audit-empty">
          <Activity size={48} />
          <p>No hay datos de auditoría disponibles</p>
        </div>
      </div>
    );
  }

  const { summary } = stats;
  
  console.log('🔍 Summary para renderizado:', summary);
  
  // Helper para obtener valores con diferentes nombres de campo
  const getSummaryValue = (field, alternativeFields = []) => {
    if (summary?.[field] != null) return summary[field];
    for (const altField of alternativeFields) {
      if (summary?.[altField] != null) return summary[altField];
    }
    return 0;
  };
  
  // Helper especial para error_rate que puede venir como string "7.63%"
  const getErrorRate = () => {
    const rate = getSummaryValue('error_rate', ['errorRate']);
    if (typeof rate === 'string') {
      // Remover el símbolo % y convertir a número
      const numericRate = parseFloat(rate.replace('%', ''));
      return isNaN(numericRate) ? 0 : numericRate;
    }
    return typeof rate === 'number' ? rate : 0;
  };

  return (
    <div className="audit-dashboard">
      {/* Header con selector de período */}
      <div className="audit-dashboard-header">
        <div>
          <h1>
            <BarChart3 size={32} />
            Panel de Auditoría
          </h1>
          <p className="audit-subtitle">Monitoreo y análisis de actividad del sistema</p>
        </div>
        
        <div className="period-selector">
          <label>Período:</label>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>Últimos 7 días</option>
            <option value={14}>Últimos 14 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={90}>Últimos 90 días</option>
          </select>
        </div>
      </div>

      {/* Cards de Resumen */}
      <div className="audit-stats-grid">
        <div className="audit-stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e0e7ff' }}>
            <Activity size={24} color="#4f46e5" />
          </div>
          <div className="stat-content">
            <h3>{formatNumber(getSummaryValue('total_actions', ['totalActions', 'total']))}</h3>
            <p>Total de Acciones</p>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fee2e2' }}>
            <AlertCircle size={24} color="#dc2626" />
          </div>
          <div className="stat-content">
            <h3>{formatNumber(getSummaryValue('total_errors', ['totalErrors', 'errors']))}</h3>
            <p>Errores Totales</p>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7' }}>
            <TrendingUp size={24} color="#ca8a04" />
          </div>
          <div className="stat-content">
            <h3>{getErrorRate().toFixed(2)}%</h3>
            <p>Tasa de Error</p>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#d1fae5' }}>
            <Users size={24} color="#059669" />
          </div>
          <div className="stat-content">
            <h3>{formatNumber(getSummaryValue('total_users', ['unique_users', 'uniqueUsers', 'users']))}</h3>
            <p>Usuarios Únicos</p>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dbeafe' }}>
            <Globe size={24} color="#2563eb" />
          </div>
          <div className="stat-content">
            <h3>{formatNumber(stats.top_ips?.length || 0)}</h3>
            <p>IPs Únicas</p>
          </div>
        </div>

        <div className="audit-stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fce7f3' }}>
            <Clock size={24} color="#be185d" />
          </div>
          <div className="stat-content">
            <h3>{formatTime(getSummaryValue('avg_response_time_ms', ['avgResponseTimeMs', 'avg_response_time', 'response_time']))}</h3>
            <p>Tiempo Promedio</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="audit-charts-grid">
        {/* Gráfico de Dona - Distribución por Tipo de Acción */}
        <div className="audit-chart-card">
          <h3>
            <PieChart size={20} />
            Distribución por Tipo de Acción
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RePieChart>
              <Pie
                data={prepareActionTypePieData()}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={90}
                innerRadius={45}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={2}
              >
                {prepareActionTypePieData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => value.toLocaleString()}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value, entry) => `${value}: ${entry.payload.value.toLocaleString()}`}
              />
            </RePieChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras - Distribución por Severidad */}
        <div className="audit-chart-card">
          <h3>
            <BarChart3 size={20} />
            Distribución por Severidad
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={prepareSeverityBarData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Cantidad" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Líneas - Actividad Diaria */}
        <div className="audit-chart-card chart-full-width">
          <h3>
            <Calendar size={20} />
            Actividad Diaria (últimos {days} días)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={prepareDailyLineData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Acciones" stroke="#3b82f6" strokeWidth={2} />
              <Line type="monotone" dataKey="Errores" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tablas de Top Users y Top IPs */}
      <div className="audit-tables-grid">
        {/* Top 10 Usuarios */}
        <div className="audit-table-card">
          <h3>
            <Users size={20} />
            Top 10 Usuarios Más Activos
          </h3>
          <div className="audit-table-wrapper">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Usuario</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {stats.top_users?.slice(0, 10).map((user, index) => {
                  console.log(`User ${index}:`, user);
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{user.username || user.user || 'N/A'}</td>
                      <td><strong>{formatNumber(user.action_count || user.count || user.actions || 0)}</strong></td>
                    </tr>
                  );
                })}
                {(!stats.top_users || stats.top_users.length === 0) && (
                  <tr>
                    <td colSpan="3" className="text-center">No hay datos disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top 10 IPs */}
        <div className="audit-table-card">
          <h3>
            <Globe size={20} />
            Top 10 IPs Más Activas
          </h3>
          <div className="audit-table-wrapper">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Dirección IP</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {stats.top_ips?.slice(0, 10).map((ip, index) => {
                  console.log(`IP ${index}:`, ip);
                  return (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td><code>{ip.ip_address || ip.ip || 'N/A'}</code></td>
                      <td><strong>{formatNumber(ip.action_count || ip.count || ip.actions || 0)}</strong></td>
                    </tr>
                  );
                })}
                {(!stats.top_ips || stats.top_ips.length === 0) && (
                  <tr>
                    <td colSpan="3" className="text-center">No hay datos disponibles</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Errores Recientes */}
      <div className="audit-recent-errors">
        <h3>
          <AlertCircle size={20} />
          Errores Recientes
        </h3>
        <div className="errors-list">
          {stats.recent_errors?.slice(0, 10).map((error, index) => (
            <div key={index} className="error-item">
              <div className="error-header">
                <span className="error-time">
                  {new Date(error.timestamp).toLocaleString('es-ES')}
                </span>
                <span className={`audit-badge audit-badge-severity-${error.severity?.toLowerCase()}`}>
                  {error.severity}
                </span>
              </div>
              <div className="error-content">
                <strong>{error.username || 'Usuario desconocido'}</strong> - 
                <code>{error.endpoint}</code>
              </div>
              <div className="error-message">{error.error_message || 'Sin mensaje de error'}</div>
            </div>
          ))}
          {(!stats.recent_errors || stats.recent_errors.length === 0) && (
            <div className="audit-empty">
              <p>No hay errores recientes 🎉</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditDashboard;
