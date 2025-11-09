import { useState } from 'react';
import { Search, Filter, RefreshCw, Trash2, CheckCheck } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { useNotificationActions } from '../../hooks/useNotificationActions';
import NotificationItem from './NotificationItem';
import { groupNotificationsByDate } from '../../utils/notificationHelpers';
import './NotificationList.css';

/**
 * Lista completa de notificaciones con filtros y acciones
 * Para usar en página dedicada /notifications
 */
const NotificationList = () => {
  const { 
    loading, 
    refreshNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications();

  const {
    searchQuery,
    selectedType,
    selectedPriority,
    showOnlyUnread,
    filteredNotifications,
    stats,
    searchNotifications,
    filterByType,
    filterByPriority,
    toggleUnreadOnly,
    clearFilters,
    handleNotificationClick
  } = useNotificationActions();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Agrupar notificaciones por fecha
  const groupedNotifications = groupNotificationsByDate(filteredNotifications);

  // Handler para refrescar
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshNotifications();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handler para selección múltiple
  const handleSelectItem = (id) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Handler para seleccionar todas
  const handleSelectAll = () => {
    if (selectedItems.size === filteredNotifications.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredNotifications.map(n => n.id)));
    }
  };

  // Handler para eliminar seleccionadas
  const handleDeleteSelected = async () => {
    if (selectedItems.size === 0) return;
    
    const confirmed = window.confirm(
      `¿Eliminar ${selectedItems.size} notificación(es)?`
    );
    
    if (confirmed) {
      try {
        await Promise.all(
          Array.from(selectedItems).map(id => deleteNotification(id))
        );
        setSelectedItems(new Set());
      } catch (error) {
        console.error('Error eliminando notificaciones:', error);
      }
    }
  };

  return (
    <div className="notification-list-container">
      {/* Header */}
      <div className="notification-list-header">
        <div className="notification-list-header-main">
          <h1 className="notification-list-title">Notificaciones</h1>
          <div className="notification-list-stats">
            <span className="notification-list-stat">
              {stats.total} total
            </span>
            {stats.unread > 0 && (
              <span className="notification-list-stat notification-list-stat-unread">
                {stats.unread} sin leer
              </span>
            )}
          </div>
        </div>

        {/* Barra de búsqueda y acciones */}
        <div className="notification-list-toolbar">
          <div className="notification-list-search">
            <Search size={18} className="notification-list-search-icon" />
            <input
              type="text"
              placeholder="Buscar notificaciones..."
              value={searchQuery}
              onChange={(e) => searchNotifications(e.target.value)}
              className="notification-list-search-input"
            />
          </div>

          <div className="notification-list-actions">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`notification-list-action-btn ${showFilters ? 'active' : ''}`}
              title="Filtros"
            >
              <Filter size={18} />
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="notification-list-action-btn"
              title="Refrescar"
            >
              <RefreshCw size={18} className={isRefreshing ? 'spin' : ''} />
            </button>

            {stats.unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="notification-list-action-btn"
                title="Marcar todas como leídas"
              >
                <CheckCheck size={18} />
              </button>
            )}

            {selectedItems.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="notification-list-action-btn notification-list-action-danger"
                title={`Eliminar ${selectedItems.size} seleccionadas`}
              >
                <Trash2 size={18} />
                <span>{selectedItems.size}</span>
              </button>
            )}
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="notification-list-filters">
            <div className="notification-list-filter-group">
              <label className="notification-list-filter-label">Tipo:</label>
              <select
                value={selectedType}
                onChange={(e) => filterByType(e.target.value)}
                className="notification-list-filter-select"
              >
                <option value="all">Todos</option>
                <option value="SALE_CREATED">Ventas</option>
                <option value="PRODUCT_LOW_STOCK">Stock Bajo</option>
                <option value="REPORT_GENERATED">Reportes</option>
                <option value="ML_PREDICTION">Predicciones</option>
                <option value="SYSTEM">Sistema</option>
              </select>
            </div>

            <div className="notification-list-filter-group">
              <label className="notification-list-filter-label">Prioridad:</label>
              <select
                value={selectedPriority}
                onChange={(e) => filterByPriority(e.target.value)}
                className="notification-list-filter-select"
              >
                <option value="all">Todas</option>
                <option value="HIGH">Alta</option>
                <option value="NORMAL">Normal</option>
                <option value="LOW">Baja</option>
              </select>
            </div>

            <label className="notification-list-filter-checkbox">
              <input
                type="checkbox"
                checked={showOnlyUnread}
                onChange={toggleUnreadOnly}
              />
              <span>Solo no leídas</span>
            </label>

            <button
              onClick={clearFilters}
              className="notification-list-filter-clear"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de notificaciones agrupadas */}
      <div className="notification-list-content">
        {loading ? (
          <div className="notification-list-loading">
            <RefreshCw size={32} className="spin" />
            <p>Cargando notificaciones...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notification-list-empty">
            <p>No se encontraron notificaciones</p>
            {(searchQuery || selectedType !== 'all' || selectedPriority !== 'all' || showOnlyUnread) && (
              <button onClick={clearFilters} className="notification-list-empty-action">
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          Object.entries(groupedNotifications).map(([date, notifications]) => (
            <div key={date} className="notification-list-group">
              <div className="notification-list-group-header">
                <h3 className="notification-list-group-title">{date}</h3>
                <span className="notification-list-group-count">
                  {notifications.length} notificaciones
                </span>
              </div>

              <div className="notification-list-group-items">
                {notifications.map((notification) => (
                  <div key={notification.id} className="notification-list-item-wrapper">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(notification.id)}
                      onChange={() => handleSelectItem(notification.id)}
                      className="notification-list-item-checkbox"
                    />
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                      onClick={handleNotificationClick}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationList;
