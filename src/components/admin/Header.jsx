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
 */
const Header = ({ user, onMenuClick }) => {
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

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm z-10">
      {/* Left Section - Title */}
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold text-gray-800">
          Administration Panel
        </h1>
      </div>

      {/* Right Section - User Actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button 
            className="relative p-2.5 text-gray-600 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all duration-300 hover:shadow-md group"
            title="Notifications"
          >
            <BellIcon className="h-6 w-6 group-hover:animate-pulse" />
            {/* Badge for unread notifications */}
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 text-[10px] font-bold text-white shadow-lg ring-2 ring-white">
                3
              </span>
            </span>
          </button>
        </div>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 px-2 py-1 rounded-xl hover:bg-gray-50 transition-all duration-300 group"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                {user?.username || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 capitalize flex items-center justify-end">
                <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                {user?.role?.toLowerCase() || 'Administrator'}
              </p>
            </div>
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg ring-4 ring-blue-100 group-hover:ring-blue-200 transition-all duration-300 group-hover:scale-110">
                {(user?.username || 'A')[0].toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
            </div>
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div 
              className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 opacity-0 scale-95 animate-slideDown"
              style={{
                animation: 'slideDown 0.2s ease-out forwards',
              }}
            >
              <style>{`
                @keyframes slideDown {
                  from {
                    opacity: 0;
                    transform: translateY(-10px) scale(0.95);
                  }
                  to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                  }
                }
              `}</style>
              {/* User Info Header */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-bold text-gray-900">{user?.username || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'admin@smartsales.com'}</p>
              </div>
              
              <div className="py-1">
                <button
                  onClick={handleProfile}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-blue-700 transition-all duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600">
                    <Cog6ToothIcon className="h-5 w-5" />
                  </div>
                  <span>Profile Settings</span>
                </button>
              </div>
              
              <hr className="my-1 border-gray-100" />
              
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-600">
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                  </div>
                  <span>Logout</span>
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
