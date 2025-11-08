// src/pages/admin/inventory/CategoriesList.jsx
import React, { useState } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  TagIcon, 
  ExclamationCircleIcon, 
  CheckIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';
import useCategories from '../../../hooks/admin/useCategories';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import './CategoriesList.css';

const CategoriesList = () => {
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    slugExists,
  } = useCategories();

  // Estados locales
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [formErrors, setFormErrors] = useState({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Generar slug automático desde el nombre
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[áäâà]/g, 'a')
      .replace(/[éëêè]/g, 'e')
      .replace(/[íïîì]/g, 'i')
      .replace(/[óöôò]/g, 'o')
      .replace(/[úüûù]/g, 'u')
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
    }

    if (!formData.slug.trim()) {
      errors.slug = 'El slug es requerido';
    } else if (formData.slug.includes(' ')) {
      errors.slug = 'El slug no puede contener espacios';
    } else if (slugExists(formData.slug, editingCategory?.slug)) {
      errors.slug = 'Este slug ya existe';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar cambio de nombre (auto-generar slug si no está editando)
  const handleNameChange = (e) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      slug: !editingCategory ? generateSlug(name) : prev.slug,
    }));
    
    if (formErrors.name) {
      setFormErrors(prev => ({ ...prev, name: null }));
    }
  };

  // Manejar cambio de slug
  const handleSlugChange = (e) => {
    setFormData(prev => ({
      ...prev,
      slug: e.target.value,
    }));
    
    if (formErrors.slug) {
      setFormErrors(prev => ({ ...prev, slug: null }));
    }
  };

  // Abrir formulario para crear
  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '' });
    setFormErrors({});
    setShowForm(true);
  };

  // Abrir formulario para editar
  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, slug: category.slug });
    setFormErrors({});
    setShowForm(true);
  };

  // Guardar categoría
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.slug, formData);
      } else {
        await createCategory(formData);
      }
      
      // Cerrar formulario
      setShowForm(false);
      setFormData({ name: '', slug: '' });
      setEditingCategory(null);
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      
      // Manejar errores del backend
      if (error.response?.data) {
        setFormErrors(error.response.data);
      }
    }
  };

  // Cancelar formulario
  const handleCancel = () => {
    setShowForm(false);
    setFormData({ name: '', slug: '' });
    setEditingCategory(null);
    setFormErrors({});
  };

  // Abrir diálogo de confirmación de eliminación
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteDialog(true);
  };

  // Confirmar eliminación
  const handleDeleteConfirm = async () => {
    try {
      await deleteCategory(categoryToDelete.slug);
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
    }
  };

  return (
    <div className="categories-container">
      {/* Header */}
      <div className="categories-header">
        <div className="categories-header-content">
          <h1>Categorías</h1>
          <p>Administra las categorías de productos</p>
        </div>
        <button
          onClick={handleCreate}
          className="categories-create-button"
        >
          <PlusIcon />
          Nueva Categoría
        </button>
      </div>

      {/* Mensaje de error general */}
      {error && (
        <div className="categories-error">
          <ExclamationCircleIcon className="categories-error-icon" />
          <p>{error}</p>
        </div>
      )}

      {/* Formulario (mostrar si showForm es true) */}
      {showForm && (
        <div className="categories-form-card">
          <h2 className="categories-form-title">
            {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          
          <form onSubmit={handleSubmit} className="categories-form">
            {/* Nombre */}
            <div className="categories-form-group">
              <label className="categories-form-label">
                Nombre <span className="categories-form-required">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                className={`categories-form-input ${formErrors.name ? 'error' : ''}`}
                placeholder="Ej: Electrónica"
              />
              {formErrors.name && (
                <p className="categories-form-error">{formErrors.name}</p>
              )}
            </div>

            {/* Slug */}
            <div className="categories-form-group">
              <label className="categories-form-label">
                Slug (URL amigable) <span className="categories-form-required">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={handleSlugChange}
                className={`categories-form-input ${formErrors.slug ? 'error' : ''}`}
                placeholder="electronica"
              />
              <p className="categories-form-hint">
                Solo letras minúsculas, números y guiones. Sin espacios.
              </p>
              {formErrors.slug && (
                <p className="categories-form-error">{formErrors.slug}</p>
              )}
            </div>

            {/* Botones */}
            <div className="categories-form-actions">
              <button
                type="button"
                onClick={handleCancel}
                className="categories-form-button-cancel"
              >
                <XMarkIcon />
                Cancelar
              </button>
              <button
                type="submit"
                className="categories-form-button-submit"
              >
                <CheckIcon />
                {editingCategory ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de categorías */}
      <div className="categories-table-wrapper">
        {loading ? (
          <div className="categories-loading">
            <div className="categories-loading-spinner"></div>
            <p className="categories-loading-text">Cargando categorías...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="categories-empty">
            <TagIcon className="categories-empty-icon" />
            <p className="categories-empty-title">No hay categorías</p>
            <p className="categories-empty-description">
              Crea tu primera categoría haciendo clic en "Nueva Categoría"
            </p>
          </div>
        ) : (
          <div className="categories-table-container">
            <table className="categories-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Slug</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    {/* Nombre */}
                    <td>
                      <div className="categories-table-name">
                        <TagIcon className="categories-table-name-icon" />
                        <span className="categories-table-name-text">{category.name}</span>
                      </div>
                    </td>

                    {/* Slug */}
                    <td>
                      <span className="categories-table-slug">
                        {category.slug}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td>
                      <div className="categories-table-actions">
                        <button
                          onClick={() => handleEdit(category)}
                          className="categories-action-button edit"
                          title="Editar"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(category)}
                          className="categories-action-button delete"
                          title="Eliminar"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Diálogo de confirmación de eliminación */}
      {showDeleteDialog && (
        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Eliminar Categoría"
          message={`¿Estás seguro de que deseas eliminar la categoría "${categoryToDelete?.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={handleDeleteConfirm}
          onClose={() => {
            setShowDeleteDialog(false);
            setCategoryToDelete(null);
          }}
          variant="danger"
        />
      )}
    </div>
  );
};

export default CategoriesList;
