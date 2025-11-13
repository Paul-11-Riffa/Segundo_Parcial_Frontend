/**
 * Product Helpers
 * Utilidades para trabajar con productos
 */

/**
 * Formatear precio a moneda local
 * @param {number} price - Precio a formatear
 * @returns {string} Precio formateado
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined) return 'N/A';
  
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

/**
 * Verificar si un producto está disponible
 * @param {Object} product - Objeto producto
 * @returns {boolean} True si está disponible
 */
export const isProductAvailable = (product) => {
  if (!product) return false;
  return product.stock > 0;
};

/**
 * Obtener URL de imagen del producto
 * @param {Object} product - Objeto producto
 * @returns {string} URL de la imagen
 */
export const getProductImage = (product) => {
  if (!product) {
    console.warn('[getProductImage] Product is null/undefined');
    return '/placeholder-product.svg';
  }

  // 🔍 DEBUG: Log del producto
  console.log('[getProductImage] Processing product:', {
    id: product.id,
    name: product.name,
    hasImages: !!product.images,
    imagesLength: product.images?.length,
    hasPrimaryImage: !!product.primary_image,
    hasImage: !!product.image
  });

  // ✅ PRIORIDAD 1: Buscar imagen principal en el array de imágenes (nuevo sistema con Cloudinary)
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const primaryImage = product.images.find(img => img.is_primary);
    // ✅ CORREGIDO: Priorizar image_url (Cloudinary) sobre image (local)
    const imageUrl = primaryImage?.image_url || primaryImage?.cloudinary_url || primaryImage?.image || 
                     product.images[0]?.image_url || product.images[0]?.cloudinary_url || product.images[0]?.image;

    console.log('[getProductImage] From images array:', imageUrl);

    if (imageUrl) {
      // Si es una URL completa (ya sea de Cloudinary o del servidor)
      if (imageUrl.startsWith('http')) {
        console.log('[getProductImage] ✅ Returning full URL from images:', imageUrl);
        return imageUrl;
      }
      // Si es una ruta relativa, agregar base URL del backend
      const baseURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const fullUrl = `${baseURL}${imageUrl}`;
      console.log('[getProductImage] ✅ Returning relative URL from images:', fullUrl);
      return fullUrl;
    }
  }

  // ✅ FALLBACK 2: primary_image directo
  if (product.primary_image?.image || product.primary_image?.image_url) {
    const imageUrl = product.primary_image.image_url || product.primary_image.cloudinary_url || product.primary_image.image;
    console.log('[getProductImage] From primary_image:', imageUrl);
    
    if (imageUrl.startsWith('http')) {
      console.log('[getProductImage] ✅ Returning full URL from primary_image');
      return imageUrl;
    }
    const baseURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const fullUrl = `${baseURL}${imageUrl}`;
    console.log('[getProductImage] ✅ Returning relative URL from primary_image:', fullUrl);
    return fullUrl;
  }

  // ✅ FALLBACK 3: Sistema antiguo de imagen única
  if (product.image_url || product.image) {
    const imageUrl = product.image_url || product.image;
    console.log('[getProductImage] From product.image_url/image:', imageUrl);
    
    // Si es una URL completa
    if (imageUrl.startsWith('http')) {
      console.log('[getProductImage] ✅ Returning full URL from product.image');
      return imageUrl;
    }
    // Si es una ruta relativa, agregar base URL del backend
    const baseURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const fullUrl = `${baseURL}${imageUrl}`;
    console.log('[getProductImage] ✅ Returning relative URL from product.image:', fullUrl);
    return fullUrl;
  }

  // Imagen por defecto
  console.warn('[getProductImage] ❌ No image found, returning placeholder');
  return '/placeholder-product.svg';
};

/**
 * Obtener texto del badge de stock
 * @param {number} stock - Cantidad en stock
 * @returns {Object} { text, variant }
 */
export const getStockBadgeInfo = (stock) => {
  if (stock === 0) {
    return { text: 'Agotado', variant: 'danger' };
  } else if (stock <= 5) {
    return { text: `Quedan ${stock}`, variant: 'warning' };
  } else if (stock <= 10) {
    return { text: 'Pocas unidades', variant: 'info' };
  } else {
    return { text: 'Disponible', variant: 'success' };
  }
};

/**
 * Calcular descuento si aplica
 * @param {Object} product - Objeto producto
 * @returns {number|null} Porcentaje de descuento o null
 */
export const getDiscount = (product) => {
  if (!product || !product.original_price || !product.price) return null;
  
  const discount = ((product.original_price - product.price) / product.original_price) * 100;
  return discount > 0 ? Math.round(discount) : null;
};

/**
 * Filtrar productos por criterios
 * @param {Array} products - Lista de productos
 * @param {Object} filters - Filtros a aplicar
 * @returns {Array} Productos filtrados
 */
export const filterProducts = (products, filters = {}) => {
  let filtered = [...products];
  
  // Filtrar por búsqueda
  if (filters.search) {
    const search = filters.search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(search) ||
      (p.description && p.description.toLowerCase().includes(search))
    );
  }
  
  // Filtrar por categoría
  if (filters.category) {
    filtered = filtered.filter(p => p.category === filters.category);
  }
  
  // Filtrar por disponibilidad
  if (filters.inStock) {
    filtered = filtered.filter(p => p.stock > 0);
  }
  
  // Ordenar
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }
  
  return filtered;
};

/**
 * Truncar texto a longitud específica
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
