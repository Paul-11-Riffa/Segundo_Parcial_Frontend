import { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay un usuario autenticado al cargar
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);

          // Intentar obtener el perfil actualizado
          try {
            const profile = await authService.getProfile();
            setUser(profile);
          } catch (err) {
            // Si falla, mantener el usuario del localStorage
            console.error('Error al obtener perfil:', err);
          }
        }
      } catch (err) {
        console.error('Error al inicializar autenticación:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Función de registro
  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const data = await authService.register(userData);
      setUser({
        id: data.user_id,
        email: data.email,
        username: data.username,
      });
      return data;
    } catch (err) {
      setError(err.message || 'Error en el registro');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función de login
  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);
      const data = await authService.login(username, password);
      setUser({
        id: data.user_id,
        email: data.email,
        username: data.username,
      });
      return data;
    } catch (err) {
      setError(err.message || 'Error en el login');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función de logout
  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar perfil
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      setLoading(true);
      const updatedUser = await authService.updateProfile(profileData);
      setUser(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message || 'Error al actualizar perfil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para solicitar reset de contraseña
  const requestPasswordReset = async (email) => {
    try {
      setError(null);
      setLoading(true);
      await authService.requestPasswordReset(email);
    } catch (err) {
      setError(err.message || 'Error al solicitar reset de contraseña');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para confirmar reset de contraseña
  const confirmPasswordReset = async (uidb64, token, password) => {
    try {
      setError(null);
      setLoading(true);
      await authService.confirmPasswordReset(uidb64, token, password);
    } catch (err) {
      setError(err.message || 'Error al resetear contraseña');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    requestPasswordReset,
    confirmPasswordReset,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;
