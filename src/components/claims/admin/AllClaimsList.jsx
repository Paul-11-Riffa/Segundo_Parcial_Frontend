import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import claimService from '../../../services/claimService';
import StatusBadge from '../StatusBadge';
import PriorityBadge from '../PriorityBadge';

const AllClaimsList = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [orderBy, setOrderBy] = useState('-created_at');

  useEffect(() => {
    loadClaims();
  }, [statusFilter, priorityFilter, orderBy]);

  const loadClaims = async () => {
    setLoading(true);
    setError('');

    try {
      // Llamar al endpoint de administrador (todos los reclamos)
      const data = await claimService.getAllClaims({
        status: statusFilter,
        priority: priorityFilter,
        ordering: orderBy,
      });

      // Validar si es array o tiene propiedad 'results'
      let claimsArray = [];
      if (Array.isArray(data)) {
        claimsArray = data;
      } else if (data?.results && Array.isArray(data.results)) {
        claimsArray = data.results;
      }

      setClaims(claimsArray);
    } catch (err) {
      console.error('Error al cargar reclamos:', err);
      setError('Error al cargar los reclamos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadClaims();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setPriorityFilter('');
    setOrderBy('-created_at');
  };

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      searchTerm === '' ||
      claim.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.user_email?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '1rem',
        backgroundColor: '#fee',
        borderLeft: '4px solid #c00',
        borderRadius: '0.25rem',
      }}>
        <p style={{ color: '#c00' }}>{error}</p>
        <button
          onClick={loadClaims}
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="all-claims-list" style={{ width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '2rem', 
          fontWeight: 'bold', 
          marginBottom: '0.5rem',
          color: '#000',
        }}>
          Todos los Reclamos
        </h2>
        <p style={{ color: '#666' }}>
          Gestiona todos los reclamos de los clientes
        </p>
      </div>

      {/* Filtros */}
      <div style={{
        backgroundColor: '#fff',
        border: '2px solid #000',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        marginBottom: '2rem',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1rem',
        }}>
          {/* Búsqueda */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#000',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Buscar
            </label>
            <input
              type="text"
              placeholder="Ticket, título, producto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '2px solid #000',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
              }}
            />
          </div>

          {/* Filtro Estado */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#000',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '2px solid #000',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
                backgroundColor: '#fff',
              }}
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendiente</option>
              <option value="IN_REVIEW">En Revisión</option>
              <option value="REQUIRES_INFO">Requiere Info</option>
              <option value="APPROVED">Aprobado</option>
              <option value="REJECTED">Rechazado</option>
              <option value="RESOLVED">Resuelto</option>
              <option value="CLOSED">Cerrado</option>
            </select>
          </div>

          {/* Filtro Prioridad */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#000',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Prioridad
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '2px solid #000',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
                backgroundColor: '#fff',
              }}
            >
              <option value="">Todas</option>
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </select>
          </div>

          {/* Ordenamiento */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '600',
              marginBottom: '0.5rem',
              color: '#000',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Ordenar por
            </label>
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                border: '2px solid #000',
                borderRadius: '0.25rem',
                fontSize: '0.875rem',
                backgroundColor: '#fff',
              }}
            >
              <option value="-created_at">Más recientes</option>
              <option value="created_at">Más antiguos</option>
              <option value="-priority">Mayor prioridad</option>
              <option value="status">Estado</option>
            </select>
          </div>
        </div>

        {/* Botones de Acción */}
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button
            onClick={handleClearFilters}
            style={{
              padding: '0.5rem 1rem',
              border: '2px solid #000',
              backgroundColor: '#fff',
              color: '#000',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Limpiar Filtros
          </button>
          <button
            onClick={handleSearch}
            style={{
              padding: '0.5rem 1rem',
              border: '2px solid #000',
              backgroundColor: '#000',
              color: '#fff',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Tabla de Reclamos */}
      {!Array.isArray(claims) || filteredClaims.length === 0 ? (
        <div style={{
          backgroundColor: '#fff',
          border: '2px solid #000',
          borderRadius: '0.5rem',
          padding: '3rem',
          textAlign: 'center',
        }}>
          <p style={{ color: '#666', fontSize: '1.125rem' }}>
            No hay reclamos para mostrar
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div style={{
            backgroundColor: '#fff',
            border: '2px solid #000',
            borderRadius: '0.5rem',
            overflow: 'hidden',
            display: 'none',
          }} className="desktop-only">
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead>
                <tr style={{ backgroundColor: '#000', color: '#fff' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ticket</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cliente</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Producto</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estado</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prioridad</th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha</th>
                  <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '700', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((claim, index) => (
                  <tr
                    key={claim.id}
                    style={{
                      borderBottom: index < filteredClaims.length - 1 ? '1px solid #e5e7eb' : 'none',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '1rem' }}>
                      <span style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                        {claim.ticket_number}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: '500' }}>{claim.user_name || 'N/A'}</div>
                        <div style={{ fontSize: '0.875rem', color: '#666' }}>{claim.user_email || ''}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '500' }}>{claim.product_name || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <StatusBadge status={claim.status} />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <PriorityBadge priority={claim.priority} />
                    </td>
                    <td style={{ padding: '1rem', color: '#666', fontSize: '0.875rem' }}>
                      {formatDate(claim.created_at)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <Link
                        to={`/admin/claims/${claim.id}`}
                        style={{
                          display: 'inline-block',
                          padding: '0.5rem 1rem',
                          backgroundColor: '#000',
                          color: '#fff',
                          textDecoration: 'none',
                          borderRadius: '0.25rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          transition: 'transform 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        Gestionar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div style={{ display: 'none' }} className="mobile-only">
            {filteredClaims.map((claim) => (
              <div
                key={claim.id}
                style={{
                  backgroundColor: '#fff',
                  border: '2px solid #000',
                  borderRadius: '0.5rem',
                  padding: '1.5rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{
                    fontWeight: '600',
                    fontFamily: 'monospace',
                    fontSize: '1.125rem',
                  }}>
                    {claim.ticket_number}
                  </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem', fontWeight: '600', textTransform: 'uppercase' }}>Cliente</div>
                  <div style={{ fontWeight: '500' }}>{claim.user_name || 'N/A'}</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>{claim.user_email || ''}</div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem', fontWeight: '600', textTransform: 'uppercase' }}>Producto</div>
                  <div>{claim.product_name || 'N/A'}</div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                  <StatusBadge status={claim.status} />
                  <PriorityBadge priority={claim.priority} />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>
                    {formatDate(claim.created_at)}
                  </div>
                </div>

                <Link
                  to={`/admin/claims/${claim.id}`}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: '#000',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '0.25rem',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    textAlign: 'center',
                  }}
                >
                  Gestionar Reclamo
                </Link>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Contador de resultados */}
      {filteredClaims.length > 0 && (
        <div style={{
          marginTop: '1rem',
          padding: '1rem',
          textAlign: 'center',
          color: '#666',
          fontSize: '0.875rem',
        }}>
          Mostrando {filteredClaims.length} de {claims.length} reclamos
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-only {
            display: block !important;
          }
          .mobile-only {
            display: none !important;
          }
        }

        @media (max-width: 767px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AllClaimsList;
