import React from 'react';
import { CLAIM_STATUSES } from '../../services/claimService';

const StatusBadge = ({ status }) => {
  const statusConfig = CLAIM_STATUSES[status] || { label: status, color: 'gray' };

  const getStatusClass = (color) => {
    const classMap = {
      yellow: 'my-claims-status-pending',
      blue: 'my-claims-status-in-review',
      orange: 'my-claims-status-in-review',
      green: 'my-claims-status-approved',
      red: 'my-claims-status-rejected',
      gray: 'my-claims-status-resolved',
    };
    return classMap[color] || classMap.gray;
  };

  return (
    <span className={`my-claims-badge ${getStatusClass(statusConfig.color)}`}>
      {statusConfig.label}
    </span>
  );
};

export default StatusBadge;
