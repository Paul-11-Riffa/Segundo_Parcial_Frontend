import { useState, useCallback } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { getNavigationRoute } from '../utils/notificationHelpers';

/**
 * Hook personalizado para acciones avanzadas de notificaciones
 * Proporciona funcionalidades adicionales como navegación, búsqueda, paginación, etc.
 */
export const useNotificationActions = () => {
  const navigate = useNavigate();
  const {
    notifications,
    markAsRead,
    deleteNotification,
    getFilteredNotifications
  } = useNotifications();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  /**
   * Maneja el click en una notificación
   * - Marca como leída
   * - Navega a la ruta correspondiente
   */
  const handleNotificationClick = useCallback(async (notification) => {
    try {
      // Marcar como leída si no lo está
      if (!notification.is_read) {
        await markAsRead(notification.id);
      }

      // Obtener ruta de navegación según el tipo
      const route = getNavigationRoute(notification);
      
      if (route) {
        navigate(route);
        console.log(`[useNotificationActions] Navegando a: ${route}`);
      }
    } catch (error) {
      console.error('[useNotificationActions] Error al manejar click:', error);
    }
  }, [markAsRead, navigate]);

  /**
   * Elimina múltiples notificaciones
   */
  const deleteMultiple = useCallback(async (notificationIds) => {
    try {
      const promises = notificationIds.map(id => deleteNotification(id));
      await Promise.all(promises);
      console.log(`[useNotificationActions] ${notificationIds.length} notificaciones eliminadas`);
    } catch (error) {
      console.error('[useNotificationActions] Error eliminando múltiples:', error);
      throw error;
    }
  }, [deleteNotification]);

  /**
   * Obtiene notificaciones filtradas según los criterios actuales
   */
  const getFilteredResults = useCallback(() => {
    const filters = {};

    if (selectedType !== 'all') {
      filters.type = selectedType;
    }

    if (selectedPriority !== 'all') {
      filters.priority = selectedPriority;
    }

    if (showOnlyUnread) {
      filters.is_read = false;
    }

    if (searchQuery.trim()) {
      filters.search = searchQuery.trim();
    }

    return getFilteredNotifications(filters);
  }, [selectedType, selectedPriority, showOnlyUnread, searchQuery, getFilteredNotifications]);

  /**
   * Busca notificaciones por texto
   */
  const searchNotifications = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  /**
   * Filtra por tipo de notificación
   */
  const filterByType = useCallback((type) => {
    setSelectedType(type);
  }, []);

  /**
   * Filtra por prioridad
   */
  const filterByPriority = useCallback((priority) => {
    setSelectedPriority(priority);
  }, []);

  /**
   * Toggle para mostrar solo no leídas
   */
  const toggleUnreadOnly = useCallback(() => {
    setShowOnlyUnread(prev => !prev);
  }, []);

  /**
   * Limpia todos los filtros
   */
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedPriority('all');
    setShowOnlyUnread(false);
  }, []);

  /**
   * Obtiene estadísticas de notificaciones
   */
  const getStats = useCallback(() => {
    const total = notifications.length;
    const unread = notifications.filter(n => !n.is_read).length;
    const byType = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {});
    const byPriority = notifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, {});

    return {
      total,
      unread,
      read: total - unread,
      byType,
      byPriority
    };
  }, [notifications]);

  return {
    // Estado de filtros
    searchQuery,
    selectedType,
    selectedPriority,
    showOnlyUnread,

    // Acciones
    handleNotificationClick,
    deleteMultiple,
    searchNotifications,
    filterByType,
    filterByPriority,
    toggleUnreadOnly,
    clearFilters,

    // Datos procesados
    filteredNotifications: getFilteredResults(),
    stats: getStats()
  };
};

export default useNotificationActions;
