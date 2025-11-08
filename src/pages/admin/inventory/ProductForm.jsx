// src/pages/admin/inventory/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  CheckIcon, 
  ArrowUpTrayIcon, 
  TrashIcon, 
  PhotoIcon, 
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import useProducts from '../../../hooks/admin/useProducts';
import useCategories from '../../../hooks/admin/useCategories';
import Modal from '../../../components/admin/Modal';

const ProductForm = ({ product, onClose }) => {
  const { createProduct, updateProduct, uploadImage, deleteImage } = useProducts();
  const { categories, loading: loadingCategories } = useCategories();

  const isEditing = !!product;

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [deleteExistingImage, setDeleteExistingImage] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState(null);

  // Cargar datos del producto si está editando
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        category: product.category || '',
      });
      
      if (product.image_url) {
        setImagePreview(product.image_url);
      }
    }
  }, [product]);

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'El precio debe ser mayor a 0';
    }

    if (formData.stock === '' || formData.stock < 0) {
      newErrors.stock = 'El stock debe ser 0 o mayor';
    }

    if (!formData.category) {
      newErrors.category = 'Debe seleccionar una categoría';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Manejar selección de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          image: 'Formato no válido. Use JPG, PNG o WEBP',
        }));
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'La imagen debe ser menor a 5MB',
        }));
        return;
      }

      setImageFile(file);
      setDeleteExistingImage(false);
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Limpiar error de imagen si existe
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: null,
        }));
      }
    }
  };

  // Eliminar imagen seleccionada
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    
    if (isEditing && product.image_url) {
      setDeleteExistingImage(true);
    }
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setGeneralError(null);

      // Preparar datos
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category: parseInt(formData.category),
      };

      let savedProduct;

      if (isEditing) {
        // Actualizar producto
        savedProduct = await updateProduct(product.id, productData);
        console.log('Producto actualizado:', savedProduct);
      } else {
        // Crear nuevo producto
        savedProduct = await createProduct(productData);
        console.log('Producto creado:', savedProduct);
      }

      // Manejar imagen si hay cambios
      if (deleteExistingImage && isEditing) {
        // Eliminar imagen existente
        await deleteImage(product.id);
      }

      if (imageFile) {
        // Subir nueva imagen
        await uploadImage(savedProduct.id, imageFile);
      }

      // Cerrar modal
      onClose();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      
      // Manejar errores del backend
      if (error.response?.data) {
        const backendErrors = error.response.data;
        
        if (typeof backendErrors === 'object') {
          // Errores de validación por campo
          setErrors(backendErrors);
        } else if (typeof backendErrors === 'string') {
          setGeneralError(backendErrors);
        } else {
          setGeneralError('Error al guardar el producto');
        }
      } else {
        setGeneralError(error.message || 'Error al guardar el producto');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={isEditing ? 'Edit Product' : 'New Product'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="user-form">
        {/* Error general */}
        {generalError && (
          <div className="user-form-error">
            {generalError}
          </div>
        )}

        {/* Nombre */}
        <div className="user-form-group">
          <label className="user-form-label">
            Product Name <span className="user-form-required">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`user-form-input ${errors.name ? 'error' : ''}`}
            placeholder="e.g: HP Pavilion Laptop"
          />
          {errors.name && (
            <p className="user-form-field-error">{errors.name}</p>
          )}
        </div>

        {/* Descripción */}
        <div className="user-form-group">
          <label className="user-form-label">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="user-form-input"
            placeholder="Describe the product..."
            style={{ resize: 'vertical', minHeight: '100px' }}
          />
        </div>

        {/* Categoría */}
        <div className="user-form-group">
          <label className="user-form-label">
            Category <span className="user-form-required">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`user-form-select ${errors.category ? 'error' : ''}`}
            disabled={loadingCategories}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="user-form-field-error">{errors.category}</p>
          )}
        </div>

        {/* Precio y Stock */}
        <div className="user-form-row">
          <div className="user-form-group">
            <label className="user-form-label">
              Price ($) <span className="user-form-required">*</span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
              className={`user-form-input ${errors.price ? 'error' : ''}`}
              placeholder="0.00"
            />
            {errors.price && (
              <p className="user-form-field-error">{errors.price}</p>
            )}
          </div>

          <div className="user-form-group">
            <label className="user-form-label">
              Stock <span className="user-form-required">*</span>
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className={`user-form-input ${errors.stock ? 'error' : ''}`}
              placeholder="0"
            />
            {errors.stock && (
              <p className="user-form-field-error">{errors.stock}</p>
            )}
          </div>
        </div>

        {/* Imagen */}
        <div className="user-form-group">
          <label className="user-form-label">Product Image</label>
          
          {imagePreview ? (
            <div style={{ position: 'relative' }}>
              <img
                src={imagePreview}
                alt="Preview"
                style={{
                  width: '100%',
                  height: '16rem',
                  objectFit: 'cover',
                  borderRadius: '0.5rem',
                  border: '1.5px solid #e5e5e5'
                }}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  padding: '0.5rem',
                  background: '#cc0000',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#990000'}
                onMouseOut={(e) => e.currentTarget.style.background = '#cc0000'}
              >
                <TrashIcon style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>
          ) : (
            <label
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '16rem',
                border: '2px dashed #cccccc',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: '#fafafa'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f0f0f0'}
              onMouseOut={(e) => e.currentTarget.style.background = '#fafafa'}
            >
              <ArrowUpTrayIcon style={{ width: '3rem', height: '3rem', color: '#999999', marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.875rem', color: '#666666', fontWeight: 600, marginBottom: '0.25rem' }}>
                Click to upload an image
              </p>
              <p style={{ fontSize: '0.75rem', color: '#999999' }}>
                JPG, PNG or WEBP (MAX. 5MB)
              </p>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </label>
          )}
          
          {errors.image && (
            <p className="user-form-field-error">{errors.image}</p>
          )}
        </div>

        {/* Botones */}
        <div className="user-form-actions">
          <button
            type="button"
            onClick={onClose}
            className="user-form-button-cancel"
            disabled={loading}
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
            <span>{loading ? 'Saving...' : (isEditing ? 'Update' : 'Create')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductForm;
