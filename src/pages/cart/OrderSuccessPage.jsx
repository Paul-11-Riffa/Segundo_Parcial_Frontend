/**
 * OrderSuccessPage - Página de Orden Exitosa
 * 
 * Funcionalidades:
 * - Se muestra después de completar el pago exitosamente en Stripe
 * - Llama al endpoint POST /complete-order/ al montar para finalizar la orden
 * - Muestra confirmación visual con animación
 * - Muestra detalles del pedido (número, total, items)
 * - Botones para ver historial de órdenes o volver a la tienda
 * - Maneja estados de carga y error
 * 
 * Uso:
 * Protegida por ProtectedRoute en App.jsx
 * Ruta: /order/success?session_id=xxx
 * Stripe redirige aquí después del pago exitoso
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import cartService from '../../services/cartService';
import './OrderSuccessPage.css';

const OrderSuccessPage = () => {
  // ============================================================================
  // HOOKS Y ESTADO
  // ============================================================================
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { loadCart, completeOrder } = useCart(); // ✅ Nombres correctos

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderData, setOrderData] = useState(null);

  // ============================================================================
  // EFECTOS
  // ============================================================================

  /**
   * Finaliza la orden al montar el componente
   * Se ejecuta una sola vez después del pago exitoso
   */
  useEffect(() => {
    const finishOrder = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('[OrderSuccessPage] Iniciando finalización de orden...');

        // Obtener session_id de la URL (enviado por Stripe)
        const sessionId = searchParams.get('session_id');
        console.log('[OrderSuccessPage] Session ID:', sessionId);

        if (!sessionId) {
          throw new Error('No se encontró el ID de sesión de pago');
        }

        // ✅ Llamar a completeOrder del Context
        console.log('[OrderSuccessPage] Llamando a completeOrder...');
        const response = await completeOrder();
        console.log('[OrderSuccessPage] Respuesta de completeOrder:', response);

        // Verificar si fue exitoso
        if (!response.success) {
          throw new Error(response.error || 'Error al completar la orden');
        }

        // ✅ Guardar los datos completos de la orden
        console.log('[OrderSuccessPage] Datos de la orden:', response.order);
        console.log('[OrderSuccessPage] Items:', response.order?.items);
        console.log('[OrderSuccessPage] Total items:', response.order?.total_items);
        console.log('[OrderSuccessPage] Total price:', response.order?.total_price);
        setOrderData(response.order);

        // ✅ Refrescar el carrito (debería estar vacío ahora)
        await loadCart();

      } catch (err) {
        console.error('[OrderSuccessPage] Error al completar la orden:', err);
        setError(err.message || 'Error al procesar tu orden');
      } finally {
        setLoading(false);
      }
    };

    finishOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); // ✅ Solo searchParams como dependencia

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
   * Calcula el total de items
   */
  const getTotalItems = () => {
    console.log('[getTotalItems] orderData:', orderData);
    
    if (!orderData) return 0;
    
    // Intentar diferentes estructuras posibles
    const items = orderData.items || orderData.order_items || [];
    console.log('[getTotalItems] items encontrados:', items);
    
    if (!Array.isArray(items)) return 0;
    
    const total = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
    console.log('[getTotalItems] total calculado:', total);
    
    return total;
  };

  // ============================================================================
  // RENDERIZADO CONDICIONAL
  // ============================================================================

  /**
   * Muestra loading mientras procesa la orden
   */
  if (loading) {
    return (
      <div className="order-success-page">
        <div className="order-success-page__container">
          <div className="order-success-page__loading">
            <div className="order-success-page__loading-spinner"></div>
            <h2>Procesando tu orden...</h2>
            <p>Por favor espera mientras confirmamos tu pago</p>
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
      <div className="order-success-page">
        <div className="order-success-page__container">
          <div className="order-success-page__error">
            <div className="order-success-page__error-icon">❌</div>
            <h2 className="order-success-page__error-title">Error al procesar tu orden</h2>
            <p className="order-success-page__error-text">{error}</p>
            
            <div className="order-success-page__error-actions">
              <button 
                onClick={() => window.location.reload()}
                className="order-success-page__button order-success-page__button--primary"
              >
                Intentar de nuevo
              </button>
              <Link 
                to="/cart"
                className="order-success-page__button order-success-page__button--secondary"
              >
                Volver al carrito
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDERIZADO PRINCIPAL
  // ============================================================================

  return (
    <div className="order-success-page">
      <div className="order-success-page__container">
        
        {/* Confirmación visual con animación */}
        <div className="order-success-page__success-animation">
          <div className="order-success-page__checkmark-circle">
            <div className="order-success-page__checkmark">✓</div>
          </div>
        </div>

        {/* Mensaje principal */}
        <div className="order-success-page__header">
          <h1 className="order-success-page__title">¡Gracias por tu compra!</h1>
          <p className="order-success-page__subtitle">
            Tu orden ha sido procesada exitosamente
          </p>
        </div>

        {/* Detalles de la orden */}
        <div className="order-success-page__card">
          
          {/* Información principal */}
          <div className="order-success-page__order-info">
            <div className="order-success-page__info-row">
              <span className="order-success-page__info-label">Número de orden:</span>
              <span className="order-success-page__info-value order-success-page__info-value--highlight">
                #{orderData?.id || 'N/A'}
              </span>
            </div>

            <div className="order-success-page__info-row">
              <span className="order-success-page__info-label">Fecha:</span>
              <span className="order-success-page__info-value">
                {orderData?.created_at ? formatDate(orderData.created_at) : 'N/A'}
              </span>
            </div>

            <div className="order-success-page__info-row">
              <span className="order-success-page__info-label">Estado:</span>
              <span className="order-success-page__status-badge order-success-page__status-badge--completed">
                {orderData?.status || 'COMPLETADO'}
              </span>
            </div>

            <div className="order-success-page__info-row">
              <span className="order-success-page__info-label">Total de productos:</span>
              <span className="order-success-page__info-value">
                {getTotalItems()} {getTotalItems() === 1 ? 'producto' : 'productos'}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="order-success-page__divider"></div>

          {/* Total */}
          <div className="order-success-page__total-section">
            <span className="order-success-page__total-label">Total pagado:</span>
            <span className="order-success-page__total-amount">
              ${parseFloat(orderData?.total_amount || orderData?.total_price || 0).toFixed(2)}
            </span>
          </div>

          {/* Lista de productos (si está disponible) */}
          {(() => {
            const items = orderData?.items || orderData?.order_items || [];
            return items.length > 0 && (
            <>
              <div className="order-success-page__divider"></div>
              
              <div className="order-success-page__items-section">
                <h3 className="order-success-page__items-title">Productos comprados:</h3>
                
                <div className="order-success-page__items-list">
                  {items.map((item, index) => (
                    <div key={index} className="order-success-page__item">
                      <div className="order-success-page__item-info">
                        <span className="order-success-page__item-name">
                          {item.product_name || item.product?.name || 'Producto'}
                        </span>
                        <span className="order-success-page__item-quantity">
                          x{item.quantity}
                        </span>
                      </div>
                      <span className="order-success-page__item-price">
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          );
          })()}
        </div>

        {/* Información adicional */}
        <div className="order-success-page__info-box">
          <div className="order-success-page__info-box-icon">📧</div>
          <p className="order-success-page__info-box-text">
            Hemos enviado un correo de confirmación con los detalles de tu orden.
            Recibirás actualizaciones sobre el estado de tu envío.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="order-success-page__actions">
          <Link 
            to="/my-orders"
            className="order-success-page__button order-success-page__button--primary"
          >
            Ver mis órdenes
          </Link>
          
          <Link 
            to="/"
            className="order-success-page__button order-success-page__button--secondary"
          >
            Continuar comprando
          </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccessPage;

