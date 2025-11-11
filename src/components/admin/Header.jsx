import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationIcon } from '../notifications';
import {
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import './Header.css';

/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          HEADER PREMIUM - BLACK & WHITE                      ║
 * ║          Diseño Ultra Moderno con CSS Puro                   ║
 * ╚══════════════════════════════════════════════════════════════╝
 */
const Header = ({ user }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const dropdownRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Detectar scroll para efecto de sombra
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Cerrar dropdown con ESC
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && dropdownOpen) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [dropdownOpen]);

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

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const getUserInitials = () => {
    const username = user?.username || 'Admin';
    return username.charAt(0).toUpperCase();
  };

  return (
    <header className={`header-premium ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-premium-container">
        {/* Logo & Brand */}
        <div className="header-brand">
          <div className="header-logo" aria-label="SmartSales Logo">
            S
          </div>
          <div>
            <h1 className="header-title">SmartSales</h1>
            <p className="header-subtitle">Admin Panel</p>
          </div>
        </div>

        {/* Barra de Búsqueda (Opcional - descomenta si la necesitas) */}
        {/* <div className="header-search">
          <MagnifyingGlassIcon className="header-search-icon" />
          <input
            type="search"
            placeholder="Buscar productos, órdenes, usuarios..."
            className="header-search-input"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            aria-label="Buscar"
          />
        </div> */}

        {/* Acciones del Header */}
        <div className="header-actions">
          {/* Notificaciones */}
          <NotificationIcon />

          {/* Divider */}
          <div className="header-divider" aria-hidden="true"></div>

          {/* Perfil de Usuario */}
          <div className="header-profile" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className={`header-profile-btn ${dropdownOpen ? 'active' : ''}`}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              aria-label="Menú de usuario"
            >
              {/* Avatar */}
              <div className="header-avatar">
                {getUserInitials()}
                <span className="header-avatar-status" aria-label="En línea"></span>
              </div>

              {/* Info del Usuario (oculto en móvil) */}
              <div className="header-profile-info">
                <p className="header-profile-name">{user?.username || 'Admin'}</p>
                <p className="header-profile-role">{user?.role?.toLowerCase() || 'administrator'}</p>
              </div>

              {/* Chevron */}
              <ChevronDownIcon className="header-profile-chevron" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="header-profile-dropdown">
                {/* Header del Dropdown */}
                <div className="header-profile-dropdown-header">
                  <div className="header-profile-dropdown-user">
                    <div className="header-profile-dropdown-avatar">
                      {getUserInitials()}
                    </div>
                    <div className="header-profile-dropdown-info">
                      <p className="header-profile-dropdown-name">
                        {user?.username || 'Admin'}
                      </p>
                      <p className="header-profile-dropdown-email">
                        {user?.email || 'admin@smartsales.com'}
                      </p>
                    </div>
                  </div>
                  <span className="header-profile-status-badge">En línea</span>
                </div>

                {/* Menu Items */}
                <div className="header-profile-dropdown-menu">
                  <button
                    onClick={handleProfile}
                    className="header-profile-menu-item"
                  >
                    <UserCircleIcon />
                    <span>Mi Perfil</span>
                  </button>

                  <button
                    onClick={handleSettings}
                    className="header-profile-menu-item"
                  >
                    <Cog6ToothIcon />
                    <span>Configuración</span>
                  </button>

                  <div className="header-profile-menu-divider"></div>

                  <button
                    onClick={handleLogout}
                    className="header-profile-menu-item logout"
                  >
                    <ArrowRightOnRectangleIcon />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
