// src/pages/admin/inventory/ProductsList.jsx
import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  CubeIcon,
  FunnelIcon,
  XMarkIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import useProducts from '../../../hooks/admin/useProducts';
import useCategories from '../../../hooks/admin/useCategories';
import StockBadge from '../../../components/admin/inventory/StockBadge';
import ProductToggleButton from '../../../components/admin/inventory/ProductToggleButton';
import ProductForm from './ProductForm';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import './ProductsList.css';

const ProductsList = () => {
  const {
    products,
    loading,
    error,
    filters,
    updateFilter,
    resetFilters,
    fetchProducts,  // ✅ NUEVO: Necesario para recargar después de editar
    deleteProduct,
    toggleProductActive,  // ⭐ NUEVO
    updateStock,
    getStockStats,
  } = useProducts();

  const { categories, loading: loadingCategories } = useCategories();

  // Estados locales
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Estadísticas
  const stats = getStockStats();

  // Handlers
  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product) => {
    console.log('[ProductsList] 📝 Editando producto:', product.id, product.name);
    console.log('[ProductsList] 📝 Datos completos:', product);
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteProduct(productToDelete.id);
      setShowDeleteDialog(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    }
  };

  const handleFormClose = () => {
    console.log('[ProductsList] 🚪 Modal cerrado');
    setShowForm(false);
    setSelectedProduct(null);

    // ✅ OPTIMIZADO: ProductForm ya recargó la lista, no es necesario recargar aquí
    // Esto evita recargas duplicadas y mejora la velocidad
  };

  const handleToggleActive = async (productId) => {
    try {
      console.log('[ProductsList] 🔄 Toggling product:', productId);
      const response = await toggleProductActive(productId);
      
      console.log('[ProductsList] 📥 Response:', response);
      
      if (response && response.success) {
        console.log('[ProductsList] ✅ Toggle successful:', response.message);
        console.log('[ProductsList] 📊 New state:', response.product?.is_active);
        // El hook ya actualiza el estado local, no necesitamos hacer nada más
      } else {
        console.warn('[ProductsList] ⚠️ Response sin success:', response);
      }
    } catch (error) {
      console.error('[ProductsList] ❌ Error toggling product:', error);
      console.error('[ProductsList] ❌ Error response:', error.response?.data);
      alert(error.response?.data?.error || error.message || 'Error al cambiar estado del producto');
    }
  };

  const handleSortChange = (field) => {
    const currentOrdering = filters.ordering;
    let newOrdering;

    if (currentOrdering === field) {
      // Si ya está ordenado ascendente, cambiar a descendente
      newOrdering = `-${field}`;
    } else if (currentOrdering === `-${field}`) {
      // Si ya está ordenado descendente, quitar ordenamiento
      newOrdering = '-created_at'; // Default
    } else {
      // Ordenar ascendente
      newOrdering = field;
    }

    updateFilter('ordering', newOrdering);
  };

  const getSortIcon = (field) => {
    if (filters.ordering === field) {
      return <ChevronUpIcon className="w-4 h-4" />;
    } else if (filters.ordering === `-${field}`) {
      return <ChevronDownIcon className="w-4 h-4" />;
    }
    return null;
  };

  return (
    <div className="products-container">
      {/* Header */}
      <div className="products-header">
        <div className="products-header-content">
          <h1>Products Management</h1>
          <p>Manage inventory and stock</p>
        </div>
        <button onClick={handleCreateProduct} className="products-create-button">
          <PlusIcon />
          New Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="products-stats">
        <div className="products-stat-card total">
          <div className="products-stat-card-content">
            <div className="products-stat-info">
              <p>Total Products</p>
              <p>{stats.total}</p>
            </div>
            <CubeIcon className="products-stat-icon" />
          </div>
        </div>

        <div className="products-stat-card in-stock">
          <div className="products-stat-card-content">
            <div className="products-stat-info">
              <p>In Stock</p>
              <p>{stats.inStock}</p>
            </div>
            <CubeIcon className="products-stat-icon" />
          </div>
        </div>

        <div className="products-stat-card low-stock">
          <div className="products-stat-card-content">
            <div className="products-stat-info">
              <p>Low Stock</p>
              <p>{stats.lowStock}</p>
            </div>
            <CubeIcon className="products-stat-icon" />
          </div>
        </div>

        <div className="products-stat-card out-of-stock">
          <div className="products-stat-card-content">
            <div className="products-stat-info">
              <p>Out of Stock</p>
              <p>{stats.outOfStock}</p>
            </div>
            <CubeIcon className="products-stat-icon" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="products-toolbar">
        <div className="products-toolbar-main">
          <div className="products-search-wrapper">
            <MagnifyingGlassIcon className="products-search-icon" />
            <input
              type="text"
              placeholder="Search products by name..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="products-search-input"
            />
          </div>

          <div className="products-toolbar-actions">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`products-filter-button ${showFilters ? 'active' : ''}`}
            >
              <FunnelIcon />
              Filters
            </button>

            <button onClick={resetFilters} className="products-clear-button">
              <XMarkIcon />
              Clear
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="products-filters-panel">
            <div className="products-filter-group">
              <label className="products-filter-label">Category</label>
              <select
                value={filters.category_slug}
                onChange={(e) => updateFilter('category_slug', e.target.value)}
                className="products-filter-select"
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="products-filter-group">
              <label className="products-filter-label">Min Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="$0.00"
                value={filters.price_min}
                onChange={(e) => updateFilter('price_min', e.target.value)}
                className="products-filter-input"
              />
            </div>

            <div className="products-filter-group">
              <label className="products-filter-label">Max Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="$999.99"
                value={filters.price_max}
                onChange={(e) => updateFilter('price_max', e.target.value)}
                className="products-filter-input"
              />
            </div>

            <div className="products-filter-group">
              <label className="products-filter-label">Min Stock</label>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={filters.stock_min}
                onChange={(e) => updateFilter('stock_min', e.target.value)}
                className="products-filter-input"
              />
            </div>

            <div className="products-filter-checkbox-wrapper">
              <input
                type="checkbox"
                id="in_stock"
                checked={filters.in_stock}
                onChange={(e) => updateFilter('in_stock', e.target.checked)}
                className="products-filter-checkbox"
              />
              <label htmlFor="in_stock" className="products-filter-checkbox-label">
                Only available products
              </label>
            </div>

            <div className="products-filter-group">
              <label className="products-filter-label">Status</label>
              <select
                value={filters.is_active === undefined ? 'all' : filters.is_active ? 'active' : 'inactive'}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'all') {
                    updateFilter('is_active', undefined);
                  } else {
                    updateFilter('is_active', value === 'active');
                  }
                }}
                className="products-filter-select"
              >
                <option value="all">All Products</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="products-error">
          <p>{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="products-table-wrapper">
        {loading ? (
          <div className="products-loading">
            <div className="products-loading-spinner"></div>
            <p className="products-loading-text">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="products-empty">
            <CubeIcon className="products-empty-icon" />
            <p className="products-empty-title">No products found</p>
            <p className="products-empty-description">
              {filters.search || filters.category_slug
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first product by clicking "New Product"'}
            </p>
          </div>
        ) : (
          <div className="products-table-container">
            <table className="products-table">
              <thead>
                <tr>
                  <th
                    className="sortable"
                    onClick={() => handleSortChange('name')}
                  >
                    <div className="products-table-sort-header">
                      Product
                      {getSortIcon('name') && (
                        <span className="products-table-sort-icon">
                          {getSortIcon('name')}
                        </span>
                      )}
                    </div>
                  </th>
                  <th>Category</th>
                  <th
                    className="sortable"
                    onClick={() => handleSortChange('price')}
                  >
                    <div className="products-table-sort-header">
                      Price
                      {getSortIcon('price') && (
                        <span className="products-table-sort-icon">
                          {getSortIcon('price')}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="sortable"
                    onClick={() => handleSortChange('stock')}
                  >
                    <div className="products-table-sort-header">
                      Stock
                      {getSortIcon('stock') && (
                        <span className="products-table-sort-icon">
                          {getSortIcon('stock')}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    className="sortable"
                    onClick={() => handleSortChange('is_active')}
                  >
                    <div className="products-table-sort-header">
                      Status
                      {getSortIcon('is_active') && (
                        <span className="products-table-sort-icon">
                          {getSortIcon('is_active')}
                        </span>
                      )}
                    </div>
                  </th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className={!product.is_active ? 'inactive-product' : ''}>
                    {/* Product */}
                    <td>
                      <div className="products-table-product">
                        {/* Prioridad: images[is_primary=true] > image_url > image > placeholder */}
                        {(() => {
                          // Buscar imagen principal en el array de imágenes
                          const primaryImage = product.images?.find(img => img.is_primary);
                          let imageUrl = primaryImage?.image_url || product.image_url || product.image;

                          // ✅ Cache-busting: Usar timestamp de la imagen o created_at para forzar recarga
                          // Esto evita parpadeos constantes pero fuerza recarga cuando la imagen cambia
                          if (imageUrl && primaryImage?.created_at) {
                            const cacheBuster = new Date(primaryImage.created_at).getTime();
                            const separator = imageUrl.includes('?') ? '&' : '?';
                            imageUrl = `${imageUrl}${separator}v=${cacheBuster}`;
                          }

                          return imageUrl ? (
                            <img
                              key={`product-img-${product.id}-${primaryImage?.id || 'default'}`}
                              src={imageUrl}
                              alt={primaryImage?.alt_text || product.name}
                              className="products-table-image"
                              onError={(e) => {
                                // Fallback si la imagen falla al cargar
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : (
                            <div className="products-table-image-placeholder">
                              <PhotoIcon />
                            </div>
                          );
                        })()}
                        <div className="products-table-product-info">
                          <p className="products-table-product-name">{product.name}</p>
                          {product.sku && (
                            <p className="products-table-product-sku">SKU: {product.sku}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="products-table-category">
                        {product.category_name}
                      </span>
                    </td>

                    {/* Price */}
                    <td>
                      <span className="products-table-price">
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </td>

                    {/* Stock */}
                    <td>
                      <StockBadge stock={product.stock} />
                    </td>

                    {/* Status */}
                    <td>
                      <ProductToggleButton
                        product={product}
                        onToggle={handleToggleActive}
                      />
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="products-table-actions">
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="products-action-button edit"
                          title="Edit product"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="products-action-button delete"
                          title="Delete product"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Formulario de producto (Modal) */}
      {showForm && (
        <ProductForm
          product={selectedProduct}
          onClose={handleFormClose}
          onSave={fetchProducts}  // ✅ NUEVO: Pasar función para recargar lista
        />
      )}

      {/* Diálogo de confirmación de eliminación */}
      {showDeleteDialog && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setProductToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Product"
          message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
        />
      )}
    </div>
  );
};

export default ProductsList;
