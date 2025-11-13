/**
 * ImageGallery Component
 * Galería de imágenes para productos con thumbnails y zoom
 */

import React, { useState } from 'react';
import './ImageGallery.css';

const ImageGallery = ({ images = [], productName = '' }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // ✅ CORREGIDO: Normalizar imágenes: priorizar image_url (Cloudinary) sobre image (local)
  const normalizeImage = (img) => {
    if (typeof img === 'string') return img;
    // ✅ PRIORIDAD: image_url (Cloudinary) > cloudinary_url > image (fallback)
    if (typeof img === 'object') {
      return img.image_url || img.cloudinary_url || img.image || '/placeholder-product.svg';
    }
    return '/placeholder-product.svg';
  };

  // Si no hay imágenes, usar placeholder
  const displayImages = images.length > 0
    ? images.map(normalizeImage)
    : ['/placeholder-product.jpg'];

  const currentImage = displayImages[selectedIndex];

  // Obtener alt text si está disponible
  const getAltText = (index) => {
    const originalImage = images[index];
    if (typeof originalImage === 'object' && originalImage.alt_text) {
      return originalImage.alt_text;
    }
    return `${productName} - Vista ${index + 1}`;
  };

  return (
    <div className="image-gallery">
      {/* Imagen principal */}
      <div className="image-gallery__main">
        <div className="image-gallery__main">
          <img
            src={currentImage}
            alt={getAltText(selectedIndex)}
            className="image-gallery__main-image"
            onError={(e) => {
              console.warn(`Failed to load gallery image: ${currentImage}`);
              e.target.src = '/placeholder-product.svg';
            }}
          />
        </div>
      </div>

      {/* Thumbnails (solo si hay múltiples imágenes) */}
      {displayImages.length > 1 && (
        <div className="image-gallery__thumbnails">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`image-gallery__thumbnail ${
                index === selectedIndex ? 'image-gallery__thumbnail--active' : ''
              }`}
            >
              <img
                src={image}
                alt={`${productName} - Miniatura ${index + 1}`}
                className="image-gallery__thumbnail-image"
                onError={(e) => {
                  e.target.src = '/placeholder-product.svg';
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Indicadores de navegación (para móvil) */}
      {displayImages.length > 1 && (
        <div className="image-gallery__indicators">
          {displayImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`image-gallery__indicator ${
                index === selectedIndex ? 'image-gallery__indicator--active' : ''
              }`}
              aria-label={`Ver imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
