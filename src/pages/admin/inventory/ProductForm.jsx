// src/pages/admin/inventory/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  CheckIcon, 
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import useProducts from '../../../hooks/admin/useProducts';
import useCategories from '../../../hooks/admin/useCategories';
import Modal from '../../../components/admin/Modal';
import ImageManager from '../../../components/admin/inventory/ImageManager';

const ProductForm = ({ product, onClose, onSave }) => {
  const { 
    createProduct, 
    updateProduct, 
    bulkUploadImages,
    getProductImages,
    deleteProductImage,
    setImageAsPrimary,
    reorderImages,
    updateImageAltText
  } = useProducts();
  const { categories, loading: loadingCategories } = useCategories();

  const isEditing = !!product;

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    is_active: true,  // Nuevo campo para activar/desactivar producto
  });

  // Estado de imágenes (reemplaza imageFile e imagePreview)
  const [productImages, setProductImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState(null);

  // Cargar datos del producto si está editando
  useEffect(() => {
    console.log('🔄 [ProductForm] useEffect triggered - product:', product?.id);
    
    if (product) {
      console.log('📝 [ProductForm] Cargando datos del producto:', product.id, product.name);
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        category: product.category || '',
        is_active: product.is_active !== undefined ? product.is_active : true,
      });
      
      // ⭐ IMPORTANTE: Limpiar imágenes previas ANTES de cargar las nuevas
      console.log('🧹 [ProductForm] Limpiando imágenes previas...');
      setProductImages([]);
      
      // Cargar imágenes existentes
      if (product.id) {
        loadProductImages(product.id);
      }
    } else {
      console.log('🆕 [ProductForm] Creando nuevo producto, limpiando formulario');
      // Limpiar formulario para nuevo producto
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        is_active: true,
      });
      setProductImages([]);
    }
  }, [product]);

  // Cargar imágenes del producto
  const loadProductImages = async (productId) => {
    try {
      console.log('🖼️ [ProductForm] ============================================');
      console.log('🖼️ [ProductForm] Cargando imágenes para producto ID:', productId);
      console.log('🖼️ [ProductForm] Tipo de productId:', typeof productId);
      console.log('🖼️ [ProductForm] ============================================');
      
      const images = await getProductImages(productId);
      
      console.log('🖼️ [ProductForm] Imágenes recibidas:', images);
      console.log('🖼️ [ProductForm] Cantidad de imágenes:', images?.length || 0);
      
      // ⚠️ NOTA: El backend no incluye 'product' en las imágenes
      // pero el filtro por product_id se hace en el backend, así que son las correctas
      
      setProductImages(images || []);
    } catch (error) {
      console.error('❌ [ProductForm] Error loading product images:', error);
    }
  };

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

  // Enviar formulario
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
        is_active: formData.is_active,  // Incluir estado activo/inactivo
      };

      // 🔍 DEBUG: Ver qué datos se están enviando
      console.log('📤 Datos a enviar al backend:', productData);
      console.log('  → is_active:', productData.is_active, '(tipo:', typeof productData.is_active, ')');

      let savedProduct;

      if (isEditing) {
        // Actualizar producto (sin forzar refresh aún)
        console.log('📝 Actualizando producto ID:', product.id);
        savedProduct = await updateProduct(product.id, productData);
        console.log('✅ Producto actualizado:', savedProduct);
        console.log('  → is_active en respuesta:', savedProduct.is_active);
      } else {
        // Crear nuevo producto
        savedProduct = await createProduct(productData);
        console.log('Producto creado:', savedProduct);
      }

      // =====================================================
      // GESTIÓN DE MÚLTIPLES IMÁGENES
      // =====================================================
      
      console.log('💾 Procesando imágenes del producto...');
      
      // 1. Eliminar imágenes marcadas para eliminar (PRIMERO)
      const imagesToDelete = productImages.filter(img => img.toDelete && !img.isNew);
      if (imagesToDelete.length > 0) {
        console.log(`🗑️ Eliminando ${imagesToDelete.length} imágenes...`);
        for (const img of imagesToDelete) {
          console.log('  - Eliminando imagen:', img.id);
          await deleteProductImage(img.id);
        }
      }

      // 2. Subir imágenes nuevas
      const newImages = productImages.filter(img => img.isNew && !img.toDelete);
      if (newImages.length > 0) {
        console.log(`📤 Subiendo ${newImages.length} imágenes nuevas...`);
        const uploadResult = await bulkUploadImages(savedProduct.id, newImages);
        console.log('  ✅ Resultado de carga:', uploadResult);
        
        // Después de subir, obtener las imágenes con sus IDs reales
        const uploadedImages = await getProductImages(savedProduct.id);
        console.log('  📋 Imágenes después de subir:', uploadedImages.length);
        
        // Actualizar alt_text y marcar principal si es necesario
        for (let i = 0; i < newImages.length && i < uploadedImages.length; i++) {
          const newImg = newImages[i];
          const uploadedImg = uploadedImages.find(img => img.order === newImg.order);
          
          if (uploadedImg) {
            // Actualizar alt_text si existe
            if (newImg.alt_text) {
              console.log(`  🏷️ Actualizando alt_text de imagen ${uploadedImg.id}`);
              await updateImageAltText(uploadedImg.id, newImg.alt_text);
            }
            
            // Marcar como principal si era principal
            if (newImg.is_primary) {
              console.log(`  ⭐ Marcando imagen ${uploadedImg.id} como principal`);
              await setImageAsPrimary(uploadedImg.id);
            }
          }
        }
      }

      // 3. Actualizar orden y alt text de imágenes existentes
      const existingImages = productImages.filter(img => !img.isNew && !img.toDelete);
      if (existingImages.length > 0) {
        console.log(`🔄 Actualizando ${existingImages.length} imágenes existentes...`);
        
        // Reordenar
        const imageOrders = existingImages.map(img => ({
          id: img.id,
          order: img.order
        }));
        console.log('  📊 Reordenando imágenes...');
        await reorderImages(imageOrders);

        // Actualizar alt text si cambió
        for (const img of existingImages) {
          if (img.alt_text !== img.originalAltText) {
            console.log(`  🏷️ Actualizando alt_text de imagen ${img.id}`);
            await updateImageAltText(img.id, img.alt_text);
          }
        }

        // Marcar imagen principal si cambió
        const primaryImage = existingImages.find(img => img.is_primary);
        if (primaryImage) {
          console.log(`  ⭐ Estableciendo imagen ${primaryImage.id} como principal`);
          await setImageAsPrimary(primaryImage.id);
        }
      }

      console.log('✅ Todas las operaciones de imágenes completadas');

      // ✅ CRÍTICO: Llamar a onSave para que ProductsList recargue su lista
      if (onSave) {
        console.log('🔄 Llamando a onSave para recargar lista en ProductsList...');
        await onSave();
        console.log('✅ Lista de ProductsList recargada');
      }

      // ✅ IMPORTANTE: Delay para asegurar que el UI se actualice
      console.log('⏳ Esperando 300ms para sincronización visual...');
      await new Promise(resolve => setTimeout(resolve, 300));

      console.log('🔄 Cerrando modal');

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

        {/* Estado del Producto (Activo/Inactivo) */}
        <div className="user-form-group">
          <div className="user-form-checkbox-wrapper">
            <label className="user-form-checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="user-form-checkbox"
              />
              <span className="user-form-checkbox-text">
                <strong>Producto Activo</strong>
                <small style={{ display: 'block', color: '#666', marginTop: '4px' }}>
                  {formData.is_active 
                    ? '✅ Visible en la tienda para clientes'
                    : '❌ Oculto de la tienda (solo visible para administradores)'
                  }
                </small>
              </span>
            </label>
          </div>
          <div style={{ 
            marginTop: '12px', 
            padding: '12px', 
            background: formData.is_active ? '#e8f5e9' : '#fff3e0',
            border: `1px solid ${formData.is_active ? '#c8e6c9' : '#ffe0b2'}`,
            borderRadius: '6px',
            fontSize: '13px'
          }}>
            <p style={{ margin: 0, color: '#333' }}>
              {formData.is_active ? (
                <>
                  <strong>ℹ️ Producto activo:</strong> Los clientes pueden ver y comprar este producto en la tienda.
                </>
              ) : (
                <>
                  <strong>⚠️ Producto desactivado:</strong> Los clientes NO pueden ver este producto. 
                  Útil para productos descontinuados con historial de ventas.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Galería de Imágenes Múltiples */}
        <div className="user-form-group" style={{ marginTop: '24px' }}>
          <ImageManager
            productId={product?.id}
            initialImages={productImages}
            onChange={setProductImages}
            maxImages={10}
          />
          {errors.images && (
            <p className="user-form-field-error">{errors.images}</p>
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
