/**
 * Botón para Añadir Productos al Carrito
 * Componente reutilizable con selector de cantidad y validación de stock
 * Maneja estados de loading y errores
 * 
 * Uso:
 * import AddToCartButton from '../components/cart/AddToCartButton';
 * <AddToCartButton product={product} />
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import './AddToCartButton.css';

const AddToCartButton = ({ product, showQuantitySelector = true, defaultQuantity = 1 }) => {
  const [quantity, setQuantity] = useState(defaultQuantity);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  /**
   * Maneja el cambio de cantidad
   */
  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    
    // Validar límites
    if (value < 1) {
      setQuantity(1);
    } else if (value > product.stock) {
      setQuantity(product.stock);
      setError(`Solo hay ${product.stock} unidades disponibles`);
      setTimeout(() => setError(null), 3000);
    } else {
      setQuantity(value);
      setError(null);
    }
  };

  /**
   * Incrementa la cantidad
   */
  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1);
      setError(null);
    } else {
      setError(`Solo hay ${product.stock} unidades disponibles`);
      setTimeout(() => setError(null), 3000);
    }
  };

  /**
   * Decrementa la cantidad
   */
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
      setError(null);
    }
  };

  /**
   * Maneja el click en "Añadir al Carrito"
   */
  const handleAddToCart = async () => {
    // Validar autenticación
    if (!isAuthenticated) {
      // Guardar URL actual para redirigir después del login
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    // Validar stock
    if (product.stock === 0) {
      setError('Producto sin stock disponible');
      return;
    }

    if (quantity > product.stock) {
      setError(`Solo hay ${product.stock} unidades disponibles`);
      return;
    }

    try {
      setIsAdding(true);
      setError(null);

      const result = await addToCart(product.id, quantity);

      if (result.success) {
        // Mostrar mensaje de éxito
        setShowSuccess(true);
        
        // Resetear cantidad a 1 (opcional)
        if (showQuantitySelector) {
          setQuantity(1);
        }

        // Ocultar mensaje después de 2 segundos
        setTimeout(() => {
          setShowSuccess(false);
        }, 2000);
      } else {
        setError(result.error || 'Error al añadir al carrito');
      }
    } catch (err) {
      console.error('Error al añadir al carrito:', err);
      setError('Error al añadir al carrito. Intenta nuevamente.');
    } finally {
      setIsAdding(false);
    }
  };

  // Si el producto no tiene info de stock, deshabilitar
  const isOutOfStock = !product || product.stock === 0;
  const isDisabled = isAdding || isOutOfStock;

  return (
    <div className="add-to-cart-container">
      {/* Selector de cantidad (opcional) */}
      {showQuantitySelector && (
        <div className="quantity-selector">
          <label htmlFor={`quantity-${product.id}`} className="quantity-label">
            Cantidad:
          </label>
          
          <div className="quantity-controls">
            <button
              type="button"
              className="quantity-btn quantity-btn-minus"
              onClick={decrementQuantity}
              disabled={isDisabled || quantity <= 1}
              aria-label="Disminuir cantidad"
            >
              −
            </button>
            
            <input
              id={`quantity-${product.id}`}
              type="number"
              className="quantity-input"
              value={quantity}
              onChange={handleQuantityChange}
              min="1"
              max={product.stock}
              disabled={isDisabled}
              aria-label="Cantidad"
            />
            
            <button
              type="button"
              className="quantity-btn quantity-btn-plus"
              onClick={incrementQuantity}
              disabled={isDisabled || quantity >= product.stock}
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>
          
          {/* Información de stock */}
          <span className="stock-info">
            {product.stock > 0 ? (
              <span className="stock-available">
                {product.stock} {product.stock === 1 ? 'disponible' : 'disponibles'}
              </span>
            ) : (
              <span className="stock-unavailable">Sin stock</span>
            )}
          </span>
        </div>
      )}

      {/* Botón principal */}
      <button
        type="button"
        className={`add-to-cart-btn ${showSuccess ? 'success' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
        onClick={handleAddToCart}
        disabled={isDisabled}
        aria-label={isOutOfStock ? 'Producto sin stock' : 'Añadir al carrito'}
      >
        {isAdding ? (
          <>
            <span className="btn-spinner"></span>
            <span>Añadiendo...</span>
          </>
        ) : showSuccess ? (
          <>
            <span className="btn-icon">✓</span>
            <span>¡Añadido!</span>
          </>
        ) : isOutOfStock ? (
          <>
            <span className="btn-icon">✕</span>
            <span>Sin Stock</span>
          </>
        ) : (
          <>
            <span className="btn-icon">🛒</span>
            <span>Añadir al Carrito</span>
          </>
        )}
      </button>

      {/* Mensaje de error */}
      {error && (
        <div className="add-to-cart-error" role="alert">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default AddToCartButton;
