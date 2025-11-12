import React, { useState } from 'react';
import './ImageUploader.css';

const ImageUploader = ({ onImagesChange, maxImages = 10, maxSizeMB = 5 }) => {
  const [previews, setPreviews] = useState([]);
  const [error, setError] = useState('');

  const validateImages = (files, currentCount) => {
    const MAX_SIZE = maxSizeMB * 1024 * 1024; // MB a bytes
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];

    // Validar que no exceda el máximo total
    if (currentCount + files.length > maxImages) {
      throw new Error(`Máximo ${maxImages} imágenes permitidas. Ya tienes ${currentCount} imágenes.`);
    }

    for (let file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`Tipo de archivo no permitido: ${file.name}. Solo se permiten imágenes.`);
      }
      if (file.size > MAX_SIZE) {
        throw new Error(`Archivo muy grande: ${file.name} (máximo ${maxSizeMB}MB)`);
      }
    }

    return true;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setError('');

    try {
      // Validar con el conteo actual
      validateImages(files, previews.length);

      // Crear previews para las nuevas imágenes
      const newPreviews = [];
      let processedCount = 0;

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          newPreviews.push({
            file,
            url: event.target.result,
            name: file.name,
          });
          
          processedCount++;
          
          // Cuando todas las imágenes estén procesadas
          if (processedCount === files.length) {
            // AGREGAR las nuevas imágenes a las existentes
            const updatedPreviews = [...previews, ...newPreviews];
            setPreviews(updatedPreviews);
            onImagesChange(updatedPreviews.map((p) => p.file));
          }
        };
        reader.readAsDataURL(file);
      });
      
      // Limpiar el input para permitir seleccionar el mismo archivo de nuevo si es necesario
      e.target.value = '';
    } catch (err) {
      setError(err.message);
      e.target.value = '';
    }
  };

  const removeImage = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
    onImagesChange(newPreviews.map((p) => p.file));
  };

  return (
    <div className="image-uploader">
      {/* Input de archivo */}
      <div className="image-uploader-input-wrapper">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="image-uploader-input"
          id="image-upload"
          disabled={previews.length >= maxImages}
        />
        <label 
          htmlFor="image-upload" 
          className={`image-uploader-label ${previews.length >= maxImages ? 'image-uploader-label-disabled' : ''}`}
        >
          <span className="image-uploader-icon">📁</span>
          <span className="image-uploader-text">
            {previews.length >= maxImages 
              ? `Máximo de ${maxImages} imágenes alcanzado`
              : 'Seleccionar imágenes'
            }
          </span>
        </label>
        <p className="image-uploader-help">
          Máximo {maxImages} imágenes, {maxSizeMB}MB cada una. Formatos: JPG, PNG, GIF, WebP
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="image-uploader-error">
          <span className="image-uploader-error-icon">⚠️</span>
          <span className="image-uploader-error-message">{error}</span>
        </div>
      )}

      {/* Vista previa de imágenes */}
      {previews.length > 0 && (
        <>
          <div className="image-uploader-grid">
            {previews.map((preview, index) => (
              <div key={index} className="image-uploader-preview">
                <img
                  src={preview.url}
                  alt={preview.name}
                  className="image-uploader-preview-img"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="image-uploader-remove-btn"
                  title="Eliminar imagen"
                >
                  ✕
                </button>
                <p className="image-uploader-preview-name">{preview.name}</p>
              </div>
            ))}
          </div>

          {/* Contador */}
          <div className="image-uploader-counter">
            <span className="image-uploader-counter-current">{previews.length}</span>
            <span className="image-uploader-counter-separator">/</span>
            <span className="image-uploader-counter-max">{maxImages}</span>
            <span className="image-uploader-counter-text">
              imagen{previews.length !== 1 ? 'es' : ''} seleccionada{previews.length !== 1 ? 's' : ''}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageUploader;
