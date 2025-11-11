import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './CartIcon.css';

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          CART ICON PREMIUM - BLACK & WHITE                   ║
 * ║          Con Preview Hover y Animaciones                     ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
const CartIcon = () => {
  const { cartItemCount, loading } = useCart();

  return (
    <Link to="/cart" className="icon-button" aria-label={`Carrito con ${cartItemCount} productos`}>
      <ShoppingCart size={20} strokeWidth={2} />
      {!loading && cartItemCount > 0 && (
        <span className="icon-badge">
          {cartItemCount > 99 ? '99+' : cartItemCount}
        </span>
      )}
    </Link>
  );
};

export default CartIcon;
