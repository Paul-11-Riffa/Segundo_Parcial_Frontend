import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Botón para crear un reclamo desde una orden completada
 * Usar en OrderHistoryPage o componentes similares
 */
const CreateClaimButton = ({ orderId, orderStatus, className = '' }) => {
  // Solo mostrar para órdenes completadas
  if (orderStatus !== 'COMPLETED' && orderStatus !== 'DELIVERED') {
    return null;
  }

  return (
    <Link
      to={`/claims/create/${orderId}`}
      className={`inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition ${className}`}
      title="Reportar un problema con esta orden"
    >
      <svg
        className="w-5 h-5 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      Reportar Problema
    </Link>
  );
};

export default CreateClaimButton;
