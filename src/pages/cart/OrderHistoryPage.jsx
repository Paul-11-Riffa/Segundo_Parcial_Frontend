/**
 * OrderHistoryPage - Página de Historial de Órdenes
 * 
 * Funcionalidades:
 * - Muestra todas las órdenes completadas del usuario (GET /my-orders/)
 * - Lista ordenada por fecha (más reciente primero)
 * - Detalles expandibles para cada orden
 * - Estados visuales según el status de la orden
 * - Maneja estados de carga, error y sin órdenes
 * - Responsive: cards en mobile, tabla en desktop
 * 
 * Uso:
 * Protegida por ProtectedRoute en App.jsx
 * Ruta: /my-orders
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import cartService from '../../services/cartService';
import CreateClaimButton from '../../components/claims/CreateClaimButton';
import './OrderHistoryPage.css';

const OrderHistoryPage = () => {
  // ============================================================================
  // ESTADO
  // ============================================================================
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [downloadingOrders, setDownloadingOrders] = useState(new Set());

  // ============================================================================
  // EFECTOS
  // ============================================================================

  /**
   * Carga el historial de órdenes al montar el componente
   */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await cartService.getOrderHistory();
        
        console.log('📦 Response completa del backend:', response);
        console.log('📦 Tipo de response:', typeof response);
        console.log('📦 Es array?', Array.isArray(response));
        
        // Extraer el array de órdenes según el formato de respuesta
        let ordersArray = [];
        
        if (Array.isArray(response)) {
          // Caso 1: Response es directamente un array
          ordersArray = response;
        } else if (response && Array.isArray(response.results)) {
          // Caso 2: Response tiene paginación { results: [...], count: X }
          ordersArray = response.results;
        } else if (response && Array.isArray(response.orders)) {
          // Caso 3: Response tiene propiedad orders { orders: [...] }
          ordersArray = response.orders;
        } else if (response && typeof response === 'object') {
          // Caso 4: Response es objeto, intentar encontrar el array
          console.warn('⚠️ Formato de respuesta inesperado:', response);
          ordersArray = [];
        } else {
          console.error('❌ Response no es válida:', response);
          ordersArray = [];
        }
        
        // Filtrar órdenes con total > 0 (eliminar órdenes de prueba o vacías)
        const validOrders = ordersArray.filter(order => {
          const total = parseFloat(order.total_price || order.total_amount || 0);
          return total > 0;
        });
        
        // Ordenar por fecha (más reciente primero)
        const sortedOrders = validOrders.sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });

        setOrders(sortedOrders);
        console.log('✅ Órdenes válidas cargadas:', sortedOrders.length);
        console.log('🗑️ Órdenes con $0 filtradas:', ordersArray.length - validOrders.length);

      } catch (err) {
        console.error('Error al cargar historial de órdenes:', err);
        setError(err.message || 'Error al cargar tus órdenes');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Toggle para expandir/colapsar detalles de una orden
   */
  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  /**
   * Descarga el comprobante PDF de una orden
   */
  const handleDownloadReceipt = async (orderId) => {
    try {
      // Marcar como descargando
      setDownloadingOrders(prev => new Set(prev).add(orderId));
      
      // Descargar PDF
      await cartService.downloadReceipt(orderId);
      
      // Mostrar feedback (opcional - puedes usar toast si prefieres)
      alert('✅ Comprobante descargado exitosamente');
      
    } catch (err) {
      console.error('Error al descargar comprobante:', err);
      
      // Mensaje personalizado según el error
      let errorMessage = err.message || 'Error al descargar el comprobante';
      
      if (err.message?.includes('permisos') || err.message?.includes('403')) {
        errorMessage = `❌ El servidor no permite descargar este comprobante.\n\n` +
                      `Esto es un problema del backend que necesita ser corregido.\n` +
                      `Por favor contacta al administrador del sistema.`;
      }
      
      alert(errorMessage);
    } finally {
      // Quitar marca de descargando
      setDownloadingOrders(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
      });
    }
  };

  // ============================================================================
  // FUNCIONES AUXILIARES
  // ============================================================================

  /**
   * Formatea la fecha en formato legible
   */
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  /**
   * Calcula el total de items en una orden
   */
  const getTotalItems = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  /**
   * Retorna el estilo y texto del badge según el status
   */
  const getStatusInfo = (status) => {
    const statusMap = {
      'PENDING': { text: 'Pendiente', class: 'pending' },
      'PROCESSING': { text: 'Procesando', class: 'processing' },
      'COMPLETED': { text: 'Completado', class: 'completed' },
      'CANCELLED': { text: 'Cancelado', class: 'cancelled' }
    };

    return statusMap[status] || { text: status, class: 'default' };
  };

  // ============================================================================
  // RENDERIZADO CONDICIONAL
  // ============================================================================

  /**
   * Muestra skeleton loader mientras carga
   */
  if (loading) {
    return (
      <div className="order-history-page">
        <div className="order-history-page__container">
          <h1 className="order-history-page__title">Mis Órdenes</h1>
          <div className="order-history-page__loading">
            <div className="order-history-page__loading-spinner"></div>
            <p>Cargando tus órdenes...</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Muestra error si algo salió mal
   */
  if (error) {
    return (
      <div className="order-history-page">
        <div className="order-history-page__container">
          <h1 className="order-history-page__title">Mis Órdenes</h1>
          
          <div className="order-history-page__error">
            <div className="order-history-page__error-icon">⚠️</div>
            <h2 className="order-history-page__error-title">Error al cargar órdenes</h2>
            <p className="order-history-page__error-text">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="order-history-page__retry-button"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Muestra mensaje cuando no hay órdenes
   */
  if (orders.length === 0) {
    return (
      <div className="order-history-page">
        <div className="order-history-page__container">
          <h1 className="order-history-page__title">Mis Órdenes</h1>
          
          <div className="order-history-page__empty">
            <div className="order-history-page__empty-icon">📦</div>
            <h2 className="order-history-page__empty-title">
              Aún no tienes órdenes
            </h2>
            <p className="order-history-page__empty-text">
              Cuando realices tu primera compra, aparecerá aquí con todos los detalles.
            </p>
            <Link to="/" className="order-history-page__empty-button">
              Explorar productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDERIZADO PRINCIPAL
  // ============================================================================

  return (
    <div className="order-history-page">
      <div className="order-history-page__container">
        
        {/* Header */}
        <div className="order-history-page__header">
          <h1 className="order-history-page__title">Mis Órdenes</h1>
          <p className="order-history-page__subtitle">
            {orders.length} {orders.length === 1 ? 'orden encontrada' : 'órdenes encontradas'}
          </p>
        </div>

        {/* Lista de órdenes */}
        <div className="order-history-page__list">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const statusInfo = getStatusInfo(order.status);
            const totalItems = getTotalItems(order.items);

            // Log para debug - ver estructura de la orden
            if (order.id === orders[0]?.id) {
              console.log('📦 Estructura de la primera orden:', order);
              console.log('💰 Campos de precio disponibles:', {
                total_price: order.total_price,
                total_amount: order.total_amount,
                price: order.price
              });
            }

            return (
              <div 
                key={order.id} 
                className="order-history-page__order-card"
              >
                {/* Encabezado de la orden (siempre visible) */}
                <div 
                  className="order-history-page__order-header"
                  onClick={() => toggleOrderDetails(order.id)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      toggleOrderDetails(order.id);
                    }
                  }}
                  aria-expanded={isExpanded}
                  aria-controls={`order-details-${order.id}`}
                >
                  <div className="order-history-page__order-main-info">
                    <div className="order-history-page__order-number">
                      <span className="order-history-page__order-label">Orden</span>
                      <span className="order-history-page__order-value">#{order.id}</span>
                    </div>

                    <div className="order-history-page__order-date">
                      <span className="order-history-page__date-icon">📅</span>
                      <span className="order-history-page__date-text">
                        {formatDate(order.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="order-history-page__order-summary">
                    <span className={`order-history-page__status-badge order-history-page__status-badge--${statusInfo.class}`}>
                      {statusInfo.text}
                    </span>

                    <div className="order-history-page__order-total">
                      <span className="order-history-page__total-label">Total:</span>
                      <span className="order-history-page__total-value">
                        ${parseFloat(order.total_price || order.total_amount || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="order-history-page__expand-icon">
                    {isExpanded ? '▲' : '▼'}
                  </div>
                </div>

                {/* Detalles de la orden (expandibles) */}
                {isExpanded && (
                  <div 
                    id={`order-details-${order.id}`}
                    className="order-history-page__order-details"
                  >
                    <div className="order-history-page__details-divider"></div>

                    {/* Información adicional */}
                    <div className="order-history-page__details-info">
                      <div className="order-history-page__details-row">
                        <span className="order-history-page__details-label">
                          Total de productos:
                        </span>
                        <span className="order-history-page__details-value">
                          {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
                        </span>
                      </div>

                      {order.stripe_session_id && (
                        <div className="order-history-page__details-row">
                          <span className="order-history-page__details-label">
                            ID de pago:
                          </span>
                          <span className="order-history-page__details-value order-history-page__details-value--mono">
                            {order.stripe_session_id.substring(0, 20)}...
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Lista de productos */}
                    {order.items && order.items.length > 0 && (
                      <>
                        <h3 className="order-history-page__products-title">
                          Productos:
                        </h3>
                        
                        <div className="order-history-page__products-list">
                          {order.items.map((item, index) => (
                            <div 
                              key={index} 
                              className="order-history-page__product-item"
                            >
                              <div className="order-history-page__product-info">
                                <span className="order-history-page__product-name">
                                  {item.product_name || item.product?.name || 'Producto'}
                                </span>
                                <span className="order-history-page__product-quantity">
                                  x{item.quantity}
                                </span>
                              </div>
                              <div className="order-history-page__product-prices">
                                <span className="order-history-page__product-unit-price">
                                  ${parseFloat(item.price).toFixed(2)} c/u
                                </span>
                                <span className="order-history-page__product-total-price">
                                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Botones de acción - Solo para órdenes COMPLETADAS */}
                    {order.status === 'COMPLETED' && (
                      <div className="order-history-page__actions-bottom">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Evitar cerrar el acordeón
                            handleDownloadReceipt(order.id);
                          }}
                          disabled={downloadingOrders.has(order.id)}
                          className="order-history-page__download-button"
                        >
                          {downloadingOrders.has(order.id) ? (
                            <>
                              <span className="order-history-page__download-spinner"></span>
                              Descargando...
                            </>
                          ) : (
                            <>
                              📄 Descargar Comprobante
                            </>
                          )}
                        </button>

                        {/* Botón para crear reclamo */}
                        <CreateClaimButton orderId={order.id} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Botón para volver a comprar */}
        <div className="order-history-page__actions">
          <Link 
            to="/" 
            className="order-history-page__shop-button"
          >
            Continuar comprando
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderHistoryPage;

