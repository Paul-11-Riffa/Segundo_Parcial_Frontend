import React from 'react';
import { PRIORITIES } from '../../services/claimService';

const PriorityBadge = ({ priority }) => {
  const priorityConfig = PRIORITIES[priority] || { label: priority, color: 'gray' };

  const getPriorityClass = (color) => {
    const classMap = {
      gray: 'my-claims-priority-low',
      blue: 'my-claims-priority-medium',
      orange: 'my-claims-priority-high',
      red: 'my-claims-priority-urgent',
    };
    return classMap[color] || classMap.gray;
  };

  return (
    <span className={`my-claims-badge my-claims-priority ${getPriorityClass(priorityConfig.color)}`}>
      {priorityConfig.label}
    </span>
  );
};

export default PriorityBadge;
