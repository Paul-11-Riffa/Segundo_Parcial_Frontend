// src/hooks/admin/useCategories.js
import { useState, useEffect, useCallback } from 'react';
import categoryService from '../../services/admin/categoryService';

/**
 * Hook personalizado para gestión de categorías
 */
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Cargar todas las categorías
   */
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useCategories] Fetching categories...');
      
      const data = await categoryService.getAll();
      // Asegurar que data sea un array
      const categoriesArray = Array.isArray(data) ? data : [];
      setCategories(categoriesArray);
      console.log('[useCategories] Categories loaded:', categoriesArray.length);
    } catch (err) {
      console.error('[useCategories] Error loading categories:', err);
      setError(err.response?.data?.message || 'Error al cargar categorías');
      setCategories([]); // Resetear a array vacío en caso de error
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cargar categorías al montar el componente
   */
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  /**
   * Crear una nueva categoría
   */
  const createCategory = useCallback(async (categoryData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useCategories] Creating category:', categoryData);
      
      const newCategory = await categoryService.create(categoryData);
      console.log('[useCategories] Category created:', newCategory);
      
      // Agregar al estado local
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      console.error('[useCategories] Error creating category:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          'Error al crear categoría';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar una categoría existente
   */
  const updateCategory = useCallback(async (slug, categoryData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useCategories] Updating category:', slug, categoryData);
      
      const updatedCategory = await categoryService.update(slug, categoryData);
      console.log('[useCategories] Category updated:', updatedCategory);
      
      // Actualizar en el estado local
      setCategories(prev => prev.map(c => c.slug === slug ? updatedCategory : c));
      return updatedCategory;
    } catch (err) {
      console.error('[useCategories] Error updating category:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          'Error al actualizar categoría';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar una categoría
   */
  const deleteCategory = useCallback(async (slug) => {
    try {
      setLoading(true);
      setError(null);
      console.log('[useCategories] Deleting category:', slug);
      
      await categoryService.delete(slug);
      console.log('[useCategories] Category deleted');
      
      // Eliminar del estado local
      setCategories(prev => prev.filter(c => c.slug !== slug));
    } catch (err) {
      console.error('[useCategories] Error deleting category:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error ||
                          'Error al eliminar categoría';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Buscar categoría por slug
   */
  const getCategoryBySlug = useCallback((slug) => {
    return categories.find(c => c.slug === slug);
  }, [categories]);

  /**
   * Verificar si un slug ya existe
   */
  const slugExists = useCallback((slug, excludeSlug = null) => {
    return categories.some(c => c.slug === slug && c.slug !== excludeSlug);
  }, [categories]);

  return {
    // Estado
    categories,
    loading,
    error,
    
    // Métodos
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryBySlug,
    slugExists,
  };
};

export default useCategories;
