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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
          <p className="text-gray-600 mt-1">Administra las categorías de productos</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Nueva Categoría
        </button>
      </div>

      {/* Mensaje de error general */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <ExclamationCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Formulario (mostrar si showForm es true) */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow border-2 border-purple-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleNameChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  formErrors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ej: Electrónica"
              />
              {formErrors.name && (
                <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (URL amigable) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={handleSlugChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  formErrors.slug ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="electronica"
              />
              <p className="text-gray-500 text-xs mt-1">
                Solo letras minúsculas, números y guiones. Sin espacios.
              </p>
              {formErrors.slug && (
                <p className="text-red-500 text-sm mt-1">{formErrors.slug}</p>
              )}
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <CheckIcon className="w-5 h-5" />
                {editingCategory ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de categorías */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center p-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="text-gray-600 mt-4">Cargando categorías...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center p-12">
            <TagIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No hay categorías</p>
            <p className="text-gray-500 text-sm mt-2">
              Crea tu primera categoría haciendo clic en "Nueva Categoría"
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-purple-100 border-b-2 border-purple-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Nombre
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Slug
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category, index) => (
                  <tr
                    key={category.id}
                    className={`hover:bg-purple-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    {/* Nombre */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <TagIcon className="w-5 h-5 text-purple-600" />
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-6 py-4">
                      <code className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-mono">
                        {category.slug}
                      </code>
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(category)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-5 h-5" />
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
          title="Eliminar Categoría"
          message={`¿Estás seguro de que deseas eliminar la categoría "${categoryToDelete?.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setShowDeleteDialog(false);
            setCategoryToDelete(null);
          }}
          type="danger"
        />
      )}
    </div>
  );
};

export default CategoriesList;
