import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import './Profile.css';
import './pages.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        password: '',
      });
    }
  }, [user]);

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
      newErrors.username = 'Usuario es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess(false);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
      }

      await updateProfile(updateData);
      setSuccess(true);
      setIsEditing(false);
      setFormData((prev) => ({ ...prev, password: '' }));

      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      if (error.username) {
        setErrors((prev) => ({ ...prev, username: error.username[0] }));
      }
      if (error.email) {
        setErrors((prev) => ({ ...prev, email: error.email[0] }));
      }
      if (error.password) {
        setErrors((prev) => ({ ...prev, password: error.password[0] }));
      }
      setApiError(error.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        password: '',
      });
    }
    setErrors({});
    setApiError('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-dark-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-dark-200 rounded w-32 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-dark-900 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-semibold text-dark-900">Ventas inteligentes 365</span>
            </Link>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">
        {/* Profile Hero Section */}
        <div className="profile-hero">
          <div className="profile-avatar-section">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                {user.first_name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
              </div>
            </div>

            <div className="profile-info-header">
              <div className="profile-name">
                {user.first_name && user.last_name
                  ? `${user.first_name} ${user.last_name}`
                  : user.username}
                <span className="profile-badge">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Miembro Verificado
                </span>
              </div>
              <div className="profile-username">@{user.username}</div>
              <div className="profile-meta">
                <div className="profile-meta-item">
                  <span className="profile-meta-label">Miembro desde</span>
                  <span className="profile-meta-value">Enero 2025</span>
                </div>
                <div className="profile-meta-item">
                  <span className="profile-meta-label">Última actividad</span>
                  <span className="profile-meta-value">Hoy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            Información Personal
          </button>
          <button
            className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Seguridad
          </button>
          <button
            className={`profile-tab ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferencias
          </button>
        </div>

        {/* Alerts */}
        {apiError && (
          <Alert type="error" onClose={() => setApiError('')}>
            {apiError}
          </Alert>
        )}

        {success && (
          <Alert type="success">
            ¡Perfil actualizado exitosamente!
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link to="/shop" className="profile-quick-action">
            <div className="profile-quick-action-icon bg-blue-100 text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-dark-900">Explorar Productos</h4>
              <p className="text-sm text-dark-600">Ver catálogo completo</p>
            </div>
          </Link>

          <Link to="/my-orders" className="profile-quick-action">
            <div className="profile-quick-action-icon bg-green-100 text-green-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-dark-900">Mis Compras</h4>
              <p className="text-sm text-dark-600">Ver historial de órdenes</p>
            </div>
          </Link>

          <Link to="/cart" className="profile-quick-action">
            <div className="profile-quick-action-icon bg-purple-100 text-purple-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-dark-900">Mi Carrito</h4>
              <p className="text-sm text-dark-600">Ver productos guardados</p>
            </div>
          </Link>
        </div>

        {/* Tab Content - Personal Information */}
        {activeTab === 'personal' && (
          <div>
            <div className="profile-card">
              <div className="profile-card-header">
                <div>
                  <h3 className="profile-card-title">
                    <svg className="profile-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Datos Personales
                  </h3>
                  <p className="profile-card-description">
                    Actualiza tu información personal y cómo te contactamos
                  </p>
                </div>
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </Button>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="profile-info-alert">
                  <svg className="profile-info-alert-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div className="profile-info-alert-text">
                    <strong>Información importante:</strong> Tu nombre y apellido se establecieron al registrarte y no pueden modificarse. Puedes actualizar tu nombre de usuario y correo electrónico.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Input
                      label="Nombre"
                      name="first_name"
                      type="text"
                      value={formData.first_name}
                      onChange={handleChange}
                      disabled={true}
                    />
                    <p className="profile-form-help">Este campo no se puede editar</p>
                  </div>

                  <div>
                    <Input
                      label="Apellido"
                      name="last_name"
                      type="text"
                      value={formData.last_name}
                      onChange={handleChange}
                      disabled={true}
                    />
                    <p className="profile-form-help">Este campo no se puede editar</p>
                  </div>
                </div>

                <div className="mb-6">
                  <Input
                    label="Nombre de Usuario"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    error={errors.username}
                    disabled={!isEditing}
                  />
                  <p className="profile-form-help">Tu nombre de usuario único en la plataforma</p>
                </div>

                <div className="mb-6">
                  <Input
                    label="Correo Electrónico"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    disabled={!isEditing}
                  />
                  <p className="profile-form-help">Usaremos este correo para enviarte notificaciones importantes</p>
                </div>

                {isEditing && (
                  <div className="profile-actions">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      loading={loading}
                      className="flex-1"
                    >
                      Guardar Cambios
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handleCancel}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Tab Content - Security */}
        {activeTab === 'security' && (
          <div>
            <div className="profile-card">
              <div className="profile-card-header">
                <div>
                  <h3 className="profile-card-title">
                    <svg className="profile-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Contraseña y Seguridad
                  </h3>
                  <p className="profile-card-description">
                    Mantén tu cuenta segura actualizando tu contraseña regularmente
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <Input
                    label="Nueva Contraseña"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    placeholder="Mínimo 8 caracteres"
                  />
                  <p className="profile-form-help">
                    Usa al menos 8 caracteres con una combinación de letras, números y símbolos
                  </p>
                </div>

                <div className="profile-info-alert">
                  <svg className="profile-info-alert-icon" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <div className="profile-info-alert-text">
                    <strong>Consejo de seguridad:</strong> Nunca compartas tu contraseña con nadie. Te recomendamos cambiarla cada 90 días.
                  </div>
                </div>

                <div className="profile-actions">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                  >
                    Actualizar Contraseña
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab Content - Preferences */}
        {activeTab === 'preferences' && (
          <div>
            <div className="profile-card">
              <div className="profile-card-header">
                <div>
                  <h3 className="profile-card-title">
                    <svg className="profile-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Preferencias de Cuenta
                  </h3>
                  <p className="profile-card-description">
                    Personaliza tu experiencia en la plataforma
                  </p>
                </div>
              </div>

              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-dark-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
                <h4 className="text-lg font-semibold text-dark-900 mb-2">Próximamente</h4>
                <p className="text-dark-600">
                  Estamos trabajando en nuevas opciones de preferencias para ti
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;