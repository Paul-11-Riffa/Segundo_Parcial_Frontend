import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationIcon } from '../notifications';
import {
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
  const dropdownRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
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
    navigate('/notifications/preferences');
  };

  return (
    <header className="header-container">
      {/* Left Section - Title */}
      <div>
        <h1 className="header-title">SmartSales</h1>
      </div>

      {/* Right Section - Actions */}
      <div className="header-actions">
        {/* Componente de Notificaciones Real con Firebase */}
        <NotificationIcon />

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
