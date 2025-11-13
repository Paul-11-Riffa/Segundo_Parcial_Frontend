/**
 * ProductImage Component
 * Componente inteligente para manejar imágenes de productos con fallback automático
 * Muestra placeholder si la imagen falla en cargar
 */

import React, { useState } from 'react';

const ProductImage = ({ 
  src, 
  alt = 'Producto', 
  className = '',
  placeholderSrc = '/placeholder-product.svg',
  onError,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = (e) => {
    console.warn(`[ProductImage] Failed to load image: ${src}`);
    setHasError(true);
    setIsLoading(false);
    
    // Llamar callback personalizado si existe
    if (onError) {
      onError(e);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // Si hubo error o no hay src, mostrar placeholder
  const imageSrc = (hasError || !src) ? placeholderSrc : src;

  return (
    <div className={`product-image-container ${className}`} style={{ position: 'relative' }}>
      <img
        src={imageSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={`product-image ${isLoading ? 'loading' : ''}`}
        {...props}
      />
      
      {isLoading && src && !hasError && (
        <div className="product-image-loading" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f3f4f6'
        }}>
          <div className="spinner" style={{
            border: '3px solid #e5e7eb',
            borderTop: '3px solid #3b82f6',
            borderRadius: '50%',
            width: '30px',
            height: '30px',
            animation: 'spin 1s linear infinite'
          }}></div>
        </div>
      )}
    </div>
  );
};

export default ProductImage;
