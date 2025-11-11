import { useState, useRef, useEffect } from 'react';
import { Bell, BellRing, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import './NotificationIcon.css';

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║     NOTIFICATION ICON PREMIUM - BLACK & WHITE                ║
 * ║     Diseño Ultra Moderno con Microinteracciones              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
const NotificationIcon = () => {
  const { unreadCount, notifications, isInitialized, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
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

  // Cerrar con ESC
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDropdownOpen]);

  const handleIconClick = () => {
    setIsDropdownOpen(prev => !prev);
    setHasNewNotification(false);
  };

  const handleNotificationClick = (notification) => {
    if (notification.read === false) {
      markAsRead(notification.id);
    }
    // Aquí puedes agregar navegación o acciones adicionales
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // diferencia en segundos

    if (diff < 60) return 'Ahora mismo';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
    if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} días`;
    
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  if (!isInitialized) {
    return null;
  }

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={iconRef}
        className="icon-button"
        onClick={handleIconClick}
        aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`}
      >
        {unreadCount > 0 ? (
          <BellRing size={20} strokeWidth={2} />
        ) : (
          <Bell size={20} strokeWidth={2} />
        )}
        
        {unreadCount > 0 && (
          <span className="icon-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {isDropdownOpen && (
        <div 
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '380px',
            maxHeight: '500px',
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.08)',
            overflow: 'hidden',
            zIndex: 1000
          }}
        >
          {/* Header del dropdown */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px'
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#111827', flex: 1 }}>
              Notificaciones
            </h3>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#eff6ff'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Marcar todas
                </button>
              )}
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate('/notifications/preferences');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px'
                }}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#f3f4f6';
                  e.target.style.color = '#111827';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#6b7280';
                }}
                aria-label="Configuración de notificaciones"
                title="Configuración de notificaciones"
              >
                <Settings size={18} strokeWidth={2} />
              </button>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <Bell size={40} strokeWidth={1.5} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontSize: '14px' }}>No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: '12px 20px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    backgroundColor: notification.read ? 'white' : '#f0f9ff',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'start'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = notification.read ? '#f9fafb' : '#e0f2fe'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = notification.read ? 'white' : '#f0f9ff'}
                >
                  {!notification.read && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#3b82f6',
                      marginTop: '6px',
                      flexShrink: 0
                    }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: '0 0 4px 0',
                      fontSize: '14px',
                      fontWeight: notification.read ? 400 : 600,
                      color: '#111827',
                      lineHeight: '1.4'
                    }}>
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p style={{
                        margin: '0 0 6px 0',
                        fontSize: '13px',
                        color: '#6b7280',
                        lineHeight: '1.4'
                      }}>
                        {notification.message}
                      </p>
                    )}
                    <p style={{
                      margin: 0,
                      fontSize: '12px',
                      color: '#9ca3af'
                    }}>
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer con link a ver todas */}
          {notifications.length > 0 && (
            <div style={{
              padding: '12px 20px',
              borderTop: '1px solid #e5e7eb',
              textAlign: 'center'
            }}>
              <a
                href="/notifications"
                style={{
                  color: '#3b82f6',
                  fontSize: '13px',
                  fontWeight: 500,
                  textDecoration: 'none'
                }}
                onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                onMouseOut={(e) => e.target.style.textDecoration = 'none'}
              >
                Ver todas las notificaciones
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
