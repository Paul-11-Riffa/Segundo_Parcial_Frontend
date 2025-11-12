import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import claimService, { DAMAGE_TYPES, RESOLUTION_TYPES } from '../../services/claimService';
import AuthContext from '../../context/AuthContext';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import ImageUploader from './ImageUploader';

const ClaimDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para feedback
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Estados para agregar imágenes
  const [showAddImages, setShowAddImages] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    loadClaimDetail();
  }, [id]);

  const loadClaimDetail = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await claimService.getClaimDetail(id);
      setClaim(data);
    } catch (err) {
      console.error('Error al cargar detalle del reclamo:', err);
      setError(err.message || 'Error al cargar el reclamo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);

    try {
      await claimService.addFeedback(id, rating, feedback);
      setShowFeedback(false);
      loadClaimDetail(); // Recargar datos
      alert('¡Gracias por tu feedback!');
    } catch (err) {
      console.error('Error al enviar feedback:', err);
      alert('Error al enviar feedback. Por favor, intenta de nuevo.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleAddImages = async () => {
    if (newImages.length === 0) {
      alert('Por favor selecciona al menos una imagen');
      return;
    }

    setUploadingImages(true);

    try {
      await claimService.addImages(id, newImages);
      setShowAddImages(false);
      setNewImages([]);
      loadClaimDetail(); // Recargar datos
      alert('Imágenes agregadas exitosamente');
    } catch (err) {
      console.error('Error al agregar imágenes:', err);
      alert('Error al agregar imágenes. Por favor, intenta de nuevo.');
    } finally {
      setUploadingImages(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderStars = (currentRating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${
              star <= currentRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => navigate('/claims')}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Volver a mis reclamos
          </button>
        </div>
      </div>
    );
  }

  if (!claim) return null;

  const canAddFeedback =
    claim.is_resolved &&
    !claim.customer_rating &&
    user &&
    claim.customer.id === user.id;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/claims')}
          className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver a mis reclamos
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Reclamo #{claim.ticket_number}
            </h1>
            <p className="text-gray-600 mt-1">Creado el {formatDate(claim.created_at)}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <StatusBadge status={claim.status} />
            <PriorityBadge priority={claim.priority} />
          </div>
        </div>
      </div>

      {/* Información Principal */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Reclamo</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">Producto</label>
            <p className="text-gray-900">{claim.product.name}</p>
            <p className="text-sm text-gray-600">${claim.product.price}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Orden</label>
            <p className="text-gray-900">#{claim.order_id}</p>
            <p className="text-sm text-gray-600">Total: ${claim.order_total}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Tipo de Daño</label>
            <p className="text-gray-900">{claim.damage_type_display}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Días Abierto</label>
            <p className="text-gray-900">{claim.days_open} día{claim.days_open !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-500 mb-2">Título</label>
          <p className="text-lg font-semibold text-gray-900">{claim.title}</p>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-500 mb-2">Descripción</label>
          <p className="text-gray-700 whitespace-pre-wrap">{claim.description}</p>
        </div>
      </div>

      {/* Respuesta del Administrador */}
      {claim.admin_response && (
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Respuesta del Administrador
          </h3>
          <p className="text-gray-800">{claim.admin_response}</p>
          {claim.assigned_to && (
            <p className="text-sm text-gray-600 mt-2">
              Asignado a: {claim.assigned_to.username}
            </p>
          )}
        </div>
      )}

      {/* Resolución */}
      {claim.resolution_type && (
        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">Resolución</h3>
          <p className="text-gray-800">
            <strong>Tipo:</strong> {RESOLUTION_TYPES[claim.resolution_type]?.label || claim.resolution_type}
          </p>
          {claim.resolution_notes && (
            <p className="text-gray-700 mt-2">{claim.resolution_notes}</p>
          )}
          {claim.resolved_at && (
            <p className="text-sm text-gray-600 mt-2">
              Resuelto el {formatDate(claim.resolved_at)}
            </p>
          )}
        </div>
      )}

      {/* Imágenes */}
      {claim.images && claim.images.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Imágenes de Evidencia ({claim.images.length})
            </h3>
            {!showAddImages && (
              <button
                onClick={() => setShowAddImages(true)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Agregar más imágenes
              </button>
            )}
          </div>

          {/* Agregar imágenes */}
          {showAddImages && (
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <ImageUploader onImagesChange={setNewImages} />
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => {
                    setShowAddImages(false);
                    setNewImages([]);
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddImages}
                  disabled={uploadingImages || newImages.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploadingImages ? 'Subiendo...' : 'Subir Imágenes'}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {claim.images.map((img) => (
              <a
                key={img.id}
                href={img.image_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <img
                  src={img.image_url}
                  alt={img.description || 'Evidencia'}
                  className="w-full h-32 object-cover rounded-lg border border-gray-300 group-hover:opacity-75 transition"
                />
                {img.description && (
                  <p className="text-xs text-gray-600 mt-1">{img.description}</p>
                )}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Historial */}
      {claim.history && claim.history.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historial de Cambios</h3>
          <div className="space-y-4">
            {claim.history.map((entry) => (
              <div key={entry.id} className="flex">
                <div className="flex-shrink-0 w-2 bg-blue-500 rounded-full mr-4"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">{formatDate(entry.timestamp)}</p>
                  <p className="text-gray-900 font-medium">{entry.action}</p>
                  {entry.notes && <p className="text-sm text-gray-700">{entry.notes}</p>}
                  {entry.user && (
                    <p className="text-xs text-gray-500 mt-1">Por: {entry.user.username}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback del Cliente */}
      {claim.customer_rating ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Tu Calificación</h3>
          {renderStars(claim.customer_rating)}
          {claim.customer_feedback && (
            <p className="text-gray-700 mt-3">{claim.customer_feedback}</p>
          )}
        </div>
      ) : canAddFeedback && !showFeedback ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¿Cómo fue tu experiencia?
            </h3>
            <p className="text-gray-600 mb-4">
              Tu reclamo ha sido resuelto. Nos gustaría conocer tu opinión.
            </p>
            <button
              onClick={() => setShowFeedback(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Calificar Servicio
            </button>
          </div>
        </div>
      ) : showFeedback ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Califica tu experiencia</h3>
          <form onSubmit={handleSubmitFeedback} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calificación
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <svg
                      className={`w-8 h-8 ${
                        star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      } hover:text-yellow-400 transition`}
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {rating === 1 && 'Muy malo'}
                {rating === 2 && 'Malo'}
                {rating === 3 && 'Regular'}
                {rating === 4 && 'Bueno'}
                {rating === 5 && 'Excelente'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios (opcional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                placeholder="Cuéntanos sobre tu experiencia..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowFeedback(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submittingFeedback}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {submittingFeedback ? 'Enviando...' : 'Enviar Feedback'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
};

export default ClaimDetail;
