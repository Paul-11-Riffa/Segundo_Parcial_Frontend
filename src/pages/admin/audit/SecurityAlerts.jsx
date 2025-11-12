import React, { useState, useEffect } from 'react';
import { getSecurityAlerts } from '../../../services/admin/auditService';
import { 
  Shield, AlertTriangle, RefreshCw, Lock, Zap, Globe, 
  Server, Trash2, Activity, CheckCircle, ChevronDown, ChevronRight
} from 'lucide-react';
import './Audit.css';

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║           SECURITY ALERTS - ALERTAS DE SEGURIDAD             ║
 * ║  Panel de alertas agrupadas con auto-refresh                 ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// Iconos por tipo de alerta
const ALERT_ICONS = {
  failed_logins: Lock,
  critical_actions: AlertTriangle,
  multiple_ips: Globe,
  server_errors: Server,
  bulk_deletions: Trash2,
  unusual_activity: Activity
};

// Colores por severidad
const SEVERITY_COLORS = {
  LOW: '#6b7280',
  MEDIUM: '#3b82f6',
  HIGH: '#f59e0b',
  CRITICAL: '#ef4444'
};

const SecurityAlerts = () => {
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAlerts, setExpandedAlerts] = useState(new Set());
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Cargar alertas
  useEffect(() => {
    loadAlerts();
    
    // Auto-refresh cada 60 segundos
    const interval = setInterval(() => {
      loadAlerts();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSecurityAlerts();
      setAlerts(data);
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error al cargar alertas:', err);
      setError(err.response?.data?.detail || err.message || 'Error al cargar alertas de seguridad');
    } finally {
      setLoading(false);
    }
  };

  // Toggle expand/collapse de una alerta
  const toggleAlert = (alertType) => {
    const newExpanded = new Set(expandedAlerts);
    if (newExpanded.has(alertType)) {
      newExpanded.delete(alertType);
    } else {
      newExpanded.add(alertType);
    }
    setExpandedAlerts(newExpanded);
  };

  // Renderizar detalles según tipo de alerta
  const renderAlertDetails = (alert) => {
    if (!expandedAlerts.has(alert.type) || !alert.details || alert.details.length === 0) {
      return null;
    }

    switch (alert.type) {
      case 'failed_logins':
        return (
          <div className="alert-details">
            {alert.details.map((detail, index) => (
              <div key={index} className="alert-detail-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>IP: <code>{detail.ip_address}</code></strong>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>
                    {detail.failed_attempts} intentos fallidos
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  <div>Usuarios intentados: {detail.usernames.join(', ')}</div>
                  <div>Primer intento: {new Date(detail.first_attempt).toLocaleString('es-ES')}</div>
                  <div>Último intento: {new Date(detail.last_attempt).toLocaleString('es-ES')}</div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'critical_actions':
        return (
          <div className="alert-details">
            {alert.details.map((detail, index) => (
              <div key={index} className="alert-detail-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div>
                    <strong>{detail.username}</strong> - <code>{detail.endpoint}</code>
                  </div>
                  <span className="audit-badge audit-badge-status-5xx">{detail.response_status}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  <div>Timestamp: {new Date(detail.timestamp).toLocaleString('es-ES')}</div>
                  <div style={{ color: '#dc2626', fontWeight: 500 }}>{detail.error_message}</div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'multiple_ips':
        return (
          <div className="alert-details">
            {alert.details.map((detail, index) => (
              <div key={index} className="alert-detail-item">
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>{detail.username}</strong> - {detail.ip_count} IPs diferentes
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  {detail.ip_addresses.map((ipInfo, i) => (
                    <div key={i} style={{ marginBottom: '0.25rem' }}>
                      <code>{ipInfo.ip_address}</code> - {ipInfo.action_count} acciones
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'server_errors':
        return (
          <div className="alert-details">
            {alert.details.map((detail, index) => (
              <div key={index} className="alert-detail-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <div>
                    <strong>{detail.username || 'Sistema'}</strong> - <code>{detail.endpoint}</code>
                  </div>
                  <span className="audit-badge audit-badge-status-5xx">{detail.response_status}</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  <div>Timestamp: {new Date(detail.timestamp).toLocaleString('es-ES')}</div>
                  <div style={{ color: '#dc2626', fontWeight: 500 }}>{detail.error_message}</div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'bulk_deletions':
        return (
          <div className="alert-details">
            {alert.details.map((detail, index) => (
              <div key={index} className="alert-detail-item">
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>{detail.username}</strong> - {detail.deletion_count} eliminaciones
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  <div>Desde IP: <code>{detail.ip_address}</code></div>
                  <div>Período: {new Date(detail.start_time).toLocaleString('es-ES')} - {new Date(detail.end_time).toLocaleString('es-ES')}</div>
                  <div>Endpoints: {detail.endpoints.join(', ')}</div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'unusual_activity':
        return (
          <div className="alert-details">
            {alert.details.map((detail, index) => (
              <div key={index} className="alert-detail-item">
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>{detail.username}</strong> - {detail.total_actions} acciones
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  <div>Endpoints únicos: {detail.unique_endpoints}</div>
                  <div>Endpoint más frecuente: <code>{detail.most_frequent_action}</code></div>
                  <div>Acciones por hora: ~{Math.round(detail.total_actions / 24)}</div>
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return (
          <div className="alert-details">
            <pre style={{ fontSize: '0.85rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
              {JSON.stringify(alert.details, null, 2)}
            </pre>
          </div>
        );
    }
  };

  // Render Loading
  if (loading && !alerts) {
    return (
      <div className="audit-security-alerts">
        <div className="audit-loading">
          <div className="spinner"></div>
          <p>Cargando alertas de seguridad...</p>
        </div>
      </div>
    );
  }

  // Render Error
  if (error) {
    return (
      <div className="audit-security-alerts">
        <div className="audit-error">
          <AlertTriangle size={48} />
          <h3>Error al cargar alertas</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={loadAlerts}>
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Render Sin Alertas
  if (alerts && alerts.total_alerts === 0) {
    return (
      <div className="audit-security-alerts">
        <div className="security-alerts-header">
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
              <Shield size={32} />
              Alertas de Seguridad
            </h1>
          </div>
          <button className="alert-refresh-btn" onClick={loadAlerts} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            Actualizar
          </button>
        </div>

        <div className="no-alerts-state">
          <CheckCircle size={64} color="#059669" />
          <h3>✅ No hay alertas de seguridad</h3>
          <p>El sistema está operando normalmente</p>
          <p className="text-muted">
            Período analizado: {alerts.period}<br />
            Última actualización: {lastUpdate.toLocaleString('es-ES')}
          </p>
        </div>
      </div>
    );
  }

  // Agrupar alertas por severidad
  const criticalAlerts = alerts?.alerts?.filter(a => a.severity === 'CRITICAL') || [];
  const highAlerts = alerts?.alerts?.filter(a => a.severity === 'HIGH') || [];
  const mediumAlerts = alerts?.alerts?.filter(a => a.severity === 'MEDIUM') || [];
  const lowAlerts = alerts?.alerts?.filter(a => a.severity === 'LOW') || [];

  return (
    <div className="audit-security-alerts">
      {/* Header */}
      <div className="security-alerts-header">
        <div className="alerts-stats">
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
              <Shield size={32} />
              Alertas de Seguridad
            </h1>
            <p className="alerts-period">{alerts?.period || 'Últimas 24 horas'}</p>
          </div>
          <div>
            <div className="alerts-total">{alerts?.total_alerts || 0}</div>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>alertas detectadas</p>
          </div>
        </div>
        
        <div>
          <button className="alert-refresh-btn" onClick={loadAlerts} disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spinning' : ''} />
            Actualizar
          </button>
          <p className="text-muted" style={{ marginTop: '0.5rem', marginBottom: 0 }}>
            Última actualización: {lastUpdate.toLocaleString('es-ES')}
          </p>
        </div>
      </div>

      {/* Alertas CRITICAL */}
      {criticalAlerts.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', margin: '1.5rem 0 1rem 0' }}>
            🔴 Críticas ({criticalAlerts.length})
          </h2>
          <div className="alerts-list">
            {criticalAlerts.map((alert, index) => {
              const Icon = ALERT_ICONS[alert.type] || AlertTriangle;
              const isExpanded = expandedAlerts.has(alert.type);
              
              return (
                <div key={index} className="alert-card alert-card-critical">
                  <div className="alert-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon size={24} color={SEVERITY_COLORS[alert.severity]} />
                    </div>
                    <div className="alert-title-section">
                      <h3>{alert.title}</h3>
                      <span className="alert-count">{alert.count} eventos</span>
                    </div>
                    <span className={`audit-badge audit-badge-severity-${alert.severity.toLowerCase()}`}>
                      {alert.severity}
                    </span>
                    <button className="alert-expand-btn" onClick={() => toggleAlert(alert.type)}>
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                  </div>
                  
                  <p className="alert-description">{alert.description}</p>
                  <p className="alert-recommendation">💡 {alert.recommendation}</p>
                  
                  {renderAlertDetails(alert)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alertas HIGH */}
      {highAlerts.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', margin: '1.5rem 0 1rem 0' }}>
            🟠 Altas ({highAlerts.length})
          </h2>
          <div className="alerts-list">
            {highAlerts.map((alert, index) => {
              const Icon = ALERT_ICONS[alert.type] || AlertTriangle;
              const isExpanded = expandedAlerts.has(alert.type);
              
              return (
                <div key={index} className="alert-card alert-card-high">
                  <div className="alert-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon size={24} color={SEVERITY_COLORS[alert.severity]} />
                    </div>
                    <div className="alert-title-section">
                      <h3>{alert.title}</h3>
                      <span className="alert-count">{alert.count} eventos</span>
                    </div>
                    <span className={`audit-badge audit-badge-severity-${alert.severity.toLowerCase()}`}>
                      {alert.severity}
                    </span>
                    <button className="alert-expand-btn" onClick={() => toggleAlert(alert.type)}>
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                  </div>
                  
                  <p className="alert-description">{alert.description}</p>
                  <p className="alert-recommendation">💡 {alert.recommendation}</p>
                  
                  {renderAlertDetails(alert)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alertas MEDIUM */}
      {mediumAlerts.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', margin: '1.5rem 0 1rem 0' }}>
            🟡 Medias ({mediumAlerts.length})
          </h2>
          <div className="alerts-list">
            {mediumAlerts.map((alert, index) => {
              const Icon = ALERT_ICONS[alert.type] || AlertTriangle;
              const isExpanded = expandedAlerts.has(alert.type);
              
              return (
                <div key={index} className="alert-card alert-card-medium">
                  <div className="alert-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon size={24} color={SEVERITY_COLORS[alert.severity]} />
                    </div>
                    <div className="alert-title-section">
                      <h3>{alert.title}</h3>
                      <span className="alert-count">{alert.count} eventos</span>
                    </div>
                    <span className={`audit-badge audit-badge-severity-${alert.severity.toLowerCase()}`}>
                      {alert.severity}
                    </span>
                    <button className="alert-expand-btn" onClick={() => toggleAlert(alert.type)}>
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                  </div>
                  
                  <p className="alert-description">{alert.description}</p>
                  <p className="alert-recommendation">💡 {alert.recommendation}</p>
                  
                  {renderAlertDetails(alert)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alertas LOW */}
      {lowAlerts.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111827', margin: '1.5rem 0 1rem 0' }}>
            ⚪ Bajas ({lowAlerts.length})
          </h2>
          <div className="alerts-list">
            {lowAlerts.map((alert, index) => {
              const Icon = ALERT_ICONS[alert.type] || Activity;
              const isExpanded = expandedAlerts.has(alert.type);
              
              return (
                <div key={index} className="alert-card">
                  <div className="alert-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Icon size={24} color={SEVERITY_COLORS[alert.severity]} />
                    </div>
                    <div className="alert-title-section">
                      <h3>{alert.title}</h3>
                      <span className="alert-count">{alert.count} eventos</span>
                    </div>
                    <span className={`audit-badge audit-badge-severity-${alert.severity.toLowerCase()}`}>
                      {alert.severity}
                    </span>
                    <button className="alert-expand-btn" onClick={() => toggleAlert(alert.type)}>
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    </button>
                  </div>
                  
                  <p className="alert-description">{alert.description}</p>
                  <p className="alert-recommendation">💡 {alert.recommendation}</p>
                  
                  {renderAlertDetails(alert)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CSS inline para animación de spinning */}
      <style>{`
        @keyframes spinning {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinning {
          animation: spinning 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default SecurityAlerts;
