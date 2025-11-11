import { useState, useRef, useEffect } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import './NotificationIcon.css';

/**
 * Ícono de notificaciones con badge y dropdown
 * Se integra en el navbar/header de la aplicación
 */
const NotificationIcon = () => {
  const { unreadCount, notifications, isInitialized } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const dropdownRef = useRef(null);
  const iconRef = useRef(null);
  const prevUnreadCountRef = useRef(unreadCount);

  // Detectar nuevas notificaciones para animación
  useEffect(() => {
    if (unreadCount > prevUnreadCountRef.current) {
      setHasNewNotification(true);
      
      // Quitar animación después de 3 segundos
      const timer = setTimeout(() => {
        setHasNewNotification(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
    
    prevUnreadCountRef.current = unreadCount;
  }, [unreadCount]);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        iconRef.current &&
        !iconRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Toggle del dropdown
  const handleIconClick = () => {
    setIsDropdownOpen(prev => !prev);
    setHasNewNotification(false); // Quitar animación al abrir
  };

  // Cerrar dropdown
  const handleCloseDropdown = () => {
    setIsDropdownOpen(false);
  };

  if (!isInitialized) {
    return null; // No mostrar hasta que esté inicializado
  }

  return (
    <div className="notification-icon-container">
      <button
        ref={iconRef}
        className={`notification-icon-button ${hasNewNotification ? 'notification-icon-pulse' : ''} ${isDropdownOpen ? 'notification-icon-active' : ''}`}
        onClick={handleIconClick}
        aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`}
        title={`${unreadCount} notificaciones sin leer`}
      >
        {unreadCount > 0 ? (
          <BellRing className="notification-icon" size={16} strokeWidth={2} />
        ) : (
          <Bell className="notification-icon" size={16} strokeWidth={2} />
        )}
        
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isDropdownOpen && (
        <div ref={dropdownRef}>
          <NotificationDropdown 
            notifications={notifications}
            onClose={handleCloseDropdown}
          />
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
