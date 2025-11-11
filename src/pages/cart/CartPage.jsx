/**
 * CartPage - Página Principal del Carrito de Compras
 * 
 * Funcionalidades:
 * - Muestra la lista completa de items en el carrito
 * - Permite actualizar cantidades y eliminar productos
 * - Muestra resumen con subtotal, impuestos y total
 * - Botón de checkout que inicia el proceso de pago con Stripe
 * - Maneja estados de carga, error y carrito vacío
 * - Responsive: grid 2 columnas en desktop, 1 columna en mobile
 * 
 * Uso:
 * Protegida por ProtectedRoute en App.jsx
 * Ruta: /cart
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartItem from '../../components/cart/CartItem';
import './CartPage.css';

const CartPage = () => {
  // ============================================================================
  // HOOKS Y ESTADO
  // ============================================================================
  
  const navigate = useNavigate();
  const { cart, loading: cartLoading, loadCart, cartTotal, cartItemCount, proceedToCheckout } = useCart();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // ============================================================================
  // EFECTOS
  // ============================================================================

  /**
   * ❌ NO NECESARIO: CartContext ya carga el carrito automáticamente
   * Eliminado para evitar loop infinito de peticiones
   */
  // useEffect(() => {
  //   loadCart();
  // }, [loadCart]);

  /**
   * Limpia mensajes después de 5 segundos
   */
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  /**
   * Actualiza la cantidad de un item
   */
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      setError(null);
      await cartService.updateItemQuantity(itemId, newQuantity); // ✅ Nombre correcto
      await loadCart();
      setSuccessMessage('Cantidad actualizada correctamente');
    } catch (err) {
      console.error('Error al actualizar cantidad:', err);
      setError(err.message || 'Error al actualizar la cantidad');
    }
  };

  /**
   * Elimina un item del carrito
   */
  const handleRemoveItem = async (itemId) => {
    try {
      setError(null);
      await cartService.removeItem(itemId); // ✅ Nombre correcto
      await loadCart();
      setSuccessMessage('Producto eliminado del carrito');
    } catch (err) {
      console.error('Error al eliminar item:', err);
      setError(err.message || 'Error al eliminar el producto');
    }
  };

  /**
   * Inicia el proceso de checkout con Stripe
   */
  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      setError(null);

      // Validar que hay items en el carrito
      if (!cart?.items || cart.items.length === 0) {
        setError('Tu carrito está vacío');
        setIsCheckingOut(false);
        return;
      }

      // Validar stock antes de proceder
      const outOfStockItems = cart.items.filter(
        item => item.quantity > item.product.stock
      );

      if (outOfStockItems.length > 0) {
        const itemNames = outOfStockItems.map(item => item.product.name).join(', ');
        setError(`Los siguientes productos no tienen stock suficiente: ${itemNames}`);
        setIsCheckingOut(false);
        return;
      }

      // ✅ Usar proceedToCheckout del Context (guarda datos en localStorage)
      console.log('[CartPage] Iniciando checkout, guardando datos del carrito...');
      const result = await proceedToCheckout();

      // Si falla, mostrar error
      if (!result.success) {
        throw new Error(result.error || 'Error al iniciar el proceso de pago');
      }

      // proceedToCheckout ya redirige a Stripe, no necesitamos hacer nada más

    } catch (err) {
      console.error('[CartPage] Error en checkout:', err);
      setError(err.message || 'Error al iniciar el proceso de pago');
      setIsCheckingOut(false);
    }
  };

  /**
   * Calcula el subtotal de todos los items
   */
  const calculateSubtotal = () => {
    if (!cart?.items || cart.items.length === 0) return 0;
    
    return cart.items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * item.quantity);
    }, 0);
  };

  /**
   * Calcula los impuestos (16% en este ejemplo)
   */
  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * 0.16;
  };

  /**
   * Calcula el total final
   */
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // ============================================================================
  // RENDERIZADO CONDICIONAL
  // ============================================================================

  /**
   * Muestra skeleton loader mientras carga
   */
  if (cartLoading && !cart) {
    return (
      <div className="cart-page">
        <div className="cart-page__container">
          <h1 className="cart-page__title">Mi Carrito</h1>
          <div className="cart-page__loading">
            <div className="cart-page__loading-spinner"></div>
            <p>Cargando tu carrito...</p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Muestra mensaje de carrito vacío
   */
  if (!cart?.items || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-page__container">
          <h1 className="cart-page__title">Mi Carrito</h1>
          
          <div className="cart-page__empty">
            <div className="cart-page__empty-icon">🛒</div>
            <h2 className="cart-page__empty-title">Tu carrito está vacío</h2>
            <p className="cart-page__empty-text">
              Parece que aún no has agregado productos a tu carrito.
              ¡Explora nuestro catálogo y encuentra lo que necesitas!
            </p>
            <Link to="/" className="cart-page__empty-button">
              Ir a la tienda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDERIZADO PRINCIPAL
  // ============================================================================

  const subtotal = calculateSubtotal();
  const tax = calculateTax();
  const total = calculateTotal();

  return (
    <div className="cart-page">
      <div className="cart-page__container">
        {/* Header */}
        <div className="cart-page__header">
          <h1 className="cart-page__title">Mi Carrito</h1>
          <p className="cart-page__subtitle">
            {cartItemCount} {cartItemCount === 1 ? 'producto' : 'productos'} en tu carrito
          </p>
        </div>

        {/* Mensajes de error y éxito */}
        {error && (
          <div className="cart-page__alert cart-page__alert--error" role="alert">
            <span className="cart-page__alert-icon">⚠️</span>
            <span className="cart-page__alert-text">{error}</span>
            <button 
              className="cart-page__alert-close"
              onClick={() => setError(null)}
              aria-label="Cerrar alerta"
            >
              ×
            </button>
          </div>
        )}

        {successMessage && (
          <div className="cart-page__alert cart-page__alert--success" role="alert">
            <span className="cart-page__alert-icon">✓</span>
            <span className="cart-page__alert-text">{successMessage}</span>
            <button 
              className="cart-page__alert-close"
              onClick={() => setSuccessMessage(null)}
              aria-label="Cerrar alerta"
            >
              ×
            </button>
          </div>
        )}

        {/* Layout principal: Items + Resumen */}
        <div className="cart-page__content">
          
          {/* Lista de items */}
          <div className="cart-page__items">
            <h2 className="cart-page__section-title">Productos</h2>
            
            <div className="cart-page__items-list">
              {cart.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>

            {/* Botón para continuar comprando (mobile) */}
            <Link 
              to="/" 
              className="cart-page__continue-shopping cart-page__continue-shopping--mobile"
            >
              ← Continuar comprando
            </Link>
          </div>

          {/* Resumen del pedido */}
          <div className="cart-page__summary">
            <div className="cart-page__summary-card">
              <h2 className="cart-page__summary-title">Resumen del pedido</h2>

              <div className="cart-page__summary-content">
                
                {/* Subtotal */}
                <div className="cart-page__summary-row">
                  <span className="cart-page__summary-label">Subtotal</span>
                  <span className="cart-page__summary-value">
                    ${subtotal.toFixed(2)}
                  </span>
                </div>

                {/* Impuestos */}
                <div className="cart-page__summary-row">
                  <span className="cart-page__summary-label">
                    Impuestos (16%)
                  </span>
                  <span className="cart-page__summary-value">
                    ${tax.toFixed(2)}
                  </span>
                </div>

                {/* Envío */}
                <div className="cart-page__summary-row">
                  <span className="cart-page__summary-label">Envío</span>
                  <span className="cart-page__summary-value cart-page__summary-value--free">
                    GRATIS
                  </span>
                </div>

                {/* Divider */}
                <div className="cart-page__summary-divider"></div>

                {/* Total */}
                <div className="cart-page__summary-row cart-page__summary-row--total">
                  <span className="cart-page__summary-label cart-page__summary-label--total">
                    Total
                  </span>
                  <span className="cart-page__summary-value cart-page__summary-value--total">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Botón de checkout */}
              <button
                className="cart-page__checkout-button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                aria-label={isCheckingOut ? 'Procesando pago...' : 'Proceder al pago'}
              >
                {isCheckingOut ? (
                  <>
                    <span className="cart-page__checkout-spinner"></span>
                    Procesando...
                  </>
                ) : (
                  <>
                    <span className="cart-page__checkout-icon">🔒</span>
                    Proceder al pago
                  </>
                )}
              </button>

              {/* Información de seguridad */}
              <div className="cart-page__security-info">
                <span className="cart-page__security-icon">🛡️</span>
                <p className="cart-page__security-text">
                  Pago seguro con Stripe
                </p>
              </div>

              {/* Botón para continuar comprando (desktop) */}
              <Link 
                to="/" 
                className="cart-page__continue-shopping cart-page__continue-shopping--desktop"
              >
                ← Continuar comprando
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CartPage;
