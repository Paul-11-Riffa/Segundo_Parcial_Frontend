/**
 * Shop Page
 * Página de tienda con catálogo completo de productos
 */

import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllProducts, getCategories } from '../services/shopService';
import { formatPrice, getProductImage, filterProducts } from '../utils/productHelpers';
import StockBadge from '../components/shop/StockBadge';
import Button from '../components/ui/Button';
import { NotificationIcon } from '../components/notifications';
import CartIcon from '../components/cart/CartIcon';
import { Package, Mic, MicOff, Loader, MessageSquare } from 'lucide-react';
import { useVoiceSearch } from '../hooks/useVoiceSearch';
import './Shop.css';

const Shop = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'name-asc');
  const [showOnlyInStock, setShowOnlyInStock] = useState(false);

  // Hook de búsqueda por voz
  const {
    isListening,
    isProcessing,
    results: voiceResults,
    error: voiceError,
    interpretation,
    isBrowserSupported,
    startListening,
    stopListening,
    resetSearch,
  } = useVoiceSearch(); // Sin parámetros, obtiene token de localStorage

  // Cargar productos y categorías
  useEffect(() => {
    loadData();
  }, []);

  // Actualizar URL cuando cambien los filtros
  useEffect(() => {
    const params = {};
    if (searchTerm) params.search = searchTerm;
    if (selectedCategory) params.category = selectedCategory;
    if (sortBy !== 'name-asc') params.sort = sortBy;
    
    setSearchParams(params);
  }, [searchTerm, selectedCategory, sortBy, setSearchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [productsData, categoriesData] = await Promise.all([
        getAllProducts(),
        getCategories()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading shop data:', err);
      setError('Error al cargar los productos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const filteredProducts = filterProducts(
    voiceResults || products, // Usar resultados de voz si existen
    {
      search: searchTerm,
      category: selectedCategory ? parseInt(selectedCategory) : null,
      inStock: showOnlyInStock,
      sortBy
    }
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    resetSearch(); // Limpiar búsqueda por voz al escribir
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? '' : categoryId);
    resetSearch();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortBy('name-asc');
    setShowOnlyInStock(false);
    resetSearch();
  };

  // Manejar botón de voz
  const handleVoiceSearch = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (loading) {
    return (
      <div className="shop-page">
        <div className="shop-container">
          <div className="shop-loading">
            <div className="spinner"></div>
            <p>Cargando productos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop-page">
        <div className="shop-container">
          <div className="shop-error">
            <svg className="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2"/>
              <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2"/>
              <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2"/>
            </svg>
            <h2>Error al cargar</h2>
            <p>{error}</p>
            <button onClick={loadData} className="btn-retry">Reintentar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-page">
      {/* Header con iconos de notificaciones, carrito y perfil */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-dark-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-dark-900 text-white transition-transform group-hover:scale-110">
              <span className="text-sm font-bold">S</span>
            </div>
            <span className="text-lg font-semibold text-dark-900">Ventas inteligentes 365</span>
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <>
                {/* Iconos de Acción */}
                <div className="flex items-center gap-2">
                  <NotificationIcon />
                  <CartIcon />
                </div>

                {/* Reclamos */}
                <Link to="/claims">
                  <button className="icon-button" style={{ gap: '6px', paddingLeft: '12px', paddingRight: '12px' }}>
                    <MessageSquare size={20} strokeWidth={2} />
                    <span className="hidden md:inline text-sm font-medium">Reclamos</span>
                  </button>
                </Link>

                {/* Mis Órdenes */}
                <Link to="/my-orders">
                  <button className="icon-button" style={{ gap: '6px', paddingLeft: '12px', paddingRight: '12px' }}>
                    <Package size={20} strokeWidth={2} />
                    <span className="hidden md:inline text-sm font-medium">Mis Órdenes</span>
                  </button>
                </Link>

                {/* Perfil de Usuario */}
                <Link to="/profile" className="group">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="hidden sm:flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="hidden md:flex flex-col">
                        <span className="text-sm font-semibold text-gray-900 leading-tight">{user.username}</span>
                        <span className="text-xs text-gray-500">Ver perfil</span>
                      </div>
                    </div>
                    <svg className="md:hidden w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </Link>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Iniciar sesión</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm" className="bg-dark-900 hover:bg-dark-800 focus:ring-dark-700">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Page title - ahora con padding para el header fijo */}
      <div className="shop-header-title">
        <div className="shop-header-content">
          <h1>Tienda</h1>
          <p>{products.length} productos disponibles</p>
        </div>
      </div>

      <div className="shop-container">
        {/* Interpretación de búsqueda por voz */}
        {interpretation && (
          <div className="voice-interpretation-card">
            <div className="voice-interpretation-header">
              <Mic size={18} />
              <span>Búsqueda por voz</span>
              <button 
                onClick={resetSearch} 
                className="voice-close-btn"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="voice-interpretation-body">
              <p className="voice-said">
                <strong>Dijiste:</strong> "{interpretation.original}"
              </p>
              <p className="voice-understood">
                <strong>Entendí:</strong> {interpretation.understood}
              </p>
              <div className="voice-confidence">
                <span className="voice-confidence-label">Confianza:</span>
                <div className="voice-confidence-bar-container">
                  <div 
                    className="voice-confidence-bar" 
                    style={{ 
                      width: `${interpretation.confidence * 100}%`,
                      backgroundColor: 
                        interpretation.confidence >= 0.7 ? '#10b981' :
                        interpretation.confidence >= 0.4 ? '#f59e0b' :
                        '#ef4444'
                    }}
                  ></div>
                </div>
                <span className="voice-confidence-value">
                  {Math.round(interpretation.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error de búsqueda por voz */}
        {voiceError && (
          <div className="voice-error-card">
            <MicOff size={18} />
            <span>{voiceError}</span>
            <button onClick={resetSearch} className="voice-error-close">×</button>
          </div>
        )}

        {/* Filtros Horizontales */}
        <div className="filters-horizontal">
          {/* Búsqueda con botón de voz */}
          <div className="filter-item filter-search-with-voice">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Buscar productos..."
              className="filter-input-horizontal"
            />
            {isBrowserSupported && user && (
              <button
                onClick={handleVoiceSearch}
                className={`voice-search-btn ${isListening ? 'listening' : ''} ${isProcessing ? 'processing' : ''}`}
                disabled={isProcessing}
                title={isListening ? 'Escuchando... (clic para detener)' : 'Buscar por voz'}
              >
                {isProcessing ? (
                  <Loader size={20} className="voice-icon-spin" />
                ) : isListening ? (
                  <MicOff size={20} />
                ) : (
                  <Mic size={20} />
                )}
              </button>
            )}
          </div>

          {/* Categorías */}
          <div className="filter-item">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select-horizontal"
            >
              <option value="">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id.toString()}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock */}
          <div className="filter-item">
            <label className="checkbox-horizontal">
              <input
                type="checkbox"
                checked={showOnlyInStock}
                onChange={(e) => setShowOnlyInStock(e.target.checked)}
                className="checkbox-input-horizontal"
              />
              <span>Solo con stock</span>
            </label>
          </div>

          {/* Ordenar */}
          <div className="filter-item">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select-horizontal"
            >
              <option value="name-asc">Nombre (A-Z)</option>
              <option value="name-desc">Nombre (Z-A)</option>
              <option value="price-asc">Precio: Menor a mayor</option>
              <option value="price-desc">Precio: Mayor a menor</option>
            </select>
          </div>

          {/* Limpiar filtros */}
          {(searchTerm || selectedCategory || showOnlyInStock || sortBy !== 'name-asc') && (
            <div className="filter-item">
              <button onClick={handleClearFilters} className="btn-clear-horizontal">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>

          {/* Productos */}
          <main className="shop-main">
            {/* Resultados header */}
            <div className="results-header">
              <p>
                Mostrando {filteredProducts.length} de {products.length} productos
              </p>
            </div>

            {/* Grid de productos */}
            {filteredProducts.length === 0 ? (
              <div className="empty-state">
                <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h3>No se encontraron productos</h3>
                <p>Intenta ajustar los filtros o realizar una búsqueda diferente</p>
                <button onClick={handleClearFilters} className="btn-clear-filters">
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="product-card">
                    <Link to={`/products/${product.id}`} className="product-image-link">
                      <div className="product-image-wrapper">
                        <img
                          src={getProductImage(product)}
                          alt={product.name}
                          className="product-image"
                        />
                      </div>
                    </Link>
                    
                    <div className="product-content">
                      <div className="product-badge">
                        <StockBadge stock={product.stock} />
                      </div>
                      
                      <Link to={`/products/${product.id}`} className="product-link">
                        <h3 className="product-name">{product.name}</h3>
                      </Link>
                      
                      {product.description && (
                        <p className="product-description">{product.description}</p>
                      )}
                      
                      <div className="product-footer">
                        <div className="product-pricing">
                          <p className="product-price">{formatPrice(product.price)}</p>
                          {product.original_price && product.original_price > product.price && (
                            <p className="product-original-price">{formatPrice(product.original_price)}</p>
                          )}
                        </div>
                        
                        <Link to={`/products/${product.id}`} className="btn-view-details">
                          Ver detalles
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
      </div>
    </div>
  );
};

export default Shop;
