import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import './pages.css';

const ForgotPassword = () => {
  const { requestPasswordReset } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resetData, setResetData] = useState(null); // Para capturar respuesta del backend

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email es requerido');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email inválido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateEmail()) return;

    setLoading(true);

    try {
      const result = await requestPasswordReset(email);
      setResetData(result); // Capturar respuesta del backend
      setSuccess(true);
      setEmail('');
    } catch (err) {
      setSuccess(true);
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
          {!success ? (
            <>
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-dark-900 mb-2">¿Olvidaste tu contraseña?</h2>
                <p className="text-dark-600">
                  No te preocupes, te enviaremos instrucciones para recuperarla
                </p>
              </div>

              {error && (
                <Alert type="error" onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="tu@email.com"
                  icon={(props) => (
                    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  className="w-full"
                >
                  Enviar instrucciones
                </Button>
              </form>

              <div className="mt-8 text-center">
                <Link 
                  to="/login" 
                  className="text-dark-600 hover:text-dark-900 font-medium transition-colors inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver a iniciar sesión
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-dark-900 mb-2">¡Solicitud enviada!</h3>
              <p className="text-dark-600 mb-4">
                Si existe una cuenta con ese email, recibirás un link de recuperación en tu correo.
              </p>
              <p className="text-sm text-dark-500 mb-8">
                Por favor revisa tu bandeja de entrada (y spam) y sigue las instrucciones.
              </p>

              {/* Mostrar URL en modo desarrollo */}
              {resetData && resetData.reset_url && (
                <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg text-left">
                  <p className="text-sm font-semibold text-amber-900 mb-2">
                    🔧 Modo Desarrollo - Link de Reset:
                  </p>
                  <a 
                    href={resetData.reset_url}
                    className="text-sm text-blue-600 hover:text-blue-800 underline break-all font-mono"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {resetData.reset_url}
                  </a>
                  <p className="text-xs text-amber-700 mt-2">
                    ⚠️ El envío de emails no está configurado. Usa este link para resetear tu contraseña.
                  </p>
                </div>
              )}

              <Link to="/login">
                <Button variant="primary" size="lg" className="w-full">
                  Volver a iniciar sesión
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;