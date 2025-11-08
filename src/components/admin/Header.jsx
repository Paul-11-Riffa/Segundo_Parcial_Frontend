import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BellIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import './Header.css';

/**
 * Header - Barra superior del panel de administración
 * Diseño profesional con CSS puro (sin Tailwind)
 */
const Header = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Notificaciones simuladas (reemplazar con data real del backend)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Nueva venta registrada',
      message: 'Se ha registrado una nueva venta por $450.00',
      time: 'Hace 5 min',
      unread: true,
      type: 'success'
    },
    {
      id: 2,
      title: 'Alerta de stock bajo',
      message: 'El producto "Laptop HP" tiene stock bajo',
      time: 'Hace 15 min',
      unread: true,
      type: 'warning'
    },
    {
      id: 3,
      title: 'Reporte generado',
      message: 'El reporte mensual está listo para descargar',
      time: 'Hace 1 hora',
      unread: false,
      type: 'info'
    }
  ]);

  const unreadCount = notifications.filter(n => n.unread).length;

  // Cerrar dropdowns al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    setDropdownOpen(false);
    navigate('/profile');
  };

  const handleSettings = () => {
    setDropdownOpen(false);
    // Navegar a configuración o abrir modal de configuración
    navigate('/admin/settings');
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, unread: false } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, unread: false }))
    );
  };

  const getNotificationIcon = (type) => {
    // Retornamos componentes de Heroicons en lugar de emojis para mejor consistencia
    const iconClasses = "h-4 w-4";
    switch (type) {
      case 'success':
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        );
      case 'info':
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClasses} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
          </svg>
        );
    }
  };

  return (
    <header className="header-container">
      {/* Left Section - Title */}
      <div>
        <h1 className="header-title">SmartSales</h1>
      </div>

      {/* Right Section - Actions */}
      <div className="header-actions">
        {/* Notification Bell */}
        <div style={{ position: 'relative' }} ref={notificationsRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="notification-button"
            title="Notificaciones"
          >
            <BellIcon />
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown de Notificaciones */}
          {notificationsOpen && (
            <div className="notifications-dropdown">
              {/* Header */}
              <div className="notifications-header">
                <div className="notifications-header-content">
                  <div>
                    <h3 className="notifications-title">Notificaciones</h3>
                    {unreadCount > 0 && (
                      <p className="notifications-subtitle">
                        Tienes {unreadCount} {unreadCount === 1 ? 'notificación nueva' : 'notificaciones nuevas'}
                      </p>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="mark-all-read-button">
                      Marcar todas leídas
                    </button>
                  )}
                </div>
              </div>

              {/* Lista de notificaciones */}
              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="notifications-empty">
                    <div className="notifications-empty-icon">
                      <BellIcon />
                    </div>
                    <p className="notifications-empty-title">No hay notificaciones</p>
                    <p className="notifications-empty-subtitle">Te avisaremos cuando tengas algo nuevo</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => markAsRead(notification.id)}
                      className={`notification-item ${notification.unread ? 'unread' : ''}`}
                    >
                      <div className={`notification-icon ${notification.type}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="notification-content">
                        <div className="notification-header">
                          <h4 className="notification-title">{notification.title}</h4>
                          {notification.unread && <span className="notification-unread-dot"></span>}
                        </div>
                        <p className="notification-message">{notification.message}</p>
                        <p className="notification-time">{notification.time}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="notifications-footer">
                  <button
                    onClick={() => {
                      setNotificationsOpen(false);
                      navigate('/admin/notifications');
                    }}
                    className="view-all-button"
                  >
                    <span>Ver todas las notificaciones</span>
                    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="header-divider"></div>

        {/* User Profile */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="profile-button"
          >
            <div className="profile-info">
              <p className="profile-name">{user?.username || 'Admin'}</p>
              <p className="profile-role">{user?.role?.toLowerCase() || 'Administrator'}</p>
            </div>

            <div className="profile-avatar">
              {(user?.username || 'A')[0].toUpperCase()}
              <span className="profile-status"></span>
            </div>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="profile-dropdown">
              {/* User Info Header */}
              <div className="profile-dropdown-header">
                <div className="profile-dropdown-user">
                  <div className="profile-dropdown-avatar">
                    {(user?.username || 'A')[0].toUpperCase()}
                  </div>
                  <div className="profile-dropdown-info">
                    <p className="profile-dropdown-name">{user?.username || 'Admin'}</p>
                    <p className="profile-dropdown-email">{user?.email || 'admin@smartsales.com'}</p>
                  </div>
                </div>
                <span className="profile-status-badge">En línea</span>
              </div>

              {/* Menu Items */}
              <div className="profile-dropdown-menu">
                <button onClick={handleProfile} className="profile-menu-item">
                  <UserCircleIcon />
                  <span>Mi Perfil</span>
                </button>

                <button onClick={handleSettings} className="profile-menu-item">
                  <Cog6ToothIcon />
                  <span>Configuración</span>
                </button>

                <div className="profile-menu-divider"></div>

                <button onClick={handleLogout} className="profile-menu-item logout">
                  <ArrowRightOnRectangleIcon />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
