/**
 * ImageManager Component
 * Gestión completa de múltiples imágenes para productos
 * Features: Upload múltiple, reordenar, marcar principal, editar alt text, eliminar
 */

import React, { useState, useEffect } from 'react';
import {
  PhotoIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  StarIcon,
  Bars3Icon,
  PencilIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import './ImageManager.css';

const ImageManager = ({ 
  productId, 
  initialImages = [], 
  onChange,
  maxImages = 10 
}) => {
  const [images, setImages] = useState(initialImages);
  const [uploading, setUploading] = useState(false);
  const [editingAlt, setEditingAlt] = useState(null);
  const [altText, setAltText] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [error, setError] = useState(null);

  // Sincronizar con props
  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  // Notificar cambios al padre
  useEffect(() => {
    if (onChange) {
      onChange(images);
    }
  }, [images]);

  // Validar archivo
  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (!validTypes.includes(file.type)) {
      return 'Formato no válido. Use JPG, PNG o WEBP';
    }
    
    if (file.size > 5 * 1024 * 1024) {
      return 'La imagen debe ser menor a 5MB';
    }
    
    return null;
  };

  // Manejar selección de archivos
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > maxImages) {
      setError(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    setError(null);
    setUploading(true);

    const newImages = [];

    for (const file of files) {
      const validationError = validateFile(file);
      
      if (validationError) {
        setError(validationError);
        continue;
      }

      // Crear preview
      const preview = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      newImages.push({
        id: `temp-${Date.now()}-${Math.random()}`,
        file: file,
        image_url: preview,
        alt_text: '',
        order: images.length + newImages.length,
        is_primary: images.length === 0 && newImages.length === 0,
        isNew: true
      });
    }

    setImages([...images, ...newImages]);
    setUploading(false);
  };

  // Marcar como principal
  const handleSetPrimary = (index) => {
    const updatedImages = images.map((img, idx) => ({
      ...img,
      is_primary: idx === index
    }));
    setImages(updatedImages);
  };

  // Eliminar imagen
  const handleDelete = (index) => {
    const imageToDelete = images[index];
    const updatedImages = images.filter((_, idx) => idx !== index);
    
    // Si era principal y quedan imágenes, marcar la primera como principal
    if (imageToDelete.is_primary && updatedImages.length > 0) {
      updatedImages[0].is_primary = true;
    }
    
    // Reordenar
    updatedImages.forEach((img, idx) => {
      img.order = idx;
    });
    
    // Marcar para eliminar del backend
    if (!imageToDelete.isNew) {
      imageToDelete.toDelete = true;
      setImages([...updatedImages, imageToDelete]);
    } else {
      setImages(updatedImages);
    }
  };

  // Iniciar edición de alt text
  const handleEditAlt = (index) => {
    setEditingAlt(index);
    setAltText(images[index].alt_text || '');
  };

  // Guardar alt text
  const handleSaveAlt = () => {
    if (editingAlt !== null) {
      const updatedImages = [...images];
      updatedImages[editingAlt].alt_text = altText;
      setImages(updatedImages);
      setEditingAlt(null);
      setAltText('');
    }
  };

  // Cancelar edición
  const handleCancelAlt = () => {
    setEditingAlt(null);
    setAltText('');
  };

  // Drag & Drop - Inicio
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  // Drag & Drop - Over
  const handleDragOver = (e, index) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;
    
    const updatedImages = [...images];
    const draggedItem = updatedImages[draggedIndex];
    
    updatedImages.splice(draggedIndex, 1);
    updatedImages.splice(index, 0, draggedItem);
    
    // Actualizar orden
    updatedImages.forEach((img, idx) => {
      img.order = idx;
    });
    
    setImages(updatedImages);
    setDraggedIndex(index);
  };

  // Drag & Drop - Fin
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Filtrar imágenes visibles (no marcadas para eliminar)
  const visibleImages = images.filter(img => !img.toDelete);

  return (
    <div className="image-manager">
      <div className="image-manager__header">
        <h3 className="image-manager__title">
          <PhotoIcon className="w-5 h-5" />
          Imágenes del Producto
        </h3>
        <span className="image-manager__count">
          {visibleImages.length} / {maxImages}
        </span>
      </div>

      {error && (
        <div className="image-manager__error">
          <XMarkIcon className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid de Imágenes */}
      <div className="image-manager__grid">
        {visibleImages.map((image, index) => (
          <div
            key={image.id}
            className={`image-manager__item ${
              draggedIndex === index ? 'dragging' : ''
            } ${image.is_primary ? 'primary' : ''}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            {/* Imagen */}
            <div className="image-manager__preview">
              <img src={image.image_url} alt={image.alt_text || `Imagen ${index + 1}`} />
              
              {/* Badge Principal */}
              {image.is_primary && (
                <div className="image-manager__primary-badge">
                  <StarIconSolid className="w-4 h-4" />
                  Principal
                </div>
              )}

              {/* Badge Nuevo */}
              {image.isNew && (
                <div className="image-manager__new-badge">
                  Nuevo
                </div>
              )}

              {/* Overlay con acciones */}
              <div className="image-manager__overlay">
                {/* Drag Handle */}
                <button
                  className="image-manager__action image-manager__action--drag"
                  title="Arrastrar para reordenar"
                >
                  <Bars3Icon className="w-5 h-5" />
                </button>

                {/* Marcar como principal */}
                {!image.is_primary && (
                  <button
                    className="image-manager__action image-manager__action--star"
                    onClick={() => handleSetPrimary(index)}
                    title="Marcar como principal"
                  >
                    <StarIcon className="w-5 h-5" />
                  </button>
                )}

                {/* Editar alt text */}
                <button
                  className="image-manager__action image-manager__action--edit"
                  onClick={() => handleEditAlt(index)}
                  title="Editar descripción"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>

                {/* Eliminar */}
                <button
                  className="image-manager__action image-manager__action--delete"
                  onClick={() => handleDelete(index)}
                  title="Eliminar imagen"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="image-manager__info">
              <span className="image-manager__order">#{index + 1}</span>
              {editingAlt === index ? (
                <div className="image-manager__alt-edit">
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Descripción de la imagen"
                    maxLength={200}
                    autoFocus
                  />
                  <div className="image-manager__alt-actions">
                    <button onClick={handleSaveAlt} title="Guardar">
                      <CheckIcon className="w-4 h-4" />
                    </button>
                    <button onClick={handleCancelAlt} title="Cancelar">
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <span className="image-manager__alt" title={image.alt_text}>
                  {image.alt_text || 'Sin descripción'}
                </span>
              )}
            </div>
          </div>
        ))}

        {/* Botón Upload */}
        {visibleImages.length < maxImages && (
          <label className="image-manager__upload">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <div className="image-manager__upload-content">
              {uploading ? (
                <>
                  <div className="spinner"></div>
                  <span>Subiendo...</span>
                </>
              ) : (
                <>
                  <ArrowUpTrayIcon className="w-8 h-8" />
                  <span>Subir Imágenes</span>
                  <small>JPG, PNG, WEBP (máx 5MB)</small>
                </>
              )}
            </div>
          </label>
        )}
      </div>

      {/* Instrucciones */}
      {visibleImages.length === 0 && (
        <div className="image-manager__empty">
          <PhotoIcon className="w-12 h-12" />
          <p>No hay imágenes aún</p>
          <small>Sube al menos una imagen para el producto</small>
        </div>
      )}

      {visibleImages.length > 0 && (
        <div className="image-manager__tips">
          <h4>💡 Consejos:</h4>
          <ul>
            <li>Arrastra las imágenes para reordenarlas</li>
            <li>La imagen principal se mostrará primero en el catálogo</li>
            <li>Agrega descripciones para mejorar la accesibilidad</li>
            <li>Máximo {maxImages} imágenes por producto</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImageManager;
