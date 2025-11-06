// src/components/admin/inventory/StockBadge.jsx
import React from 'react';

/**
 * Badge para mostrar estado de stock con colores
 */
const StockBadge = ({ stock }) => {
  // Determinar estado del stock
  const getStockStatus = () => {
    if (stock === 0) {
      return {
        label: 'Sin Stock',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: '🔴',
      };
    } else if (stock < 10) {
      return {
        label: 'Stock Bajo',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: '⚠️',
      };
    } else {
      return {
        label: 'En Stock',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: '✅',
      };
    }
  };

  const status = getStockStatus();

  return (
    <div className="flex items-center gap-2">
      <span 
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border-2 ${status.color}`}
      >
        <span>{status.icon}</span>
        <span>{stock} unidades</span>
      </span>
    </div>
  );
};

export default StockBadge;
