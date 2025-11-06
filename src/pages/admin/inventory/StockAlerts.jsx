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
      <tr
        key={product.id}
        className={`hover:bg-blue-50 transition-colors ${
          index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
        }`}
      >
        {/* Imagen */}
        <td className="px-6 py-4">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
              <ArchiveBoxXMarkIcon className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </td>

        {/* Nombre */}
        <td className="px-6 py-4">
          <div className="font-medium text-gray-900">{product.name}</div>
          <div className="text-sm text-gray-500">{product.category_name}</div>
        </td>

        {/* Stock actual */}
        <td className="px-6 py-4">
          <StockBadge stock={product.stock} />
        </td>

        {/* Acción de actualizar stock */}
        <td className="px-6 py-4">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={editingStock[product.id]}
                onChange={(e) => handleStockChange(product.id, e.target.value)}
                className="w-24 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isUpdating}
              />
              <button
                onClick={() => handleSaveStock(product.id)}
                disabled={isUpdating}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:bg-green-400"
              >
                {isUpdating ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => handleCancelEdit(product.id)}
                disabled={isUpdating}
                className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => handleEditStock(product.id, product.stock)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
              Actualizar Stock
            </button>
          )}
        </td>
      </tr>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Alertas de Stock</h1>
        <p className="text-gray-600 mt-1">
          Productos que requieren atención inmediata
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Sin Stock (Crítico)</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {outOfStockProducts.length}
              </p>
              <p className="text-gray-500 text-sm mt-1">Requieren reposición urgente</p>
            </div>
            <ArchiveBoxXMarkIcon className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Stock Bajo</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {lowStockProducts.length}
              </p>
              <p className="text-gray-500 text-sm mt-1">Menos de 10 unidades</p>
            </div>
            <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Productos sin stock */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-red-50 px-6 py-4 border-b-2 border-red-200">
          <h2 className="text-xl font-bold text-red-800 flex items-center gap-2">
            <ArchiveBoxXMarkIcon className="w-6 h-6" />
            Productos Sin Stock (Crítico)
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <ArrowPathIcon className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Cargando...</span>
          </div>
        ) : outOfStockProducts.length === 0 ? (
          <div className="text-center p-12">
            <ArchiveBoxXMarkIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No hay productos sin stock</p>
            <p className="text-gray-500 text-sm mt-2">¡Excelente gestión de inventario!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Imagen
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Stock Actual
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {outOfStockProducts.map((product, index) => renderProductRow(product, index))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Productos con stock bajo */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-yellow-50 px-6 py-4 border-b-2 border-yellow-200">
          <h2 className="text-xl font-bold text-yellow-800 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-6 h-6" />
            Productos con Stock Bajo
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-12">
            <ArrowPathIcon className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Cargando...</span>
          </div>
        ) : lowStockProducts.length === 0 ? (
          <div className="text-center p-12">
            <ExclamationTriangleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No hay productos con stock bajo</p>
            <p className="text-gray-500 text-sm mt-2">Todos los productos tienen stock adecuado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Imagen
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Stock Actual
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Acción
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
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
