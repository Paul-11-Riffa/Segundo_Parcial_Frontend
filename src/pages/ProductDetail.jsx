/**
 * ProductDetail Page
 * Shows full product information with image gallery
 * Features: Multiple images, back button, stock badge, category link, add to cart
 * Apple/Nike minimalist design
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/shopService';
import { formatPrice, isProductAvailable } from '../utils/productHelpers';
import StockBadge from '../components/shop/StockBadge';
import ImageGallery from '../components/shop/ImageGallery';
import AddToCartButton from '../components/cart/AddToCartButton';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Prepare images array for gallery
  const getProductImages = (product) => {
    if (!product) return [];
    
    // If new images array exists, use it
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    
    // Fallback to legacy single image
    if (product.image) {
      return [{
        id: 1,
        image: product.image, // ✅ CORREGIDO: usar 'image' en lugar de 'image_url'
        alt_text: product.name,
        order: 0,
        is_primary: true
      }];
    }
    
    // No images available
    return [];
  };
  
  useEffect(() => {
    loadProduct();
  }, [id]);
  
  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProductById(id);
      setProduct(data);
    } catch (err) {
      console.error('Error loading product:', err);
      if (err.response?.status === 404) {
        setError('Producto no encontrado');
      } else {
        setError('No se pudo cargar el producto. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleBack = () => {
    navigate('/shop');
  };
  
  // Loading State
  if (loading) {
    return (
      <div className="product-detail">
        <div className="product-detail__container">
          <div className="product-detail__loading">
            <div className="loading-spinner"></div>
            <p>Cargando producto...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Error State
  if (error || !product) {
    return (
      <div className="product-detail">
        <div className="product-detail__container">
          <div className="product-detail__error">
            <svg 
              className="product-detail__error-icon"
              width="64" 
              height="64" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h2 className="product-detail__error-title">{error || 'Error'}</h2>
            <p className="product-detail__error-message">
              El producto que buscas no está disponible
            </p>
            <button 
              className="product-detail__back-button product-detail__back-button--error"
              onClick={handleBack}
            >
              Volver al catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const available = isProductAvailable(product);
  
  return (
    <div className="product-detail">
      <div className="product-detail__container">
        {/* Back Button */}
        <button 
          className="product-detail__back"
          onClick={handleBack}
          aria-label="Volver al catálogo"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Volver al catálogo</span>
        </button>
        
        {/* Product Content */}
        <div className="product-detail__content">
          {/* Image Gallery */}
          <div className="product-detail__image-section">
            <ImageGallery 
              images={getProductImages(product)}
              productName={product.name}
            />
            
            {/* Image count badge */}
            {product.image_count > 1 && (
              <div className="product-detail__image-count">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span>{product.image_count} imágenes</span>
              </div>
            )}
          </div>
          
          {/* Info Section */}
          <div className="product-detail__info-section">
            {/* Category */}
            {product.category_name && (
              <div className="product-detail__category">
                {product.category_name}
              </div>
            )}
            
            {/* Name */}
            <h1 className="product-detail__name">
              {product.name}
            </h1>
            
            {/* Stock Badge */}
            <div className="product-detail__stock">
              <StockBadge stock={product.stock} showQuantity={true} />
            </div>
            
            {/* Price */}
            <div className="product-detail__price-section">
              <span className="product-detail__price">
                {formatPrice(product.price)}
              </span>
            </div>
            
            {/* Description */}
            {product.description && (
              <div className="product-detail__description">
                <h2 className="product-detail__description-title">Descripción</h2>
                <p className="product-detail__description-text">
                  {product.description}
                </p>
              </div>
            )}
            
            {/* Product Details */}
            <div className="product-detail__specs">
              <h2 className="product-detail__specs-title">Detalles</h2>
              <dl className="product-detail__specs-list">
                <div className="product-detail__spec-item">
                  <dt>SKU</dt>
                  <dd>{product.id}</dd>
                </div>
                <div className="product-detail__spec-item">
                  <dt>Categoría</dt>
                  <dd>{product.category_name || 'Sin categoría'}</dd>
                </div>
                <div className="product-detail__spec-item">
                  <dt>Disponibilidad</dt>
                  <dd>{product.stock} unidades</dd>
                </div>
              </dl>
            </div>
            
            {/* Action Button */}
            <div className="product-detail__actions">
              <AddToCartButton
                product={product}
                className="product-detail__add-button"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
