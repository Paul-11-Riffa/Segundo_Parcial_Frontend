import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Alert from '../components/ui/Alert';
import './pages.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Usuario o email es requerido';
    }

    if (!formData.password) {
      newErrors.password = 'Contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const userData = await login(formData.username, formData.password);

      // Redirigir según el rol del usuario (backend devuelve "ADMIN" o "CLIENT")
      if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/home');
      }
    } catch (error) {
      console.error('Error en login:', error);
      if (error.non_field_errors) {
        setApiError(error.non_field_errors[0]);
      } else if (error.detail) {
        setApiError(error.detail);
      } else if (error.message) {
        setApiError(error.message);
      } else {
        setApiError('Usuario o contraseña incorrectos');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <Link to="/" className="flex items-center justify-center space-x-2 mb-12 group">
          <div className="w-10 h-10 bg-dark-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="text-white font-bold">S</span>
          </div>
          <span className="text-2xl font-semibold text-dark-900">SmartSales365</span>
        </Link>

        <div className="animate-fade-in">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-dark-900 mb-2">Bienvenido</h2>
            <p className="text-dark-600">Ingresa a tu cuenta para continuar</p>
          </div>

          {apiError && (
            <Alert type="error" onClose={() => setApiError('')}>
              {apiError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Usuario o Email"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              placeholder="tu@email.com"
              icon={(props) => (
                <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            />

            <Input
              label="Contraseña"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              icon={(props) => (
                <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              )}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="rounded border-dark-300 text-dark-900 focus:ring-dark-900 transition-all" 
                />
                <span className="ml-2 text-dark-600 group-hover:text-dark-900 transition-colors">Recordarme</span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-dark-900 hover:text-dark-700 font-medium transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-dark-600">
              ¿No tienes cuenta?{' '}
              <Link 
                to="/register" 
                className="text-dark-900 hover:text-dark-700 font-semibold transition-colors"
              >
                Regístrate gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
