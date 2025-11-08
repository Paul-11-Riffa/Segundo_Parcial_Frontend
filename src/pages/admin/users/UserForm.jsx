import { useState, useEffect } from 'react';
import Modal from '../../../components/admin/Modal';
import './UserForm.css';

/**
 * UserForm - Formulario para crear/editar usuarios con diseño minimalista
 * Usado dentro de un Modal
 */
const UserForm = ({ isOpen, onClose, onSubmit, user, loading }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    is_active: true,
    profile: {
      role: 'CLIENT'
    }
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Modo edición o creación
  const isEditMode = !!user;

  // Cargar datos del usuario al editar
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '', // No mostrar password al editar
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        is_active: user.is_active !== undefined ? user.is_active : true,
        profile: {
          role: user.profile?.role || 'CLIENT'
        }
      });
    } else {
      // Reset form para crear nuevo
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        is_active: true,
        profile: {
          role: 'CLIENT'
        }
      });
    }
    setErrors({});
    setSubmitError('');
  }, [user, isOpen]);

  // Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'role') {
      setFormData(prev => ({
        ...prev,
        profile: {
          role: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }

    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validar formulario
  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!isEditMode && !formData.password) {
      newErrors.password = 'Password is required';
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validate()) {
      return;
    }

    // Preparar datos para enviar
    const dataToSend = { ...formData };
    
    // Si es edición y no se cambió el password, no enviarlo
    if (isEditMode && !dataToSend.password) {
      delete dataToSend.password;
    }

    const result = await onSubmit(dataToSend);

    if (!result.success) {
      setSubmitError(result.error || 'An error occurred');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit User' : 'Create New User'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="user-form">
        {/* Error general */}
        {submitError && (
          <div className="user-form-error">
            {submitError}
          </div>
        )}

        {/* Username */}
        <div className="user-form-group">
          <label htmlFor="username" className="user-form-label">
            Username <span className="user-form-required">*</span>
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={`user-form-input ${errors.username ? 'error' : ''}`}
            placeholder="Enter username"
          />
          {errors.username && (
            <p className="user-form-field-error">{errors.username}</p>
          )}
        </div>

        {/* Email */}
        <div className="user-form-group">
          <label htmlFor="email" className="user-form-label">
            Email <span className="user-form-required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`user-form-input ${errors.email ? 'error' : ''}`}
            placeholder="user@example.com"
          />
          {errors.email && (
            <p className="user-form-field-error">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="user-form-group">
          <label htmlFor="password" className="user-form-label">
            Password {!isEditMode && <span className="user-form-required">*</span>}
            {isEditMode && <span className="user-form-hint">(leave blank to keep current)</span>}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`user-form-input ${errors.password ? 'error' : ''}`}
            placeholder={isEditMode ? '••••••••' : 'Minimum 8 characters'}
          />
          {errors.password && (
            <p className="user-form-field-error">{errors.password}</p>
          )}
          {!isEditMode && !errors.password && (
            <p className="user-form-password-hint">Must be at least 8 characters long</p>
          )}
        </div>

        {/* First Name y Last Name en una fila */}
        <div className="user-form-row">
          <div className="user-form-group">
            <label htmlFor="first_name" className="user-form-label">
              First Name
            </label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="user-form-input"
              placeholder="John"
            />
          </div>

          <div className="user-form-group">
            <label htmlFor="last_name" className="user-form-label">
              Last Name
            </label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="user-form-input"
              placeholder="Doe"
            />
          </div>
        </div>

        {/* Role */}
        <div className="user-form-group">
          <label htmlFor="role" className="user-form-label">
            Role <span className="user-form-required">*</span>
          </label>
          <select
            id="role"
            name="role"
            value={formData.profile.role}
            onChange={handleChange}
            className="user-form-select"
          >
            <option value="CLIENT">Client</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {/* Active Status */}
        <div className="user-form-checkbox-wrapper">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="user-form-checkbox"
          />
          <label htmlFor="is_active" className="user-form-checkbox-label">
            Active user
          </label>
        </div>

        {/* Buttons */}
        <div className="user-form-actions">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="user-form-button-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="user-form-button-submit"
          >
            {loading && (
              <div className="user-form-loading-spinner"></div>
            )}
            <span>{loading ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserForm;
