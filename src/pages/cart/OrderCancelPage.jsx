/**
 * OrderCancelPage - Página de Pago Cancelado
 * 
 * Funcionalidades:
 * - Se muestra cuando el usuario cancela el pago en Stripe
 * - Mensaje amigable explicando que el carrito permanece intacto
 * - El carrito mantiene su estado PENDING (no se pierde)
 * - Botones para volver al carrito o continuar comprando
 * - Diseño simple y empático con el usuario
 * 
 * Uso:
 * Protegida por ProtectedRoute en App.jsx
 * Ruta: /order/cancel
 * Stripe redirige aquí cuando el usuario cancela el pago
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './OrderCancelPage.css';

const OrderCancelPage = () => {
  // ============================================================================
  // HOOKS
  // ============================================================================
  
  const { loadCart, cartItemCount } = useCart(); // ✅ Nombre correcto

  // ============================================================================
  // EFECTOS
  // ============================================================================

  /**
   * ❌ NO NECESARIO: CartContext ya carga el carrito automáticamente
   * Comentado para evitar loops infinitos
   */
  // useEffect(() => {
  //   loadCart();
  // }, [loadCart]);

  // ============================================================================
  // RENDERIZADO
  // ============================================================================

  return (
    <div className="order-cancel-page">
      <div className="order-cancel-page__container">
        
        {/* Icono de cancelación */}
        <div className="order-cancel-page__icon-wrapper">
          <div className="order-cancel-page__icon">⚠️</div>
        </div>

        {/* Mensaje principal */}
        <div className="order-cancel-page__header">
          <h1 className="order-cancel-page__title">Pago Cancelado</h1>
          <p className="order-cancel-page__subtitle">
            Has cancelado el proceso de pago
          </p>
        </div>

        {/* Información */}
        <div className="order-cancel-page__card">
          <div className="order-cancel-page__content">
            <h2 className="order-cancel-page__content-title">
              No te preocupes, tus productos siguen en el carrito
            </h2>
            
            <p className="order-cancel-page__content-text">
              No se realizó ningún cargo a tu cuenta. Todos los productos que 
              habías seleccionado permanecen guardados en tu carrito y puedes 
              completar tu compra cuando estés listo.
            </p>

            {cartItemCount > 0 && (
              <div className="order-cancel-page__cart-info">
                <span className="order-cancel-page__cart-icon">🛒</span>
                <span className="order-cancel-page__cart-text">
                  Tienes {cartItemCount} {cartItemCount === 1 ? 'producto' : 'productos'} esperando en tu carrito
                </span>
              </div>
            )}

            <div className="order-cancel-page__reasons">
              <p className="order-cancel-page__reasons-title">
                Razones comunes para cancelar:
              </p>
              <ul className="order-cancel-page__reasons-list">
                <li>Necesitas revisar los productos seleccionados</li>
                <li>Prefieres usar otro método de pago</li>
                <li>Quieres aplicar un cupón de descuento</li>
                <li>Necesitas más tiempo para decidir</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="order-cancel-page__info-box">
          <div className="order-cancel-page__info-box-icon">💡</div>
          <p className="order-cancel-page__info-box-text">
            <strong>Tip:</strong> Tu carrito se mantiene guardado durante 30 días. 
            Puedes volver cuando quieras para completar tu compra.
          </p>
        </div>

        {/* Botones de acción */}
        <div className="order-cancel-page__actions">
          <Link 
            to="/cart"
            className="order-cancel-page__button order-cancel-page__button--primary"
          >
            Volver al carrito
          </Link>
          
          <Link 
            to="/"
            className="order-cancel-page__button order-cancel-page__button--secondary"
          >
            Continuar comprando
          </Link>
        </div>

        {/* Link de ayuda */}
        <div className="order-cancel-page__help">
          <p className="order-cancel-page__help-text">
            ¿Necesitas ayuda? <a href="/contact" className="order-cancel-page__help-link">Contáctanos</a>
          </p>
        </div>

      </div>
    </div>
  );
};

export default OrderCancelPage;

