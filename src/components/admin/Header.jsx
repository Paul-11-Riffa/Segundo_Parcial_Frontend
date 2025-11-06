import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

/**
 * Header - Barra superior del panel de administración
 * Iconos limpios y profesionales
 */
const Header = ({ user, onMenuClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Estado simulado de notificaciones (reemplazar con data real)
  const [hasNotifications, setHasNotifications] = useState(true);
  const [notificationCount, setNotificationCount] = useState(3);

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

  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-30">
      {/* Left Section - Title */}
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-gray-800">
          Administration Panel
        </h1>
      </div>

      {/* Right Section - Icon Buttons */}
      <div className="flex items-center space-x-2">

        {/* Notification Icon Button */}
        <div className="relative">
          <button
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            title="Notifications"
          >
            <BellIcon className="h-6 w-6" />

            {/* Badge - Solo si hay notificaciones */}
            {hasNotifications && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            {/* Username - Desktop only */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">
                {user?.username || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role?.toLowerCase() || 'Administrator'}
              </p>
            </div>

            {/* Avatar Circle */}
            <div className="relative">
              {/* Circle con inicial */}
              <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold text-sm">
                {(user?.username || 'A')[0].toUpperCase()}
              </div>

              {/* Status indicator - Online */}
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{user?.username || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'admin@smartsales.com'}</p>
              </div>

              {/* Profile Settings */}
              <button
                onClick={handleProfile}
                className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                <Cog6ToothIcon className="h-5 w-5 text-gray-500" />
                <span>Profile Settings</span>
              </button>

              {/* Divider */}
              <div className="border-t border-gray-100 my-1"></div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-150"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
