import React, { useState } from 'react';
import claimService, {
  CLAIM_STATUSES,
  PRIORITIES,
  RESOLUTION_TYPES,
} from '../../../services/claimService';
import './AdminClaimUpdate.css';

const AdminClaimUpdate = ({ claim, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    status: claim.status || 'PENDING',
    priority: claim.priority || 'MEDIUM',
    resolution_type: claim.resolution_type || '',
    resolution_notes: claim.resolution_notes || '',
    admin_response: claim.admin_response || '',
    internal_notes: claim.internal_notes || '',
    // NO incluir assigned_to_id - el backend lo asignará automáticamente
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Preparar datos para enviar al backend
      const updateData = {};
      
      Object.keys(formData).forEach((key) => {
        const value = formData[key];
        
        // Incluir solo valores no vacíos
        if (value !== '' && value !== null && value !== undefined) {
          updateData[key] = value;
        }
      });

      console.log('🚀 Datos a enviar al backend:', updateData);

      const result = await claimService.updateStatus(claim.id, updateData);
      
      if (onUpdate) {
        onUpdate(result);
      }
      
      alert('Reclamo actualizado exitosamente');
    } catch (err) {
      console.error('❌ Error al actualizar reclamo:', err);
      let errorMessage = 'Error al actualizar el reclamo';
      
      try {
        const errorData = JSON.parse(err.message);
        console.error('📛 Error del backend:', errorData);
        errorMessage = Object.values(errorData).flat().join(', ');
      } catch {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="admin-claim-error-message">
          <p className="admin-claim-error-text">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-claim-update-form">
        {/* Grid de campos principales */}
        <div className="admin-claim-form-grid">
          {/* Estado */}
          <div className="admin-claim-form-field">
            <label htmlFor="status" className="admin-claim-form-label">
              Estado *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="admin-claim-form-select"
            >
              {Object.values(CLAIM_STATUSES).map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Prioridad */}
          <div className="admin-claim-form-field">
            <label htmlFor="priority" className="admin-claim-form-label">
              Prioridad *
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              required
              className="admin-claim-form-select"
            >
              {Object.values(PRIORITIES).map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tipo de Resolución */}
          <div className="admin-claim-form-field">
            <label htmlFor="resolution_type" className="admin-claim-form-label">
              Tipo de Resolución
            </label>
            <select
              id="resolution_type"
              name="resolution_type"
              value={formData.resolution_type}
              onChange={handleChange}
              className="admin-claim-form-select"
            >
              <option value="">Sin resolución</option>
              {Object.values(RESOLUTION_TYPES).map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Nota informativa sobre asignación automática */}
        <div className="admin-claim-info-box admin-claim-info-box-blue">
          <div className="admin-claim-info-box-content">
            <svg className="admin-claim-info-icon admin-claim-info-icon-blue" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="admin-claim-info-text-wrapper">
              <p className="admin-claim-info-title admin-claim-info-title-blue">Asignación Automática</p>
              <p className="admin-claim-info-text admin-claim-info-text-blue">
                Este reclamo se asignará automáticamente a tu usuario cuando actualices su estado. 
                No es necesario seleccionar un administrador manualmente.
              </p>
            </div>
          </div>
        </div>

        {/* Respuesta al Cliente */}
        <div className="admin-claim-form-section">
          <div className="admin-claim-form-field">
            <label htmlFor="admin_response" className="admin-claim-form-label">
              Respuesta al Cliente
            </label>
            <textarea
              id="admin_response"
              name="admin_response"
              value={formData.admin_response}
              onChange={handleChange}
              rows={3}
              placeholder="Mensaje que verá el cliente..."
              className="admin-claim-form-textarea"
            />
            <p className="admin-claim-form-hint">
              Este mensaje será visible para el cliente
            </p>
          </div>
        </div>

        {/* Notas de Resolución */}
        {formData.resolution_type && (
          <div className="admin-claim-form-section">
            <div className="admin-claim-form-field">
              <label htmlFor="resolution_notes" className="admin-claim-form-label">
                Notas de Resolución
              </label>
              <textarea
                id="resolution_notes"
                name="resolution_notes"
                value={formData.resolution_notes}
                onChange={handleChange}
                rows={3}
                placeholder="Detalles de la resolución..."
                className="admin-claim-form-textarea"
              />
            </div>
          </div>
        )}

        {/* Notas Internas */}
        <div className="admin-claim-form-section">
          <div className="admin-claim-form-field">
            <label htmlFor="internal_notes" className="admin-claim-form-label">
              Notas Internas (Solo Admins)
            </label>
            <textarea
              id="internal_notes"
              name="internal_notes"
              value={formData.internal_notes}
              onChange={handleChange}
              rows={2}
              placeholder="Notas privadas para administradores..."
              className="admin-claim-form-textarea"
            />
            <p className="admin-claim-form-hint">
              <svg className="admin-claim-form-hint-icon" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              El cliente NO verá estas notas
            </p>
          </div>
        </div>

        {/* Advertencias según el estado */}
        {formData.status === 'RESOLVED' && (
          <div className="admin-claim-info-box admin-claim-info-box-green">
            <div className="admin-claim-info-box-content">
              <svg className="admin-claim-info-icon admin-claim-info-icon-green" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="admin-claim-info-text admin-claim-info-text-green">
                Al marcar como RESUELTO, se actualizará automáticamente la fecha de resolución
                y el cliente podrá calificar el servicio.
              </p>
            </div>
          </div>
        )}

        {formData.status === 'REJECTED' && (
          <div className="admin-claim-info-box admin-claim-info-box-orange">
            <div className="admin-claim-info-box-content">
              <svg className="admin-claim-info-icon admin-claim-info-icon-orange" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="admin-claim-info-text admin-claim-info-text-orange">
                Asegúrate de proporcionar una explicación clara al cliente sobre el rechazo.
              </p>
            </div>
          </div>
        )}

        {/* Botón de Envío */}
        <div className="admin-claim-submit-wrapper">
          <button
            type="submit"
            disabled={loading}
            className="admin-claim-submit-button"
          >
            {loading && <span className="admin-claim-button-loading"></span>}
            {loading ? 'Actualizando...' : 'Actualizar Reclamo'}
          </button>
        </div>
      </form>
    </>
  );
};

export default AdminClaimUpdate;
