import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './pages.css';

/**
 * Página de Acceso Denegado
 * Se muestra cuando un usuario sin permisos de admin intenta acceder a rutas protegidas
 */
const AccessDenied = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Icono de acceso denegado */}
        <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-6">
          <svg 
            className="w-12 h-12 text-red-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>

        {/* Título */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Acceso Denegado
        </h1>

        {/* Mensaje */}
        <p className="text-lg text-gray-600 mb-2">
          No tienes permisos para acceder a esta sección
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Esta página está restringida solo para administradores del sistema.
        </p>

        {/* Info del usuario */}
        {user && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8 text-left">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Usuario actual:</span> {user.username || user.email}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Rol:</span> {user.role || 'Usuario'}
            </p>
          </div>
        )}

        {/* Botones de acción */}
        <div className="space-y-3">
          <Link 
            to="/home" 
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Volver al Inicio
          </Link>
          
          <Link 
            to="/profile" 
            className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Ver Mi Perfil
          </Link>
        </div>

        {/* Contacto con admin */}
        <p className="text-xs text-gray-500 mt-8">
          Si crees que esto es un error, contacta con el administrador del sistema.
        </p>
      </div>
    </div>
  );
};

export default AccessDenied;
