import { useState } from 'react';
import PropTypes from 'prop-types';
import UserSelector from './UserSelector';
import NotificationPreview from './NotificationPreview';
import './NotificationForm.css';

/**
 * Formulario completo para enviar notificaciones push
 * Integra UserSelector y NotificationPreview
 * Incluye validaciones y manejo de errores
 */
const NotificationForm = ({ users, isLoadingUsers, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    user_ids: [],
    title: '',
    body: '',
    notification_type: 'CUSTOM',
    image_url: '',
  });

  const [sendToAll, setSendToAll] = useState(false);
  const [errors, setErrors] = useState({});

  // Tipos de notificación disponibles
  const notificationTypes = [
    { value: 'CUSTOM', label: 'Personalizado', emoji: '✉️' },
    { value: 'SYSTEM', label: 'Sistema', emoji: '⚙️' },
    { value: 'SALE_CREATED', label: 'Venta Creada', emoji: '🛒' },
    { value: 'PRODUCT_CREATED', label: 'Producto Creado', emoji: '📦' },
    { value: 'PRODUCT_LOW_STOCK', label: 'Stock Bajo', emoji: '⚠️' },
    { value: 'REPORT_GENERATED', label: 'Reporte Generado', emoji: '📊' },
    { value: 'ML_PREDICTION', label: 'Predicción ML', emoji: '🤖' },
  ];

  // Validar formulario
  const validate = () => {
    const newErrors = {};

    // Título
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (formData.title.length > 200) {
      newErrors.title = 'El título no puede exceder 200 caracteres';
    }

    // Mensaje
    if (!formData.body.trim()) {
      newErrors.body = 'El mensaje es requerido';
    } else if (formData.body.length < 10) {
      newErrors.body = 'El mensaje debe tener al menos 10 caracteres';
    }

    // Usuarios
    if (!sendToAll && formData.user_ids.length === 0) {
      newErrors.user_ids = 'Selecciona al menos un usuario o marca "Enviar a todos"';
    }

    // URL de imagen
    if (formData.image_url && !isValidUrl(formData.image_url)) {
      newErrors.image_url = 'URL de imagen inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar URL
  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const submitData = {
      ...formData,
      user_ids: sendToAll ? [] : formData.user_ids,
      image_url: formData.image_url || null,
    };

    await onSubmit(submitData);
  };

  // Manejar cambio en campos de texto
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="notification-form">
      {/* SECCIÓN: Destinatarios */}
      <section className="notification-form-section">
        <h2 className="notification-form-section-title">
          <span className="notification-form-section-icon">👥</span>
          Destinatarios
        </h2>

        {/* Checkbox: Enviar a todos */}
        <label className="notification-form-checkbox-label">
          <input
            type="checkbox"
            checked={sendToAll}
            onChange={(e) => {
              setSendToAll(e.target.checked);
              if (e.target.checked) {
                setFormData(prev => ({ ...prev, user_ids: [] }));
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.user_ids;
                  return newErrors;
                });
              }
            }}
            className="notification-form-checkbox"
          />
          <span className="notification-form-checkbox-text">
            Enviar a todos los usuarios
          </span>
        </label>

        {/* Selector de usuarios (solo si no es "enviar a todos") */}
        {!sendToAll && (
          <div className="notification-form-user-selector-wrapper">
            <UserSelector
              users={users}
              selectedUserIds={formData.user_ids}
              onChange={(ids) => handleChange('user_ids', ids)}
              isLoading={isLoadingUsers}
            />
            {errors.user_ids && (
              <p className="notification-form-error">{errors.user_ids}</p>
            )}
          </div>
        )}

        {/* Info: Envío a todos */}
        {sendToAll && (
          <div className="notification-form-info">
            <span className="notification-form-info-icon">ℹ️</span>
            <span>
              La notificación se enviará a <strong>todos los usuarios registrados</strong> (administradores y clientes)
            </span>
          </div>
        )}
      </section>

      {/* SECCIÓN: Contenido */}
      <section className="notification-form-section">
        <h2 className="notification-form-section-title">
          <span className="notification-form-section-icon">📝</span>
          Contenido
        </h2>

        {/* Campo: Título */}
        <div className="notification-form-field">
          <label htmlFor="title" className="notification-form-label">
            Título *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Ej: Bienvenido a SmartSales365"
            maxLength={200}
            className={`notification-form-input ${errors.title ? 'error' : ''}`}
          />
          <div className="notification-form-field-footer">
            {errors.title && (
              <span className="notification-form-error">{errors.title}</span>
            )}
            <span className="notification-form-counter">
              {formData.title.length}/200
            </span>
          </div>
        </div>

        {/* Campo: Mensaje */}
        <div className="notification-form-field">
          <label htmlFor="body" className="notification-form-label">
            Mensaje *
          </label>
          <textarea
            id="body"
            value={formData.body}
            onChange={(e) => handleChange('body', e.target.value)}
            rows={4}
            placeholder="Escribe el mensaje que verán los usuarios..."
            className={`notification-form-textarea ${errors.body ? 'error' : ''}`}
          />
          {errors.body && (
            <p className="notification-form-error">{errors.body}</p>
          )}
        </div>

        {/* Campo: Tipo de Notificación */}
        <div className="notification-form-field">
          <label htmlFor="type" className="notification-form-label">
            Tipo de Notificación
          </label>
          <select
            id="type"
            value={formData.notification_type}
            onChange={(e) => handleChange('notification_type', e.target.value)}
            className="notification-form-select"
          >
            {notificationTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.emoji} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Campo: URL de Imagen */}
        <div className="notification-form-field">
          <label htmlFor="image_url" className="notification-form-label">
            URL de Imagen (Opcional)
          </label>
          <input
            type="url"
            id="image_url"
            value={formData.image_url}
            onChange={(e) => handleChange('image_url', e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
            className={`notification-form-input ${errors.image_url ? 'error' : ''}`}
          />
          {errors.image_url && (
            <p className="notification-form-error">{errors.image_url}</p>
          )}
        </div>
      </section>

      {/* SECCIÓN: Vista Previa */}
      <NotificationPreview
        title={formData.title}
        body={formData.body}
        imageUrl={formData.image_url}
      />

      {/* SECCIÓN: Botones de Acción */}
      <div className="notification-form-actions">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="notification-form-btn notification-form-btn-secondary"
          disabled={loading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="notification-form-btn notification-form-btn-primary"
        >
          {loading ? (
            <>
              <span className="notification-form-spinner"></span>
              Enviando...
            </>
          ) : (
            <>
              <span className="notification-form-btn-icon">📤</span>
              Enviar Notificación
            </>
          )}
        </button>
      </div>
    </form>
  );
};

NotificationForm.propTypes = {
  users: PropTypes.array.isRequired,
  isLoadingUsers: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

NotificationForm.defaultProps = {
  isLoadingUsers: false,
  loading: false,
};

export default NotificationForm;
