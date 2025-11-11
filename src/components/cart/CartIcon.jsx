/**
 * Icono del Carrito con Badge
 * Muestra el icono del carrito y un badge con el número de items
 * Se actualiza automáticamente cuando cambia el carrito
 * 
 * Uso:
 * import CartIcon from '../components/cart/CartIcon';
 * <CartIcon />
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './CartIcon.css';

const CartIcon = () => {
  const { cartItemCount, loading } = useCart();

  return (
    <Link to="/cart" className="cart-icon-link" aria-label={`Carrito con ${cartItemCount} productos`}>
      <div className="cart-icon-container">
        {/* Icono del carrito usando lucide-react para consistencia */}
        <ShoppingCart className="cart-icon" size={16} strokeWidth={2} />
        
        {/* Badge con el contador */}
        {!loading && cartItemCount > 0 && (
          <span className="cart-badge" aria-label={`${cartItemCount} productos en el carrito`}>
            {cartItemCount > 99 ? '99+' : cartItemCount}
          </span>
        )}
        
        {/* Loading indicator (opcional) */}
        {loading && (
          <span className="cart-loading-dot"></span>
        )}
      </div>
    </Link>
  );
};

export default CartIcon;
