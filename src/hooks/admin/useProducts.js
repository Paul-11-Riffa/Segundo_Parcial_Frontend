// src/hooks/admin/useProducts.js
import { useState, useEffect, useCallback, useRef } from 'react';
import productService from '../../services/admin/productService';

/**
 * Hook personalizado para gestión de productos con filtros y búsqueda
 */
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ NUEVO: Ref para evitar que se cancelen requests en mount/unmount rápido
  const isMountedRef = useRef(true);
  
  // Filtros
  const [filters, setFilters] = useState({
    search: '',
    category_slug: '',
    price_min: '',
    price_max: '',
    stock_min: '',
    in_stock: false,
    ordering: '-created_at', // Más recientes primero por defecto
  });

  /**
   * Cargar productos con filtros actuales
   */
  const fetchProducts = useCallback(async () => {
    try {
      console.log('[useProducts] 🔄 INICIO fetchProducts');
      console.log('[useProducts] → isMountedRef.current:', isMountedRef.current);
      console.log('[useProducts] → Filtros:', JSON.stringify(filters, null, 2));

      setLoading(true);
      setError(null);

      const data = await productService.getAll(filters);
      console.log('[useProducts] 📥 Data recibida:', data?.length, 'productos');

      // ✅ Solo actualizar si el componente sigue montado
      if (!isMountedRef.current) {
        console.log('[useProducts] ⚠️ Component unmounted, skipping state update');
        return;
      }

      // Asegurar que data sea un array
      const productsArray = Array.isArray(data) ? data : [];
      console.log('[useProducts] 📝 Actualizando state con', productsArray.length, 'productos');

      setProducts(productsArray);

      console.log('[useProducts] ✅ Products loaded successfully:', productsArray.length);
    } catch (err) {
      console.error('[useProducts] ❌ Error loading products:', err);

      // ✅ Solo actualizar si el componente sigue montado
      if (!isMountedRef.current) {
        console.log('[useProducts] Component unmounted, skipping error update');
        return;
      }

      setError(err.response?.data?.message || 'Error al cargar productos');
      setProducts([]); // Resetear a array vacío en caso de error
    } finally {
      // ✅ Solo actualizar si el componente sigue montado
      if (isMountedRef.current) {
        console.log('[useProducts] 🏁 fetchProducts finalizado, setLoading(false)');
        setLoading(false);
      }
    }
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * ✅ NUEVO: Cleanup para evitar memory leaks
   */
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      console.log('[useProducts] Component unmounting, canceling future updates');
    };
  }, []);

  /**
   * Cargar productos al montar y cuando cambien los filtros
   * ✅ MEJORADO: Dependencias específicas para evitar re-renders innecesarios
   */
  useEffect(() => {
    console.log('[useProducts] Effect triggered - fetching products');
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.search,
    filters.category_slug,
    filters.price_min,
    filters.price_max,
    filters.stock_min,
    filters.in_stock,
    filters.ordering,
    filters.is_active,
  ]); // ✅ Dependencias específicas (fetchProducts se actualiza con filters)

  /**
   * Actualizar un filtro específico
   */
  const updateFilter = useCallback((filterName, value) => {
    console.log('[useProducts] Updating filter:', filterName, '=', value);
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
  }, []);

  /**
   * Resetear todos los filtros
   */
  const resetFilters = useCallback(() => {
    console.log('[useProducts] Resetting filters');
    setFilters({
      search: '',
      category_slug: '',
      price_min: '',
      price_max: '',
      stock_min: '',
      in_stock: false,
      ordering: '-created_at',
    });
  }, []);

  /**
   * Crear un nuevo producto
   */
  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useProducts] Creating product:', productData);

      const newProduct = await productService.create(productData);
      console.log('[useProducts] Product created:', newProduct);
      console.log('[useProducts] → is_active:', newProduct.is_active);

      // ✅ PASO 1: Agregar inmediatamente a la lista (optimistic update)
      setProducts(prev => {
        console.log('[useProducts] 🆕 Agregando nuevo producto a la lista');
        return [...prev, newProduct];
      });

      // ✅ PASO 2: Recargar lista completa para asegurar sincronización
      console.log('[useProducts] 🔄 Recargando lista completa...');
      await fetchProducts();

      return newProduct;
    } catch (err) {
      console.error('[useProducts] Error creating product:', err);
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Error al crear producto';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  /**
   * Actualizar un producto existente
   */
  const updateProduct = useCallback(async (id, productData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useProducts] Updating product:', id, productData);

      const updatedProduct = await productService.update(id, productData);
      console.log('[useProducts] Product updated:', updatedProduct);
      console.log('[useProducts] → is_active recibido:', updatedProduct.is_active);

      // ✅ PASO 1: Actualizar inmediatamente en memoria (optimistic update)
      setProducts(prev => {
        const updated = prev.map(p => {
          if (p.id === id) {
            console.log('[useProducts] 🔄 Actualizando producto en memoria:', id);
            console.log('[useProducts]   Antes:', { is_active: p.is_active });
            console.log('[useProducts]   Después:', { is_active: updatedProduct.is_active });
            return { ...p, ...updatedProduct };
          }
          return p;
        });
        return updated;
      });

      // ✅ PASO 2: Recargar toda la lista para obtener datos frescos (incluyendo imágenes)
      // Esto asegura que tengamos todos los datos actualizados del servidor
      console.log('[useProducts] 🔄 Recargando lista completa...');
      await fetchProducts();

      return updatedProduct;
    } catch (err) {
      console.error('[useProducts] Error updating product:', err);
      const errorMessage = err.response?.data?.message ||
                          err.response?.data?.error ||
                          'Error al actualizar producto';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts]);

  /**
   * Eliminar un producto
   */
  const deleteProduct = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useProducts] Deleting product:', id);
      
      await productService.delete(id);
      console.log('[useProducts] Product deleted');
      
      // Eliminar del estado local
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('[useProducts] Error deleting product:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          'Error al eliminar producto';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Toggle activo/inactivo de un producto
   */
  const toggleProductActive = useCallback(async (id, forceState = undefined) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useProducts] 🔄 Toggling active state for product:', id, 'forceState:', forceState);
      
      const response = await productService.toggleActive(id, forceState);
      console.log('[useProducts] 📥 Toggle response:', response);
      
      // Actualizar en el estado local
      if (response && response.success && response.product) {
        console.log('[useProducts] ✅ Updating local state with is_active:', response.product.is_active);
        
        setProducts(prev => {
          const updated = prev.map(p => {
            if (p.id === id) {
              console.log('[useProducts] 🔄 Product before:', { id: p.id, is_active: p.is_active });
              const newProduct = { ...p, is_active: response.product.is_active };
              console.log('[useProducts] 🔄 Product after:', { id: newProduct.id, is_active: newProduct.is_active });
              return newProduct;
            }
            return p;
          });
          return updated;
        });
      } else {
        console.warn('[useProducts] ⚠️ Response no tiene estructura esperada:', response);
      }
      
      return response;
    } catch (err) {
      console.error('[useProducts] ❌ Error toggling product active:', err);
      console.error('[useProducts] ❌ Error details:', err.response?.data);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          'Error al cambiar estado del producto';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Subir imagen de un producto
   */
  const uploadImage = useCallback(async (id, imageFile) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useProducts] Uploading image for product:', id);
      
      const updatedProduct = await productService.uploadImage(id, imageFile);
      console.log('[useProducts] Image uploaded:', updatedProduct);
      
      // Actualizar en el estado local
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err) {
      console.error('[useProducts] Error uploading image:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          'Error al subir imagen';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar imagen de un producto
   */
  const deleteImage = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useProducts] Deleting image for product:', id);
      
      await productService.deleteImage(id);
      console.log('[useProducts] Image deleted');
      
      // Recargar el producto para obtener el estado actualizado
      const updatedProduct = await productService.getById(id);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
    } catch (err) {
      console.error('[useProducts] Error deleting image:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          'Error al eliminar imagen';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar solo el stock de un producto
   */
  const updateStock = useCallback(async (id, newStock) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useProducts] Updating stock for product:', id, 'New stock:', newStock);
      
      const updatedProduct = await productService.updateStock(id, newStock);
      console.log('[useProducts] Stock updated:', updatedProduct);
      
      // Actualizar en el estado local
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err) {
      console.error('[useProducts] Error updating stock:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          'Error al actualizar stock';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Obtener productos con stock bajo
   */
  const getLowStockProducts = useCallback(() => {
    if (!Array.isArray(products)) return [];
    return products.filter(p => p.stock > 0 && p.stock < 10);
  }, [products]);

  /**
   * Obtener productos sin stock
   */
  const getOutOfStockProducts = useCallback(() => {
    if (!Array.isArray(products)) return [];
    return products.filter(p => p.stock === 0);
  }, [products]);

  /**
   * Obtener estadísticas de stock
   */
  const getStockStats = useCallback(() => {
    if (!Array.isArray(products)) {
      return {
        total: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        totalValue: 0,
      };
    }
    
    const total = products.length;
    const inStock = products.filter(p => p.stock > 0).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock < 10).length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

    return {
      total,
      inStock,
      lowStock,
      outOfStock,
      totalValue,
    };
  }, [products]);

  return {
    // Estado
    products,
    loading,
    error,
    filters,
    
    // Filtros
    updateFilter,
    resetFilters,
    
    // CRUD
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive,  // ⭐ NUEVO: Toggle activo/inactivo
    
    // Imágenes (legacy - imagen única)
    uploadImage,
    deleteImage,
    
    // Múltiples Imágenes (nuevo)
    bulkUploadImages: productService.bulkUploadImages,
    getProductImages: productService.getProductImages,
    setImageAsPrimary: productService.setImageAsPrimary,
    reorderImages: productService.reorderImages,
    updateImageAltText: productService.updateImageAltText,
    deleteProductImage: productService.deleteProductImage,
    
    // Stock
    updateStock,
    getLowStockProducts,
    getOutOfStockProducts,
    getStockStats,
  };
};

export default useProducts;
