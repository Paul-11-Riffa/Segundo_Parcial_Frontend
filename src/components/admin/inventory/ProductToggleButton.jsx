// src/components/admin/inventory/ProductToggleButton.jsx
import React, { useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import './ProductToggleButton.css';

/**
 * Botón para activar/desactivar productos directamente desde la lista
 * Usa el endpoint dedicado /toggle_active/ del backend
 */
const ProductToggleButton = ({ product, onToggle }) => {
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e) => {
    e.stopPropagation(); // Evitar que se active el click de la fila

    if (loading) return;

    console.log('[ProductToggleButton] 🖱️ Click en toggle para producto:', product.id);
    console.log('[ProductToggleButton] 📊 Estado actual:', product.is_active);

    try {
      setLoading(true);
      console.log('[ProductToggleButton] ⏳ Llamando a onToggle...');
      await onToggle(product.id);
      console.log('[ProductToggleButton] ✅ Toggle completado');
    } catch (error) {
      console.error('[ProductToggleButton] ❌ Error toggling product:', error);
      alert(`Error al cambiar estado: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`product-toggle-btn ${product.is_active ? 'active' : 'inactive'} ${loading ? 'loading' : ''}`}
      title={product.is_active ? 'Click para desactivar' : 'Click para activar'}
    >
      {loading ? (
        <>
          <span className="product-toggle-spinner"></span>
          <span>Actualizando...</span>
        </>
      ) : (
        <>
          {product.is_active ? (
            <>
              <CheckCircleIcon className="w-4 h-4" />
              <span>Activo</span>
            </>
          ) : (
            <>
              <XCircleIcon className="w-4 h-4" />
              <span>Inactivo</span>
            </>
          )}
        </>
      )}
    </button>
  );
};

export default ProductToggleButton;
