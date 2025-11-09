import { useState, useEffect } from 'react';
import NotificationForm from '../../../components/admin/notifications/NotificationForm';
import { getActiveUsers, sendCustomNotification } from '../../../services/notificationApiService';
import './SendNotification.css';

/**
 * SendNotification - Página principal para enviar notificaciones personalizadas
 * 
 * Funcionalidades:
 * - Carga automática de usuarios activos
 * - Integración con NotificationForm
 * - Manejo de envío con feedback visual
 * - Mensajes de éxito/error
 * - Reseteo del formulario después del envío exitoso
 */
function SendNotification() {
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string, details: object }

  // Cargar usuarios activos al montar el componente
  useEffect(() => {
    loadUsers();
  }, []);

  /**
   * Carga la lista de usuarios activos desde el backend
   */
  const loadUsers = async () => {
    setIsLoadingUsers(true);
    setFeedback(null);
    try {
      const data = await getActiveUsers();
      console.log('📦 Datos recibidos:', data);
      
      // La función ya retorna un array directamente
      setUsers(Array.isArray(data) ? data : []);
      
      if (!data || data.length === 0) {
        setFeedback({
          type: 'error',
          message: 'No hay usuarios disponibles en el sistema',
          details: { info: 'Verifica que existan usuarios activos en la base de datos' }
        });
      }
    } catch (error) {
      console.error('❌ Error al cargar usuarios:', error);
      setFeedback({
        type: 'error',
        message: 'No se pudieron cargar los usuarios',
        details: {
          error: error.message,
          status: error.response?.status,
          data: error.response?.data
        }
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

  /**
   * Maneja el envío del formulario
   * @param {Object} formData - Datos del formulario (user_ids, title, body, notification_type, image_url)
   */
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await sendCustomNotification(formData);
      
      // Mostrar feedback de éxito con detalles
      setFeedback({
        type: 'success',
        message: '¡Notificación enviada exitosamente!',
        details: response
      });

      // Auto-cerrar el mensaje de éxito después de 5 segundos
      setTimeout(() => {
        setFeedback(null);
      }, 5000);

    } catch (error) {
      console.error('Error al enviar notificación:', error);
      setFeedback({
        type: 'error',
        message: error.message || 'Error al enviar la notificación',
        details: error
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Cierra el mensaje de feedback
   */
  const closeFeedback = () => {
    setFeedback(null);
  };

  return (
    <div className="send-notification-page">
      {/* Header */}
      <div className="send-notification-header">
        <div className="send-notification-header-content">
          <h1 className="send-notification-title">
            <span className="send-notification-title-icon">📢</span>
            Enviar Notificación Push
          </h1>
          <p className="send-notification-subtitle">
            Envía notificaciones personalizadas a usuarios específicos o a todos los administradores
          </p>
        </div>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <div className={`send-notification-feedback send-notification-feedback-${feedback.type}`}>
          <div className="send-notification-feedback-content">
            <div className="send-notification-feedback-header">
              <span className="send-notification-feedback-icon">
                {feedback.type === 'success' ? '✅' : '❌'}
              </span>
              <h3 className="send-notification-feedback-title">
                {feedback.message}
              </h3>
              <button
                onClick={closeFeedback}
                className="send-notification-feedback-close"
                aria-label="Cerrar mensaje"
              >
                ✕
              </button>
            </div>

            {/* Detalles del envío exitoso */}
            {feedback.type === 'success' && feedback.details && (
              <div className="send-notification-feedback-details">
                <div className="send-notification-feedback-stats">
                  <div className="send-notification-feedback-stat">
                    <span className="send-notification-feedback-stat-label">Usuarios:</span>
                    <span className="send-notification-feedback-stat-value">
                      {feedback.details.successful_users || 0} / {feedback.details.total_users || 0}
                    </span>
                  </div>
                  <div className="send-notification-feedback-stat">
                    <span className="send-notification-feedback-stat-label">Dispositivos:</span>
                    <span className="send-notification-feedback-stat-value">
                      {feedback.details.successful_sends || 0} / {feedback.details.total_devices || 0}
                    </span>
                  </div>
                </div>

                {feedback.details.failed_users > 0 && (
                  <div className="send-notification-feedback-warning">
                    ⚠️ {feedback.details.failed_users} usuario(s) no recibieron la notificación
                  </div>
                )}
              </div>
            )}

            {/* Detalles del error */}
            {feedback.type === 'error' && feedback.details && (
              <div className="send-notification-feedback-error-details">
                {feedback.details.error && (
                  <p><strong>Error:</strong> {feedback.details.error}</p>
                )}
                {feedback.details.status && (
                  <p><strong>Estado HTTP:</strong> {feedback.details.status}</p>
                )}
                {feedback.details.data && (
                  <pre style={{ fontSize: '12px', overflow: 'auto', maxHeight: '150px' }}>
                    {JSON.stringify(feedback.details.data, null, 2)}
                  </pre>
                )}
                {feedback.details.info && (
                  <p><strong>Info:</strong> {feedback.details.info}</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="send-notification-content">
        <NotificationForm
          users={users}
          isLoadingUsers={isLoadingUsers}
          onSubmit={handleSubmit}
          loading={isSubmitting}
        />
      </div>

      {/* Footer Info */}
      <div className="send-notification-footer">
        <div className="send-notification-footer-info">
          <span className="send-notification-footer-icon">💡</span>
          <p className="send-notification-footer-text">
            Las notificaciones se enviarán a todos los dispositivos registrados de los usuarios seleccionados.
            Los usuarios deben tener activadas las notificaciones en sus dispositivos para recibirlas.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SendNotification;
