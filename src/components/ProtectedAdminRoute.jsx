import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rutas que requieren rol de ADMIN
 *
 * Validaciones:
 * 1. Usuario debe estar autenticado
 * 2. Usuario debe tener rol de administrador (isAdmin = true o role = "ADMIN")
 *
 * Si no cumple, redirige a:
 * - /login si no está autenticado
 * - /access-denied si no es admin
 */
const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Mostrar loader mientras verifica autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario no es admin, redirigir a página de acceso denegado
  if (!user.isAdmin) {
    return <Navigate to="/access-denied" replace />;
  }

  // Si todas las validaciones pasan, mostrar el contenido protegido
  return children;
};

export default ProtectedAdminRoute;
