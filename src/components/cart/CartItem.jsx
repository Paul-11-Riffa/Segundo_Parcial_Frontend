/**
 * Componente CartItem
 * Renderiza un item individual del carrito con controles de cantidad y eliminación
 * Con debouncing para optimizar las llamadas al backend
 * 
 * Uso:
 * import CartItem from '../components/cart/CartItem';
 * <CartItem item={item} onUpdateQuantity={handleUpdate} onRemove={handleRemove} />
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import './CartItem.css';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(item.quantity);
  const [error, setError] = useState(null);

  // Ref para el timeout del debounce
  const debounceTimeoutRef = useRef(null);

  // Tiempo de debounce en milisegundos (500ms)
  const DEBOUNCE_DELAY = 500;

  /**
   * Obtiene la URL de la imagen del producto
   * Busca en el array de imágenes o usa fallbacks
   * Convierte URLs relativas en absolutas
   */
  const getProductImage = () => {
    const product = item.product;
    let imageUrl = null;

    // Prioridad 1: Buscar imagen principal en el array de imágenes
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const primaryImage = product.images.find(img => img.is_primary);
      imageUrl = primaryImage?.image_url || product.images[0]?.image_url;
    }
    // Fallback 2: Sistema antiguo de imagen única
    else if (product.image) {
      imageUrl = product.image;
    }
    // Fallback 3: image_url
    else if (product.image_url) {
      imageUrl = product.image_url;
    }

    // ✅ IMPORTANTE: Convertir URL relativa a absoluta
    if (imageUrl && !imageUrl.startsWith('http')) {
      const baseURL = 'http://localhost:8000';
      imageUrl = `${baseURL}${imageUrl}`;
    }

    return imageUrl;
  };

  /**
   * Calcula el subtotal del item
   */
  const subtotal = (parseFloat(item.price) * item.quantity).toFixed(2);

  /**
   * Efecto para limpiar el timeout al desmontar
   */
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Efecto para actualizar cantidad con debouncing
   * Se ejecuta cada vez que localQuantity cambia
   */
  useEffect(() => {
    // Si la cantidad local es igual a la del item, no hacer nada
    if (localQuantity === item.quantity) {
      return;
    }

    // Limpiar el timeout anterior si existe
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Crear nuevo timeout para debouncing
    debounceTimeoutRef.current = setTimeout(() => {
      updateQuantityOnServer(localQuantity);
    }, DEBOUNCE_DELAY);

    // Cleanup function
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [localQuantity, item.quantity]);

  /**
   * Actualiza la cantidad en el servidor
   */
  const updateQuantityOnServer = async (newQuantity) => {
    // Validar cantidad
    if (newQuantity < 1) {
      setLocalQuantity(item.quantity);
      return;
    }

    if (newQuantity > item.product.stock) {
      setError(`Solo hay ${item.product.stock} unidades disponibles`);
      setLocalQuantity(item.quantity);
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setIsUpdating(true);
      setError(null);

      // Llamar a la función del padre
      await onUpdateQuantity(item.id, newQuantity);
    } catch (err) {
      console.error('Error al actualizar cantidad:', err);
      setError(err.message || 'Error al actualizar cantidad');
      // Revertir cantidad local
      setLocalQuantity(item.quantity);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Maneja el cambio de cantidad (ya no es async, solo actualiza el estado local)
   */
  const handleQuantityChange = useCallback((newQuantity) => {
    // Validar cantidad básica antes de actualizar el estado
    if (newQuantity < 1) {
      return;
    }

    if (newQuantity > item.product.stock) {
      setError(`Solo hay ${item.product.stock} unidades disponibles`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Actualizar cantidad local inmediatamente (sin esperar al servidor)
    setLocalQuantity(newQuantity);
  }, [item.product.stock]);

  /**
   * Incrementa la cantidad
   */
  const handleIncrement = () => {
    handleQuantityChange(localQuantity + 1);
  };

  /**
   * Decrementa la cantidad
   */
  const handleDecrement = () => {
    if (localQuantity > 1) {
      handleQuantityChange(localQuantity - 1);
    }
  };

  /**
   * Maneja el cambio directo en el input
   */
  const handleInputChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setLocalQuantity(value);
  };

  /**
   * Aplica el cambio cuando el input pierde el foco
   */
  const handleInputBlur = () => {
    if (localQuantity !== item.quantity) {
      handleQuantityChange(localQuantity);
    }
  };

  /**
   * Aplica el cambio al presionar Enter
   */
  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  /**
   * Maneja la eliminación del item
   */
  const handleRemove = async () => {
    // Pedir confirmación
    const confirmed = window.confirm(
      `¿Eliminar "${item.product.name}" del carrito?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsRemoving(true);
      setError(null);

      // Llamar a la función del padre
      await onRemove(item.id);
    } catch (err) {
      console.error('Error al eliminar item:', err);
      setError(err.message || 'Error al eliminar producto');
      setIsRemoving(false);
    }
  };

  const productImage = getProductImage();

  return (
    <div className={`cart-item ${isRemoving ? 'removing' : ''} ${isUpdating ? 'updating' : ''}`}>
      {/* Imagen del producto */}
      <div className="cart-item-image">
        {productImage ? (
          <img
            src={productImage}
            alt={item.product.name}
            loading="lazy"
          />
        ) : (
          <div className="cart-item-image-placeholder">
            <span>📦</span>
          </div>
        )}
      </div>

      {/* Detalles del producto */}
      <div className="cart-item-details">
        <h3 className="cart-item-name">{item.product.name}</h3>
        
        {item.product.category_detail && (
          <p className="cart-item-category">
            {item.product.category_detail.name}
          </p>
        )}
        
        <p className="cart-item-price">
          ${parseFloat(item.price).toFixed(2)} <span className="price-unit">c/u</span>
        </p>

        {/* Mostrar stock disponible */}
        <p className="cart-item-stock">
          {item.product.stock > 0 ? (
            <span className="stock-available">
              {item.product.stock} disponibles
            </span>
          ) : (
            <span className="stock-unavailable">
              Sin stock
            </span>
          )}
        </p>
      </div>

      {/* Controles de cantidad */}
      <div className="cart-item-quantity">
        <label className="quantity-label">Cantidad</label>
        
        <div className="quantity-controls">
          <button
            type="button"
            className="quantity-btn quantity-btn-minus"
            onClick={handleDecrement}
            disabled={isUpdating || isRemoving || localQuantity <= 1}
            aria-label="Disminuir cantidad"
          >
            −
          </button>
          
          <input
            type="number"
            className="quantity-input"
            value={localQuantity}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyPress={handleInputKeyPress}
            min="1"
            max={item.product.stock}
            disabled={isUpdating || isRemoving}
            aria-label="Cantidad"
          />
          
          <button
            type="button"
            className="quantity-btn quantity-btn-plus"
            onClick={handleIncrement}
            disabled={isUpdating || isRemoving || localQuantity >= item.product.stock}
            aria-label="Aumentar cantidad"
          >
            +
          </button>
        </div>

        {/* Indicador de actualización */}
        {isUpdating && (
          <span className="updating-indicator">Actualizando...</span>
        )}
      </div>

      {/* Subtotal */}
      <div className="cart-item-subtotal">
        <span className="subtotal-label">Subtotal</span>
        <span className="subtotal-amount">${subtotal}</span>
      </div>

      {/* Botón eliminar */}
      <button
        type="button"
        className="cart-item-remove"
        onClick={handleRemove}
        disabled={isRemoving || isUpdating}
        aria-label={`Eliminar ${item.product.name} del carrito`}
        title="Eliminar producto"
      >
        {isRemoving ? (
          <span className="remove-spinner"></span>
        ) : (
          <span className="remove-icon">🗑️</span>
        )}
      </button>

      {/* Mensaje de error */}
      {error && (
        <div className="cart-item-error" role="alert">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default CartItem;
