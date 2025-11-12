import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import claimService, { CLAIM_STATUSES, PRIORITIES } from '../../services/claimService';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import './MyClaimsList.css';

const MyClaimsList = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    ordering: '-created_at',
  });

  useEffect(() => {
    loadClaims();
  }, [filters]);

  const loadClaims = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await claimService.getMyClaims();
      console.log('📋 Respuesta de getMyClaims():', data);
      console.log('📋 Tipo de data:', typeof data);
      console.log('📋 Es array?', Array.isArray(data));
      
      // Extraer el array de reclamos según el formato de respuesta
      let claimsArray = [];
      if (Array.isArray(data)) {
        claimsArray = data;
      } else if (data && Array.isArray(data.results)) {
        claimsArray = data.results;
      } else if (data && Array.isArray(data.claims)) {
        claimsArray = data.claims;
      } else {
        console.warn('⚠️ Formato de respuesta inesperado:', data);
        claimsArray = [];
      }
      
      console.log('✅ Claims array extraído:', claimsArray);
      
      // Aplicar filtros del lado del cliente (si no se aplicaron en el servidor)
      let filteredClaims = claimsArray;
      
      if (filters.status) {
        filteredClaims = filteredClaims.filter(c => c.status === filters.status);
      }
      
      if (filters.priority) {
        filteredClaims = filteredClaims.filter(c => c.priority === filters.priority);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredClaims = filteredClaims.filter(
          c =>
            c.ticket_number.toLowerCase().includes(searchLower) ||
            c.title.toLowerCase().includes(searchLower) ||
            c.product_name.toLowerCase().includes(searchLower)
        );
      }

      setClaims(filteredClaims);
    } catch (err) {
      console.error('Error al cargar reclamos:', err);
      setError('Error al cargar los reclamos. Por favor, intenta de nuevo.');
      setClaims([]); // Asegurar que claims sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      search: '',
      ordering: '-created_at',
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="my-claims-container">
        <div className="my-claims-loading">
          <div className="my-claims-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-claims-container">
      {/* Header */}
      <div className="my-claims-header">
        <h1 className="my-claims-title">Mis Reclamos</h1>
        <Link to="/claims/create" className="my-claims-new-button">
          + Nuevo Reclamo
        </Link>
      </div>

      {/* Filtros */}
      <div className="my-claims-filters">
        <div className="my-claims-filters-grid">
          {/* Búsqueda */}
          <div className="my-claims-filter-group">
            <label className="my-claims-filter-label">
              Buscar
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Ticket, título o producto..."
              className="my-claims-filter-input"
            />
          </div>

          {/* Estado */}
          <div className="my-claims-filter-group">
            <label className="my-claims-filter-label">
              Estado
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="my-claims-filter-select"
            >
              <option value="">Todos</option>
              {Object.values(CLAIM_STATUSES).map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Prioridad */}
          <div className="my-claims-filter-group">
            <label className="my-claims-filter-label">
              Prioridad
            </label>
            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="my-claims-filter-select"
            >
              <option value="">Todas</option>
              {Object.values(PRIORITIES).map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          {/* Ordenar */}
          <div className="my-claims-filter-group">
            <label className="my-claims-filter-label">
              Ordenar por
            </label>
            <select
              name="ordering"
              value={filters.ordering}
              onChange={handleFilterChange}
              className="my-claims-filter-select"
            >
              <option value="-created_at">Más Recientes</option>
              <option value="created_at">Más Antiguos</option>
              <option value="priority">Prioridad</option>
              <option value="-priority">Prioridad (Desc)</option>
            </select>
          </div>
        </div>

        <div className="my-claims-filters-actions">
          <button
            onClick={clearFilters}
            className="my-claims-clear-button"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="my-claims-error">
          <div className="my-claims-error-icon">⚠️</div>
          <h3 className="my-claims-error-title">Error</h3>
          <p className="my-claims-error-message">{error}</p>
          <button onClick={loadClaims} className="my-claims-error-button">
            Reintentar
          </button>
        </div>
      )}

      {/* Lista de Reclamos */}
      {!Array.isArray(claims) || claims.length === 0 ? (
        <div className="my-claims-empty">
          <div className="my-claims-empty-icon">📋</div>
          <h2 className="my-claims-empty-title">No hay reclamos</h2>
          <p className="my-claims-empty-description">
            {filters.status || filters.priority || filters.search
              ? 'No se encontraron reclamos con los filtros aplicados.'
              : 'Aún no has creado ningún reclamo.'}
          </p>
          {!filters.status && !filters.priority && !filters.search && (
            <Link to="/claims/create" className="my-claims-empty-button">
              + Crear Primer Reclamo
            </Link>
          )}
        </div>
      ) : (
        <div className="my-claims-table-wrapper">
          <table className="my-claims-table">
            <thead>
              <tr>
                <th>Ticket</th>
                <th>Producto</th>
                <th>Título</th>
                <th>Estado</th>
                <th>Prioridad</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(claims) && claims.map((claim) => (
                <tr key={claim.id} className="hover:bg-gray-50">
                  <td data-label="Ticket">
                    <div className="my-claims-ticket">
                      {claim.ticket_number}
                    </div>
                  </td>
                  <td data-label="Producto">
                    <div className="my-claims-product-name">{claim.product_name}</div>
                  </td>
                  <td data-label="Título">
                    <div className="my-claims-title">{claim.title}</div>
                  </td>
                  <td data-label="Estado">
                    <StatusBadge status={claim.status} />
                  </td>
                  <td data-label="Prioridad">
                    <PriorityBadge priority={claim.priority} />
                  </td>
                  <td data-label="Fecha">
                    <div className="my-claims-date-container">
                      <span className="my-claims-date-primary">{formatDate(claim.created_at)}</span>
                      <span className="my-claims-date-secondary">
                        {claim.days_open} día{claim.days_open !== 1 ? 's' : ''} abierto
                      </span>
                    </div>
                  </td>
                  <td data-label="Acciones">
                    <Link to={`/claims/${claim.id}`} className="my-claims-view-button">
                      Ver Detalle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MyClaimsList;
