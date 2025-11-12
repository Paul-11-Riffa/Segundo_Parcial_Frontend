import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import claimService, { DAMAGE_TYPES, PRIORITIES } from '../../services/claimService';
import cartService from '../../services/cartService';
import ImageUploader from './ImageUploader';
import './CreateClaimForm.css';

const CreateClaimForm = ({ orderId, onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [orderProducts, setOrderProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    product_id: '',
    title: '',
    description: '',
    damage_type: 'FACTORY_DEFECT',
    priority: 'MEDIUM',
  });

  useEffect(() => {
    // Cargar productos de las órdenes completadas del usuario
    const fetchOrderProducts = async () => {
      try {
        setLoadingProducts(true);
        console.log('📦 Cargando productos de órdenes completadas...');
        
        // Obtener historial de órdenes
        const orders = await cartService.getOrderHistory();
        console.log('📦 Órdenes obtenidas:', orders);
        
        // Extraer array de órdenes según el formato de respuesta
        let ordersArray = [];
        if (Array.isArray(orders)) {
          ordersArray = orders;
        } else if (orders && Array.isArray(orders.results)) {
          ordersArray = orders.results;
        } else if (orders && Array.isArray(orders.orders)) {
          ordersArray = orders.orders;
        }
        
        console.log('📦 Órdenes array:', ordersArray);
        
        // Filtrar solo órdenes completadas
        const completedOrders = ordersArray.filter(order => order.status === 'COMPLETED');
        console.log('✅ Órdenes completadas:', completedOrders);
        
        // Si hay un orderId específico, filtrar solo esa orden
        let ordersToProcess = completedOrders;
        if (orderId) {
          ordersToProcess = completedOrders.filter(order => order.id === parseInt(orderId));
          console.log('🎯 Orden específica filtrada:', ordersToProcess);
        }
        
        // Extraer todos los productos únicos de las órdenes completadas
        const productsMap = new Map();
        ordersToProcess.forEach(order => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach(item => {
              const productId = item.product_id || item.product?.id;
              const productName = item.product_name || item.product?.name || 'Producto sin nombre';
              
              if (productId && !productsMap.has(productId)) {
                productsMap.set(productId, {
                  id: productId,
                  name: productName,
                  order_id: order.id,
                  order_number: order.id,
                });
              }
            });
          }
        });
        
        const products = Array.from(productsMap.values());
        console.log('📋 Productos extraídos:', products);
        
        setOrderProducts(products);
        
        if (products.length === 0) {
          setError('No tienes órdenes completadas con productos para reclamar.');
        }
      } catch (err) {
        console.error('❌ Error al cargar productos:', err);
        setError('Error al cargar los productos. Por favor, intenta de nuevo.');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchOrderProducts();
  }, [orderId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImagesChange = (newImages) => {
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validaciones
      if (!formData.product_id) {
        throw new Error('Por favor selecciona un producto');
      }
      if (!formData.title.trim()) {
        throw new Error('Por favor ingresa un título');
      }
      if (!formData.description.trim()) {
        throw new Error('Por favor describe el problema');
      }

      // Encontrar el order_id del producto seleccionado
      const selectedProduct = orderProducts.find(p => p.id === parseInt(formData.product_id));
      const orderIdToUse = orderId || selectedProduct?.order_id;
      
      if (!orderIdToUse) {
        throw new Error('No se pudo determinar la orden del producto');
      }

      const claimData = {
        order_id: orderIdToUse,
        ...formData,
      };

      console.log('📤 Enviando reclamo:', claimData);
      const result = await claimService.createClaim(claimData, images);
      console.log('✅ Reclamo creado:', result);

      // Éxito
      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate(`/claims/${result.id}`);
      }
    } catch (err) {
      console.error('❌ Error al crear reclamo:', err);
      let errorMessage = 'Error al crear reclamo';
      
      try {
        const errorData = JSON.parse(err.message);
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
    <div className="create-claim-container">
      <div className="create-claim-form-wrapper">
        {/* Header */}
        <div className="create-claim-header">
          <h1 className="create-claim-title">Crear Reclamo</h1>
          <p className="create-claim-subtitle">
            Completa el formulario para reportar un problema con tu compra
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="create-claim-alert create-claim-alert-error">
            <span className="create-claim-alert-icon">⚠️</span>
            <span className="create-claim-alert-message">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-claim-form">
          {/* Selección de Producto */}
          <div className="create-claim-field">
            <label htmlFor="product_id" className="create-claim-label">
              <span>Producto con Problema</span>
              <span className="create-claim-label-required">*</span>
            </label>
            <select
              id="product_id"
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              required
              disabled={loadingProducts}
              className="create-claim-select"
            >
              {loadingProducts ? (
                <option value="">Cargando productos...</option>
              ) : orderProducts.length === 0 ? (
                <option value="">No hay productos disponibles</option>
              ) : (
                <>
                  <option value="">Seleccione un producto</option>
                  {orderProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} {product.order_number ? `(Orden #${product.order_number})` : ''}
                    </option>
                  ))}
                </>
              )}
            </select>
            {loadingProducts && (
              <p className="create-claim-loading-text">
                <span className="create-claim-loading-spinner"></span>
                Cargando tus productos comprados...
              </p>
            )}
            {!loadingProducts && orderProducts.length === 0 && (
              <p className="create-claim-error-text">
                <span>❌</span>
                No tienes órdenes completadas. Debes completar una compra antes de crear un reclamo.
              </p>
            )}
          </div>

          {/* Título */}
          <div className="create-claim-field">
            <label htmlFor="title" className="create-claim-label">
              <span>Título del Reclamo</span>
              <span className="create-claim-label-required">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength={255}
              required
              placeholder="Ej: Producto llegó con defecto de fábrica"
              className="create-claim-input"
            />
            <p className={`create-claim-char-count ${formData.title.length > 200 ? 'create-claim-char-count-warning' : ''}`}>
              {formData.title.length}/255 caracteres
            </p>
          </div>

          {/* Descripción */}
          <div className="create-claim-field">
            <label htmlFor="description" className="create-claim-label">
              <span>Descripción del Problema</span>
              <span className="create-claim-label-required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Describe detalladamente el problema con el producto..."
              className="create-claim-textarea"
            />
            <p className="create-claim-help-text">
              <span className="create-claim-help-icon">💡</span>
              <span>Proporciona la mayor cantidad de detalles posible para ayudarnos a resolver tu reclamo</span>
            </p>
          </div>

          {/* Tipo de Daño */}
          <div className="create-claim-field">
            <label htmlFor="damage_type" className="create-claim-label">
              <span>Tipo de Daño</span>
              <span className="create-claim-label-required">*</span>
            </label>
            <select
              id="damage_type"
              name="damage_type"
              value={formData.damage_type}
              onChange={handleChange}
              required
              className="create-claim-select"
            >
              {Object.values(DAMAGE_TYPES).map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {formData.damage_type === 'FACTORY_DEFECT' && (
              <div className="create-claim-damage-alert">
                <span className="create-claim-damage-icon">⚠️</span>
                <p className="create-claim-damage-text">
                  Este tipo de daño se asignará automáticamente con prioridad <span className="create-claim-damage-highlight">ALTA</span>
                </p>
              </div>
            )}
          </div>

          {/* Prioridad */}
          <div className="create-claim-field">
            <label htmlFor="priority" className="create-claim-label">
              Prioridad
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="create-claim-select"
            >
              {Object.values(PRIORITIES).map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
            <p className="create-claim-help-text">
              <span className="create-claim-help-icon">ℹ️</span>
              <span>La prioridad puede ser ajustada por nuestro equipo según la evaluación</span>
            </p>
          </div>

          {/* Carga de Imágenes */}
          <div className="create-claim-images-section">
            <div className="create-claim-images-header">
              <span className="create-claim-images-icon">📸</span>
              <h3 className="create-claim-images-title">Imágenes de Evidencia</h3>
              <span className="create-claim-images-badge">Opcional</span>
            </div>
            <ImageUploader onImagesChange={handleImagesChange} />
          </div>

          {/* Botones */}
          <div className="create-claim-buttons">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="create-claim-button create-claim-button-secondary"
            >
              <span className="create-claim-button-icon">←</span>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || loadingProducts || orderProducts.length === 0}
              className="create-claim-button create-claim-button-primary"
            >
              {loading ? (
                <>
                  <span className="create-claim-loading-spinner"></span>
                  Creando...
                </>
              ) : (
                <>
                  <span className="create-claim-button-icon">✓</span>
                  Crear Reclamo
                </>
              )}
            </button>
          </div>
      </form>
      </div>
    </div>
  );
};

export default CreateClaimForm;
