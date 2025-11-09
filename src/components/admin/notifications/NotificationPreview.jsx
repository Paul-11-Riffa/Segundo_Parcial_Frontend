import PropTypes from 'prop-types';
import './NotificationPreview.css';

/**
 * Vista previa de cómo se verá la notificación en el navegador del usuario
 * Se actualiza en tiempo real mientras el admin escribe
 */
const NotificationPreview = ({ title, body, imageUrl }) => {
  return (
    <div className="notification-preview-container">
      <h3 className="notification-preview-title">📱 Vista Previa</h3>
      
      <div className="notification-preview-card">
        {/* Simulación de notificación del navegador */}
        <div className="notification-preview-header">
          {/* Ícono de la app */}
          <div className="notification-preview-icon">
            <span className="notification-preview-icon-emoji">🔔</span>
          </div>
          
          {/* Contenido de la notificación */}
          <div className="notification-preview-content">
            <p className="notification-preview-heading">
              {title || 'Título de la notificación'}
            </p>
            <p className="notification-preview-body">
              {body || 'Este es el mensaje que verá el usuario en su notificación push'}
            </p>
            
            {/* Imagen (si existe) */}
            {imageUrl && (
              <div className="notification-preview-image-container">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="notification-preview-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Timestamp */}
            <p className="notification-preview-time">Hace 0 segundos</p>
          </div>
        </div>
      </div>
      
      {/* Hint */}
      <p className="notification-preview-hint">
        💡 Esta es una simulación de cómo se verá la notificación en el navegador del usuario
      </p>
    </div>
  );
};

NotificationPreview.propTypes = {
  title: PropTypes.string,
  body: PropTypes.string,
  imageUrl: PropTypes.string,
};

NotificationPreview.defaultProps = {
  title: '',
  body: '',
  imageUrl: null,
};

export default NotificationPreview;
