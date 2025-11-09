import { Link } from 'react-router-dom';
import { Check, CheckCheck, Settings, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useNotificationActions } from '../../hooks/useNotificationActions';
import NotificationItem from './NotificationItem';
import './NotificationDropdown.css';

/**
 * Dropdown con preview de notificaciones recientes
 * Muestra las últimas 5 notificaciones no leídas
 */
const NotificationDropdown = ({ notifications, onClose }) => {
  const { markAllAsRead, unreadCount } = useNotifications();
  const { handleNotificationClick } = useNotificationActions();

  // Obtener solo las no leídas, limitadas a 5
  const unreadNotifications = notifications
    .filter(n => !n.is_read)
    .slice(0, 5);

  // Manejar click en notificación
  const handleItemClick = async (notification) => {
    await handleNotificationClick(notification);
    onClose();
  };

  // Marcar todas como leídas
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
  };

  return (
    <div className="notification-dropdown">
      {/* Header */}
      <div className="notification-dropdown-header">
        <div className="notification-dropdown-title">
          <h3>Notificaciones</h3>
          {unreadCount > 0 && (
            <span className="notification-dropdown-count">
              {unreadCount} nuevas
            </span>
          )}
        </div>

        <div className="notification-dropdown-actions">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="notification-dropdown-action-btn"
              title="Marcar todas como leídas"
            >
              <CheckCheck size={18} />
            </button>
          )}
          
          <Link
            to="/notifications/preferences"
            className="notification-dropdown-action-btn"
            title="Configuración"
            onClick={onClose}
          >
            <Settings size={18} />
          </Link>

          <button
            onClick={onClose}
            className="notification-dropdown-action-btn"
            title="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="notification-dropdown-list">
        {unreadNotifications.length > 0 ? (
          <>
            {unreadNotifications.map((notification) => (
              <div 
                key={notification.id}
                onClick={() => handleItemClick(notification)}
                className="notification-dropdown-item-wrapper"
              >
                <NotificationItem 
                  notification={notification}
                  compact={true}
                  showActions={false}
                />
              </div>
            ))}

            {unreadCount > 5 && (
              <div className="notification-dropdown-more">
                <Link 
                  to="/notifications" 
                  onClick={onClose}
                  className="notification-dropdown-more-link"
                >
                  Ver {unreadCount - 5} más →
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="notification-dropdown-empty">
            <Check size={48} className="notification-dropdown-empty-icon" />
            <p className="notification-dropdown-empty-text">
              No tienes notificaciones sin leer
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="notification-dropdown-footer">
        <Link 
          to="/notifications" 
          onClick={onClose}
          className="notification-dropdown-footer-link"
        >
          Ver todas las notificaciones
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
