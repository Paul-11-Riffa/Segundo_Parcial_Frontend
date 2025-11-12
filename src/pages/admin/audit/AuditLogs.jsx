import React, { useState, useEffect, useCallback } from 'react';
import { getAuditLogs, getLogDetail, ACTION_TYPES, SEVERITY_LEVELS, HTTP_METHODS } from '../../../services/admin/auditService';
import { Search, Filter, X, Eye, AlertTriangle, RefreshCw, Download } from 'lucide-react';
import ReactJson from '@microlink/react-json-view';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Audit.css';

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              AUDIT LOGS - TABLA CON FILTROS                  ║
 * ║  Logs de auditoría con filtros, paginación y modal detalle  ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const AuditLogs = () => {
  // Estados
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    action_type: '',
    severity: '',
    success: '',
    http_method: '',
    start_date: '',
    end_date: '',
    ip_address: '',
    ordering: '-timestamp'
  });
  
  // Paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  
  // Modal
  const [selectedLog, setSelectedLog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Date pickers
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Cargar logs
  useEffect(() => {
    loadLogs();
  }, [filters, page, pageSize]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAuditLogs(filters, page, pageSize);
      console.log('📋 Datos de logs recibidos:', data);
      console.log('📋 Primer log:', data.results?.[0]);
      
      // Log para verificar los campos que se están usando
      if (data.results?.[0]) {
        console.log('🔍 Campos del primer log:');
        console.log('  - action_type_display:', data.results[0].action_type_display);
        console.log('  - severity_display:', data.results[0].severity_display);
        console.log('  - ip_address:', data.results[0].ip_address);
        console.log('  - http_method:', data.results[0].http_method);
        console.log('  - response_time_ms:', data.results[0].response_time_ms);
      }
      
      setLogs(data.results || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      console.error('Error al cargar logs:', err);
      setError(err.response?.data?.detail || err.message || 'Error al cargar logs de auditoría');
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio de filtro
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1); // Reset a página 1 al filtrar
  };

  // Manejar fecha inicio
  const handleStartDateChange = (date) => {
    setStartDate(date);
    const formatted = date ? date.toISOString().split('T')[0] : '';
    handleFilterChange('start_date', formatted);
  };

  // Manejar fecha fin
  const handleEndDateChange = (date) => {
    setEndDate(date);
    const formatted = date ? date.toISOString().split('T')[0] : '';
    handleFilterChange('end_date', formatted);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      action_type: '',
      severity: '',
      success: '',
      http_method: '',
      start_date: '',
      end_date: '',
      ip_address: '',
      ordering: '-timestamp'
    });
    setStartDate(null);
    setEndDate(null);
    setPage(1);
  };

  // Ver detalle del log
  const viewLogDetail = async (logId) => {
    try {
      setLoadingDetail(true);
      const detail = await getLogDetail(logId);
      setSelectedLog(detail);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error al cargar detalle:', err);
      alert('Error al cargar detalle del log');
    } finally {
      setLoadingDetail(false);
    }
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedLog(null);
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Formatear tiempo
  const formatTime = (ms) => {
    if (ms == null) return 'N/A';
    if (ms < 1000) return `${ms.toFixed(0)} ms`;
    return `${(ms / 1000).toFixed(2)} s`;
  };

  // Badge de acción
  const getActionBadge = (actionType) => {
    if (!actionType) return <span className="audit-badge">N/A</span>;
    const type = actionType?.toLowerCase() || 'other';
    return <span className={`audit-badge audit-badge-action-${type}`}>{actionType}</span>;
  };

  // Badge de severidad
  const getSeverityBadge = (severity) => {
    if (!severity) return <span className="audit-badge">N/A</span>;
    const sev = severity?.toLowerCase() || 'low';
    return <span className={`audit-badge audit-badge-severity-${sev}`}>{severity}</span>;
  };

  // Badge de status HTTP
  const getStatusBadge = (status) => {
    if (!status) return <span className="audit-badge">N/A</span>;
    let statusClass = 'other';
    if (status >= 200 && status < 300) statusClass = '2xx';
    else if (status >= 300 && status < 400) statusClass = '3xx';
    else if (status >= 400 && status < 500) statusClass = '4xx';
    else if (status >= 500) statusClass = '5xx';
    
    return <span className={`audit-badge audit-badge-status-${statusClass}`}>{status}</span>;
  };

  // Paginación
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalCount);

  const goToPage = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  // Ordenar columna
  const handleSort = (field) => {
    const currentOrdering = filters.ordering;
    let newOrdering = field;
    
    if (currentOrdering === field) {
      newOrdering = `-${field}`;
    } else if (currentOrdering === `-${field}`) {
      newOrdering = field;
    }
    
    handleFilterChange('ordering', newOrdering);
  };

  // Render
  if (loading && logs.length === 0) {
    return (
      <div className="audit-logs">
        <div className="audit-loading">
          <div className="spinner"></div>
          <p>Cargando logs de auditoría...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-logs">
      {/* Header */}
      <div className="audit-dashboard-header">
        <div>
          <h1>
            <Search size={32} />
            Logs de Auditoría
          </h1>
          <p className="audit-subtitle">Registro detallado de todas las acciones del sistema</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={loadLogs} disabled={loading}>
            <RefreshCw size={16} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="audit-filters">
        <div className="filters-row">
          {/* Búsqueda global */}
          <div className="filter-group">
            <label>Búsqueda</label>
            <input
              type="text"
              placeholder="Buscar en logs..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>

          {/* Tipo de Acción */}
          <div className="filter-group">
            <label>Tipo de Acción</label>
            <select
              value={filters.action_type}
              onChange={(e) => handleFilterChange('action_type', e.target.value)}
            >
              <option value="">Todas</option>
              {Object.values(ACTION_TYPES).map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Severidad */}
          <div className="filter-group">
            <label>Severidad</label>
            <select
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
            >
              <option value="">Todas</option>
              {Object.values(SEVERITY_LEVELS).map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div className="filter-group">
            <label>Estado</label>
            <select
              value={filters.success}
              onChange={(e) => handleFilterChange('success', e.target.value)}
            >
              <option value="">Todas</option>
              <option value="true">Exitosas</option>
              <option value="false">Fallidas</option>
            </select>
          </div>
        </div>

        <div className="filters-row">
          {/* Método HTTP */}
          <div className="filter-group">
            <label>Método HTTP</label>
            <select
              value={filters.http_method}
              onChange={(e) => handleFilterChange('http_method', e.target.value)}
            >
              <option value="">Todos</option>
              {HTTP_METHODS.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* Fecha Desde */}
          <div className="filter-group">
            <label>Fecha Desde</label>
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              dateFormat="yyyy-MM-dd"
              placeholderText="YYYY-MM-DD"
              className="filter-input"
            />
          </div>

          {/* Fecha Hasta */}
          <div className="filter-group">
            <label>Fecha Hasta</label>
            <DatePicker
              selected={endDate}
              onChange={handleEndDateChange}
              dateFormat="yyyy-MM-dd"
              placeholderText="YYYY-MM-DD"
              className="filter-input"
            />
          </div>

          {/* IP Address */}
          <div className="filter-group">
            <label>Dirección IP</label>
            <input
              type="text"
              placeholder="ej: 192.168.1.1"
              value={filters.ip_address}
              onChange={(e) => handleFilterChange('ip_address', e.target.value)}
            />
          </div>
        </div>

        <div className="filters-actions">
          <button className="btn-outline" onClick={clearFilters}>
            <X size={16} />
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="audit-error">
          <AlertTriangle size={32} />
          <p>{error}</p>
          <button className="btn-primary" onClick={loadLogs}>Reintentar</button>
        </div>
      )}

      {/* Tabla */}
      {!error && (
        <>
          <div className="audit-table-card">
            <div className="audit-table-wrapper">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('timestamp')} style={{ cursor: 'pointer' }}>
                      Fecha/Hora {filters.ordering.includes('timestamp') && (filters.ordering.startsWith('-') ? '▼' : '▲')}
                    </th>
                    <th onClick={() => handleSort('username')} style={{ cursor: 'pointer' }}>
                      Usuario {filters.ordering.includes('username') && (filters.ordering.startsWith('-') ? '▼' : '▲')}
                    </th>
                    <th>IP</th>
                    <th>Acción</th>
                    <th>Endpoint</th>
                    <th>Status</th>
                    <th>Severidad</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <tr key={log.id}>
                        <td style={{ minWidth: '180px' }}>{formatDate(log.timestamp)}</td>
                        <td>{log.username || 'N/A'}</td>
                        <td><code>{log.ip_address || 'N/A'}</code></td>
                        <td>{getActionBadge(log.action_type_display || log.action_type)}</td>
                        <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <code>{log.endpoint || 'N/A'}</code>
                        </td>
                        <td>{getStatusBadge(log.response_status)}</td>
                        <td>{getSeverityBadge(log.severity_display || log.severity)}</td>
                        <td>
                          <button
                            className="btn-outline"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                            onClick={() => viewLogDetail(log.id)}
                            disabled={loadingDetail}
                          >
                            <Eye size={14} />
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center">
                        {loading ? 'Cargando...' : 'No hay logs disponibles con los filtros seleccionados'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          <div className="audit-pagination">
            <div className="pagination-info">
              Mostrando {startIndex}-{endIndex} de {totalCount} registros
            </div>
            
            <div className="pagination-controls">
              <button 
                className="pagination-btn" 
                onClick={() => goToPage(1)} 
                disabled={page === 1}
              >
                Primera
              </button>
              <button 
                className="pagination-btn" 
                onClick={() => goToPage(page - 1)} 
                disabled={page === 1}
              >
                Anterior
              </button>
              
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    className={`pagination-btn ${page === pageNum ? 'active' : ''}`}
                    onClick={() => goToPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                className="pagination-btn" 
                onClick={() => goToPage(page + 1)} 
                disabled={page === totalPages}
              >
                Siguiente
              </button>
              <button 
                className="pagination-btn" 
                onClick={() => goToPage(totalPages)} 
                disabled={page === totalPages}
              >
                Última
              </button>
            </div>
            
            <div className="page-size-selector">
              <span>Por página:</span>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* Modal de Detalle */}
      {isModalOpen && selectedLog && (
        <div className="audit-modal-overlay" onClick={closeModal}>
          <div className="audit-modal" onClick={(e) => e.stopPropagation()}>
            <div className="audit-modal-header">
              <h2>Detalle del Log #{selectedLog.id}</h2>
              <button className="modal-close-btn" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            
            <div className="audit-modal-content">
              {/* Información Básica */}
              <div className="modal-section">
                <h3>Información Básica</h3>
                <div className="modal-field">
                  <span className="modal-field-label">ID:</span>
                  <span className="modal-field-value">{selectedLog.id}</span>
                </div>
                <div className="modal-field">
                  <span className="modal-field-label">Timestamp:</span>
                  <span className="modal-field-value">{formatDate(selectedLog.timestamp)}</span>
                </div>
                <div className="modal-field">
                  <span className="modal-field-label">Usuario:</span>
                  <span className="modal-field-value">{selectedLog.username || 'N/A'}</span>
                </div>
                <div className="modal-field">
                  <span className="modal-field-label">IP Address:</span>
                  <span className="modal-field-value"><code>{selectedLog.ip_address || 'N/A'}</code></span>
                </div>
                <div className="modal-field">
                  <span className="modal-field-label">Tipo de Acción:</span>
                  <span className="modal-field-value">{getActionBadge(selectedLog.action_type_display || selectedLog.action_type)}</span>
                </div>
                <div className="modal-field">
                  <span className="modal-field-label">Descripción:</span>
                  <span className="modal-field-value">{selectedLog.action_description || 'N/A'}</span>
                </div>
                <div className="modal-field">
                  <span className="modal-field-label">Severidad:</span>
                  <span className="modal-field-value">{getSeverityBadge(selectedLog.severity_display || selectedLog.severity)}</span>
                </div>
              </div>

              {/* Petición HTTP */}
              <div className="modal-section">
                <h3>Petición HTTP</h3>
                <div className="modal-field">
                  <span className="modal-field-label">Método:</span>
                  <span className="modal-field-value"><code>{selectedLog.http_method || 'N/A'}</code></span>
                </div>
                <div className="modal-field">
                  <span className="modal-field-label">Endpoint:</span>
                  <span className="modal-field-value"><code>{selectedLog.endpoint || 'N/A'}</code></span>
                </div>
                {selectedLog.query_params && (
                  <div className="modal-field">
                    <span className="modal-field-label">Query Params:</span>
                    <div className="modal-field-value">
                      {(() => {
                        try {
                          // Si es un objeto, mostrarlo con ReactJson
                          if (typeof selectedLog.query_params === 'object') {
                            return (
                              <ReactJson 
                                src={selectedLog.query_params}
                                theme="monokai"
                                collapsed={1}
                                displayDataTypes={false}
                              />
                            );
                          }
                          // Si es string, intentar parsear como JSON
                          const parsed = JSON.parse(selectedLog.query_params);
                          return (
                            <ReactJson 
                              src={parsed}
                              theme="monokai"
                              collapsed={1}
                              displayDataTypes={false}
                            />
                          );
                        } catch (e) {
                          // Si falla el parse, es un query string normal (ej: "days=7")
                          // Mostrarlo como código simple
                          return <code>{selectedLog.query_params}</code>;
                        }
                      })()}
                    </div>
                  </div>
                )}
                {selectedLog.request_body && (
                  <div className="modal-field">
                    <span className="modal-field-label">Request Body:</span>
                    <div className="modal-field-value">
                      {(() => {
                        try {
                          if (typeof selectedLog.request_body === 'object') {
                            return (
                              <ReactJson 
                                src={selectedLog.request_body}
                                theme="monokai"
                                collapsed={1}
                                displayDataTypes={false}
                              />
                            );
                          }
                          const parsed = JSON.parse(selectedLog.request_body);
                          return (
                            <ReactJson 
                              src={parsed}
                              theme="monokai"
                              collapsed={1}
                              displayDataTypes={false}
                            />
                          );
                        } catch (e) {
                          return <code>{selectedLog.request_body}</code>;
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Respuesta HTTP */}
              <div className="modal-section">
                <h3>Respuesta HTTP</h3>
                <div className="modal-field">
                  <span className="modal-field-label">Status:</span>
                  <span className="modal-field-value">{getStatusBadge(selectedLog.response_status)}</span>
                </div>
                <div className="modal-field">
                  <span className="modal-field-label">Tiempo:</span>
                  <span className="modal-field-value">{formatTime(selectedLog.response_time_ms)}</span>
                </div>
                <div className="modal-field">
                  <span className="modal-field-label">Éxito:</span>
                  <span className="modal-field-value">{selectedLog.success ? '✓ Sí' : '✗ No'}</span>
                </div>
                {selectedLog.error_message && (
                  <div className="modal-field">
                    <span className="modal-field-label">Error:</span>
                    <span className="modal-field-value" style={{ color: '#dc2626' }}>{selectedLog.error_message}</span>
                  </div>
                )}
                {selectedLog.response_body && (
                  <div className="modal-field">
                    <span className="modal-field-label">Response Body:</span>
                    <div className="modal-field-value">
                      {(() => {
                        try {
                          if (typeof selectedLog.response_body === 'object') {
                            return (
                              <ReactJson 
                                src={selectedLog.response_body}
                                theme="monokai"
                                collapsed={1}
                                displayDataTypes={false}
                              />
                            );
                          }
                          const parsed = JSON.parse(selectedLog.response_body);
                          return (
                            <ReactJson 
                              src={parsed}
                              theme="monokai"
                              collapsed={1}
                              displayDataTypes={false}
                            />
                          );
                        } catch (e) {
                          return <code>{selectedLog.response_body}</code>;
                        }
                      })()}
                    </div>
                  </div>
                )}
              </div>

              {/* Contexto */}
              <div className="modal-section">
                <h3>Contexto</h3>
                <div className="modal-field">
                  <span className="modal-field-label">IP Address:</span>
                  <span className="modal-field-value"><code>{selectedLog.ip_address}</code></span>
                </div>
                <div className="modal-field">
                  <span className="modal-field-label">User Agent:</span>
                  <span className="modal-field-value" style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                    {selectedLog.user_agent || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
