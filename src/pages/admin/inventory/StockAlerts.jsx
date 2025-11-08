// src/pages/admin/inventory/StockAlerts.jsx
import React, { useState } from 'react';
import { 
  ExclamationTriangleIcon, 
  ArchiveBoxXMarkIcon, 
  ArrowPathIcon, 
  PencilIcon 
} from '@heroicons/react/24/outline';
import useProducts from '../../../hooks/admin/useProducts';
import StockBadge from '../../../components/admin/inventory/StockBadge';
import './StockAlerts.css';

const StockAlerts = () => {
  const {
    products,
    loading,
    error,
    updateStock,
    getLowStockProducts,
    getOutOfStockProducts,
  } = useProducts();

  // Estados locales
  const [editingStock, setEditingStock] = useState({});
  const [updatingProduct, setUpdatingProduct] = useState(null);

  // Obtener productos críticos
  const lowStockProducts = getLowStockProducts();
  const outOfStockProducts = getOutOfStockProducts();

  // Iniciar edición de stock
  const handleEditStock = (productId, currentStock) => {
    setEditingStock({
      ...editingStock,
      [productId]: currentStock,
    });
  };

  // Cancelar edición
  const handleCancelEdit = (productId) => {
    const newEditing = { ...editingStock };
    delete newEditing[productId];
    setEditingStock(newEditing);
  };

  // Guardar nuevo stock
  const handleSaveStock = async (productId) => {
    const newStock = editingStock[productId];
    
    if (newStock === undefined || newStock < 0) {
      return;
    }

    try {
      setUpdatingProduct(productId);
      await updateStock(productId, parseInt(newStock));
      
      // Limpiar edición
      const newEditing = { ...editingStock };
      delete newEditing[productId];
      setEditingStock(newEditing);
    } catch (error) {
      console.error('Error al actualizar stock:', error);
    } finally {
      setUpdatingProduct(null);
    }
  };

  // Manejar cambio en input de stock
  const handleStockChange = (productId, value) => {
    setEditingStock({
      ...editingStock,
      [productId]: value,
    });
  };

  // Renderizar fila de producto
  const renderProductRow = (product, index) => {
    const isEditing = editingStock[product.id] !== undefined;
    const isUpdating = updatingProduct === product.id;

    return (
      <tr key={product.id}>
        {/* Imagen */}
        <td>
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="stock-alerts-table-image"
            />
          ) : (
            <div className="stock-alerts-table-image-placeholder">
              <ArchiveBoxXMarkIcon />
            </div>
          )}
        </td>

        {/* Nombre */}
        <td>
          <div className="stock-alerts-table-product-name">{product.name}</div>
          <div className="stock-alerts-table-product-category">{product.category_name}</div>
        </td>

        {/* Stock actual */}
        <td>
          <StockBadge stock={product.stock} />
        </td>

        {/* Acción de actualizar stock */}
        <td>
          {isEditing ? (
            <div className="stock-alerts-edit-form">
              <input
                type="number"
                min="0"
                value={editingStock[product.id]}
                onChange={(e) => handleStockChange(product.id, e.target.value)}
                className="stock-alerts-edit-input"
                disabled={isUpdating}
              />
              <button
                onClick={() => handleSaveStock(product.id)}
                disabled={isUpdating}
                className="stock-alerts-edit-button save"
              >
                {isUpdating ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => handleCancelEdit(product.id)}
                disabled={isUpdating}
                className="stock-alerts-edit-button cancel"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleEditStock(product.id, product.stock)}
              className="stock-alerts-update-button"
            >
              <PencilIcon />
              Actualizar Stock
            </button>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="stock-alerts-container">
      {/* Header */}
      <div className="stock-alerts-header">
        <h1>Alertas de Stock</h1>
        <p>Productos que requieren atención inmediata</p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="stock-alerts-summary">
        <div className="stock-alert-card critical">
          <div className="stock-alert-card-content">
            <p className="stock-alert-card-label">Sin Stock (Crítico)</p>
            <p className="stock-alert-card-value">
              {outOfStockProducts.length}
            </p>
            <p className="stock-alert-card-description">Requieren reposición urgente</p>
          </div>
          <ArchiveBoxXMarkIcon className="stock-alert-card-icon" />
        </div>

        <div className="stock-alert-card warning">
          <div className="stock-alert-card-content">
            <p className="stock-alert-card-label">Stock Bajo</p>
            <p className="stock-alert-card-value">
              {lowStockProducts.length}
            </p>
            <p className="stock-alert-card-description">Menos de 10 unidades</p>
          </div>
          <ExclamationTriangleIcon className="stock-alert-card-icon" />
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="stock-alerts-error">
          <ExclamationTriangleIcon className="stock-alerts-error-icon" />
          <p>{error}</p>
        </div>
      )}

      {/* Productos sin stock */}
      <div className="stock-alerts-section">
        <div className="stock-alerts-section-header critical">
          <h2>
            <ArchiveBoxXMarkIcon className="stock-alerts-section-header-icon" />
            Productos Sin Stock (Crítico)
          </h2>
        </div>

        {loading ? (
          <div className="stock-alerts-loading">
            <div className="stock-alerts-loading-spinner"></div>
            <span className="stock-alerts-loading-text">Cargando...</span>
          </div>
        ) : outOfStockProducts.length === 0 ? (
          <div className="stock-alerts-empty">
            <ArchiveBoxXMarkIcon className="stock-alerts-empty-icon" />
            <p className="stock-alerts-empty-title">No hay productos sin stock</p>
            <p className="stock-alerts-empty-description">¡Excelente gestión de inventario!</p>
          </div>
        ) : (
          <div className="stock-alerts-table-container">
            <table className="stock-alerts-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Producto</th>
                  <th>Stock Actual</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {outOfStockProducts.map((product, index) => renderProductRow(product, index))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Productos con stock bajo */}
      <div className="stock-alerts-section">
        <div className="stock-alerts-section-header warning">
          <h2>
            <ExclamationTriangleIcon className="stock-alerts-section-header-icon" />
            Productos con Stock Bajo
          </h2>
        </div>

        {loading ? (
          <div className="stock-alerts-loading">
            <div className="stock-alerts-loading-spinner"></div>
            <span className="stock-alerts-loading-text">Cargando...</span>
          </div>
        ) : lowStockProducts.length === 0 ? (
          <div className="stock-alerts-empty">
            <ExclamationTriangleIcon className="stock-alerts-empty-icon" />
            <p className="stock-alerts-empty-title">No hay productos con stock bajo</p>
            <p className="stock-alerts-empty-description">Todos los productos tienen stock adecuado</p>
          </div>
        ) : (
          <div className="stock-alerts-table-container">
            <table className="stock-alerts-table">
              <thead>
                <tr>
                  <th>Imagen</th>
                  <th>Producto</th>
                  <th>Stock Actual</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((product, index) => renderProductRow(product, index))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockAlerts;
