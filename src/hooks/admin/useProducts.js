// src/hooks/admin/useProducts.js
import { useState, useEffect, useCallback } from 'react';
import productService from '../../services/admin/productService';

/**
 * Hook personalizado para gestión de productos con filtros y búsqueda
 */
export const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
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
      setLoading(true);
      setError(null);
      console.log('[useProducts] Fetching products with filters:', filters);
      
      const data = await productService.getAll(filters);
      // Asegurar que data sea un array
      const productsArray = Array.isArray(data) ? data : [];
      setProducts(productsArray);
      console.log('[useProducts] Products loaded:', productsArray.length);
    } catch (err) {
      console.error('[useProducts] Error loading products:', err);
      setError(err.response?.data?.message || 'Error al cargar productos');
      setProducts([]); // Resetear a array vacío en caso de error
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Cargar productos al montar y cuando cambien los filtros
   */
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
      
      // Recargar lista
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
      
      // Actualizar en el estado local
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
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
  }, []);

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
    
    // Imágenes
    uploadImage,
    deleteImage,
    
    // Stock
    updateStock,
    getLowStockProducts,
    getOutOfStockProducts,
    getStockStats,
  };
};

export default useProducts;
