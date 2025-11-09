import { Check, Trash2, ExternalLink } from 'lucide-react';
import { getNotificationIcon, formatNotificationDate, getPriorityColor } from '../../utils/notificationHelpers';
import './NotificationItem.css';

/**
 * Componente para mostrar una notificación individual
 * Soporta modo compacto y modo completo
 */
const NotificationItem = ({ 
  notification, 
  compact = false, 
  showActions = true,
  onMarkAsRead,
  onDelete,
  onClick 
}) => {
  // Verificación de seguridad
  if (!notification) {
    console.warn('NotificationItem: notification is undefined');
    return null;
  }

  const { 
    id, 
    title = 'Notificación', 
    body = '', 
    type = 'SYSTEM', 
    priority = 'NORMAL', 
    created_at, 
    is_read = false
  } = notification;

  const iconEmoji = getNotificationIcon(type);
  const priorityColor = getPriorityColor(priority);
  const formattedDate = formatNotificationDate(created_at);

  // Handler para marcar como leída
  const handleMarkAsRead = async (e) => {
    e.stopPropagation();
    if (onMarkAsRead) {
      await onMarkAsRead(id);
    }
  };

  // Handler para eliminar
  const handleDelete = async (e) => {
    e.stopPropagation();
    if (onDelete) {
      await onDelete(id);
    }
  };

  // Handler para click en la notificación
  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    }
  };

  return (
    <div 
      className={`notification-item ${compact ? 'notification-item-compact' : ''} ${!is_read ? 'notification-item-unread' : ''}`}
      onClick={handleClick}
      role={onClick ? 'button' : 'article'}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Indicador de prioridad */}
      {priority !== 'NORMAL' && (
        <div 
          className="notification-item-priority-indicator"
          style={{ backgroundColor: priorityColor }}
          title={`Prioridad: ${priority}`}
        />
      )}

      {/* Ícono */}
      <div 
        className="notification-item-icon"
        style={{ backgroundColor: `${priorityColor}20`, color: priorityColor }}
      >
        <span style={{ fontSize: compact ? '18px' : '22px' }}>{iconEmoji}</span>
      </div>

      {/* Contenido */}
      <div className="notification-item-content">
        <div className="notification-item-header">
          <h4 className="notification-item-title">
            {title}
            {!is_read && <span className="notification-item-unread-dot" />}
          </h4>
          <span className="notification-item-date">{formattedDate}</span>
        </div>

        {!compact && (
          <p className="notification-item-body">{body}</p>
        )}

        {!compact && (
          <div className="notification-item-meta">
            <span className="notification-item-type">
              {type ? type.replace(/_/g, ' ') : 'NOTIFICACIÓN'}
            </span>
            {priority !== 'NORMAL' && (
              <span 
                className="notification-item-priority"
                style={{ color: priorityColor }}
              >
                {priority}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Acciones */}
      {showActions && (
        <div className="notification-item-actions">
          {!is_read && (
            <button
              onClick={handleMarkAsRead}
              className="notification-item-action-btn"
              title="Marcar como leída"
              aria-label="Marcar como leída"
            >
              <Check size={16} />
            </button>
          )}
          
          {onClick && (
            <button
              onClick={handleClick}
              className="notification-item-action-btn"
              title="Ver detalles"
              aria-label="Ver detalles"
            >
              <ExternalLink size={16} />
            </button>
          )}
          
          <button
            onClick={handleDelete}
            className="notification-item-action-btn notification-item-action-delete"
            title="Eliminar"
            aria-label="Eliminar notificación"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
