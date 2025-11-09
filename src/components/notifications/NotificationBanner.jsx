import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import './NotificationBanner.css';

/**
 * Banner para solicitar permisos de notificaciones
 * Se muestra cuando el usuario aún no ha dado permisos
 */
const NotificationBanner = () => {
  const { permission, requestPermission } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Verificar si el banner debe mostrarse
  useEffect(() => {
    // No mostrar si ya está dismissed en esta sesión
    const dismissed = sessionStorage.getItem('notification-banner-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Mostrar solo si el permiso es 'default' (no respondido)
    if (permission === 'default') {
      // Esperar 2 segundos antes de mostrar (para no ser intrusivo)
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [permission]);

  // Handler para habilitar notificaciones
  const handleEnable = async () => {
    const newPermission = await requestPermission();
    
    if (newPermission === 'granted') {
      setIsVisible(false);
    }
  };

  // Handler para cerrar el banner
  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('notification-banner-dismissed', 'true');
  };

  // No renderizar si está dismissed o no es visible
  if (isDismissed || !isVisible) {
    return null;
  }

  return (
    <div className="notification-banner">
      <div className="notification-banner-content">
        <div className="notification-banner-icon">
          <Bell size={24} />
        </div>

        <div className="notification-banner-text">
          <h3 className="notification-banner-title">
            Habilita las notificaciones
          </h3>
          <p className="notification-banner-description">
            Recibe alertas en tiempo real sobre ventas, stock bajo y reportes importantes
          </p>
        </div>

        <div className="notification-banner-actions">
          <button
            onClick={handleEnable}
            className="notification-banner-btn notification-banner-btn-primary"
          >
            Habilitar
          </button>
          <button
            onClick={handleDismiss}
            className="notification-banner-btn notification-banner-btn-secondary"
          >
            Ahora no
          </button>
        </div>

        <button
          onClick={handleDismiss}
          className="notification-banner-close"
          aria-label="Cerrar"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default NotificationBanner;
