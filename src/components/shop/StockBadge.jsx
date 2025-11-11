/**
 * StockBadge Component
 * Badge que muestra el estado del stock de un producto
 */

import React from 'react';
import { getStockBadgeInfo } from '../../utils/productHelpers';
import './StockBadge.css';

const StockBadge = ({ stock, className = '' }) => {
  const { text, variant } = getStockBadgeInfo(stock);
  
  return (
    <span className={`stock-badge stock-badge--${variant} ${className}`}>
      {text}
    </span>
  );
};

export default StockBadge;
