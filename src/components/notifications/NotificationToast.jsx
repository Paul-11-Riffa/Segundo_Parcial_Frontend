import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getNotificationIcon, getPriorityColor } from '../../utils/notificationHelpers';
import { useNavigate } from 'react-router-dom';
import { getNavigationRoute } from '../../utils/notificationHelpers';
import { useNotifications } from '../../context/NotificationContext';
import PropTypes from 'prop-types';
import './NotificationToast.css';

/**
 * Toast para mostrar notificaciones en foreground
 * Aparece cuando llega una nueva notificación mientras el usuario está en la app
 */
const NotificationToast = ({ notification, onClose, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const navigate = useNavigate();

  const { title, body, type, priority } = notification;
  const iconEmoji = getNotificationIcon(type);
  const priorityColor = getPriorityColor(priority);

  // Animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  // Auto-close después de la duración especificada
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  // Handler para cerrar con animación
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 300); // Duración de la animación de salida
  };

  // Handler para click en el toast (navegar)
  const handleClick = () => {
    const route = getNavigationRoute(notification);
    if (route) {
      navigate(route);
      handleClose();
    }
  };

  return (
    <div 
      className={`notification-toast ${isVisible && !isExiting ? 'notification-toast-visible' : ''} ${isExiting ? 'notification-toast-exit' : ''}`}
      onClick={handleClick}
      role="alert"
      aria-live="polite"
    >
      <div 
        className="notification-toast-icon"
        style={{ backgroundColor: `${priorityColor}20`, color: priorityColor }}
      >
        <span style={{ fontSize: '24px' }}>{iconEmoji}</span>
      </div>

      <div className="notification-toast-content">
        <h4 className="notification-toast-title">{title}</h4>
        <p className="notification-toast-body">{body}</p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="notification-toast-close"
        aria-label="Cerrar"
      >
        <X size={18} />
      </button>

      {/* Barra de progreso para el auto-close */}
      {duration > 0 && (
        <div 
          className="notification-toast-progress"
          style={{ 
            backgroundColor: priorityColor,
            animationDuration: `${duration}ms`
          }}
        />
      )}
    </div>
  );
};

NotificationToast.propTypes = {
  notification: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    body: PropTypes.string,
    type: PropTypes.string,
    priority: PropTypes.string
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  duration: PropTypes.number
};

/**
 * Container para múltiples toasts
 * Maneja el stack de notificaciones conectándose al Context
 */
export const NotificationToastContainer = () => {
  const { recentNotifications, dismissToast } = useNotifications();
  
  // Solo mostrar notificaciones recientes (últimos 5 segundos)
  const toastNotifications = recentNotifications || [];
  
  return (
    <div className="notification-toast-container">
      {toastNotifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onClose={() => dismissToast && dismissToast(notification.id)}
        />
      ))}
    </div>
  );
};

NotificationToastContainer.propTypes = {};

export default NotificationToast;
