/**
 * Notification Helpers
 * 
 * Utilidades para formatear, procesar y manejar notificaciones
 * 
 * @module utils/notificationHelpers
 */

// ============================================================
// ÍCONOS Y ESTILOS POR TIPO
// ============================================================

/**
 * Obtiene el ícono emoji apropiado según el tipo de notificación
 * 
 * @param {string} notificationType - Tipo de notificación
 * @returns {string} Emoji
 */
export function getNotificationIcon(notificationType) {
  const icons = {
    'SALE_CREATED': '💰',
    'SALE_UPDATED': '📝',
    'SALE_DELETED': '🗑️',
    'PRODUCT_LOW_STOCK': '⚠️',
    'PRODUCT_CREATED': '🆕',
    'PRODUCT_UPDATED': '✏️',
    'REPORT_GENERATED': '📊',
    'ML_PREDICTION': '🤖',
    'SYSTEM': '🔧',
    'CUSTOM': '📢'
  };
  
  return icons[notificationType] || '🔔';
}

/**
 * Obtiene la clase de color apropiada según el tipo
 * 
 * @param {string} notificationType - Tipo de notificación
 * @returns {string} Nombre de clase CSS
 */
export function getNotificationColor(notificationType) {
  const colors = {
    'SALE_CREATED': 'success',      // Verde
    'SALE_UPDATED': 'info',         // Azul
    'SALE_DELETED': 'danger',       // Rojo
    'PRODUCT_LOW_STOCK': 'warning', // Amarillo/Naranja
    'PRODUCT_CREATED': 'success',   // Verde
    'PRODUCT_UPDATED': 'info',      // Azul
    'REPORT_GENERATED': 'info',     // Azul
    'ML_PREDICTION': 'primary',     // Azul oscuro
    'SYSTEM': 'secondary',          // Gris
    'CUSTOM': 'default'             // Default
  };
  
  return colors[notificationType] || 'default';
}

/**
 * Obtiene la prioridad visual de una notificación
 * 
 * @param {string} notificationType - Tipo de notificación
 * @returns {string} 'high' | 'medium' | 'low'
 */
export function getNotificationPriority(notificationType) {
  const highPriority = ['PRODUCT_LOW_STOCK', 'SYSTEM'];
  const mediumPriority = ['SALE_CREATED', 'REPORT_GENERATED', 'ML_PREDICTION'];
  
  if (highPriority.includes(notificationType)) return 'high';
  if (mediumPriority.includes(notificationType)) return 'medium';
  return 'low';
}

/**
 * Obtiene el color según la prioridad de la notificación
 */
export function getPriorityColor(priority) {
  const colors = {
    HIGH: '#ef4444',    // red-500
    NORMAL: '#3b82f6',  // blue-500
    LOW: '#6b7280'      // gray-500
  };
  
  return colors[priority] || colors.NORMAL;
}

// ============================================================
// FORMATEO DE FECHAS
// ============================================================

/**
 * Formatea una fecha para mostrar en notificaciones
 * Muestra tiempo relativo (ej: "Hace 5 minutos")
 * 
 * @param {string|Date} dateString - Fecha en formato ISO o Date object
 * @returns {string} Fecha formateada
 */
export function formatNotificationDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) {
    return 'Justo ahora';
  } else if (diffMins < 60) {
    return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  } else if (diffDays < 7) {
    return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  } else {
    // Formato: "8 Nov 2025"
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  }
}

/**
 * Formatea una fecha completa
 * 
 * @param {string|Date} dateString - Fecha en formato ISO o Date object
 * @returns {string} Fecha formateada (ej: "8 de noviembre de 2025, 14:30")
 */
export function formatFullDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ============================================================
// NAVEGACIÓN CONTEXTUAL
// ============================================================

/**
 * Determina la ruta a la que navegar según el tipo y datos de la notificación
 * 
 * @param {Object} notification - Objeto de notificación
 * @returns {string} Ruta de navegación
 */
export function getNavigationRoute(notification) {
  const { notification_type, data } = notification;
  
  // Mapeo de tipos a rutas
  const routeMap = {
    'SALE_CREATED': () => {
      if (data?.order_id) return `/admin/sales/orders`;
      return '/admin/sales';
    },
    'SALE_UPDATED': () => {
      if (data?.order_id) return `/admin/sales/orders`;
      return '/admin/sales';
    },
    'SALE_DELETED': () => '/admin/sales',
    
    'PRODUCT_LOW_STOCK': () => {
      if (data?.product_id) return `/admin/inventory/products`;
      return '/admin/inventory';
    },
    'PRODUCT_CREATED': () => {
      if (data?.product_id) return `/admin/inventory/products`;
      return '/admin/inventory';
    },
    'PRODUCT_UPDATED': () => {
      if (data?.product_id) return `/admin/inventory/products`;
      return '/admin/inventory';
    },
    
    'REPORT_GENERATED': () => {
      if (data?.report_url) return data.report_url;
      if (data?.report_type) return `/reports`;
      return '/reports';
    },
    
    'ML_PREDICTION': () => {
      if (data?.prediction_id) return `/predictions`;
      return '/dashboard';
    },
    
    'SYSTEM': () => '/dashboard',
    'CUSTOM': () => data?.redirect_url || '/notifications'
  };
  
  const routeFunction = routeMap[notification_type];
  return routeFunction ? routeFunction() : '/notifications';
}

/**
 * Maneja el clic en una notificación
 * 
 * @param {Object} notification - Objeto de notificación
 * @param {Function} navigate - Función de navegación (ej: useNavigate de React Router)
 * @param {Function} markAsRead - Función para marcar como leída
 */
export async function handleNotificationClick(notification, navigate, markAsRead) {
  try {
    // Marcar como leída si no está leída
    if (!notification.is_read && markAsRead) {
      await markAsRead(notification.id);
    }
    
    // Navegar a la ruta apropiada
    const route = getNavigationRoute(notification);
    if (navigate) {
      navigate(route);
    }
  } catch (error) {
    console.error('❌ Error al manejar clic en notificación:', error);
  }
}

// ============================================================
// AGRUPACIÓN Y FILTRADO
// ============================================================

/**
 * Agrupa notificaciones por fecha
 * 
 * @param {Array} notifications - Array de notificaciones
 * @returns {Object} Notificaciones agrupadas por fecha
 */
export function groupNotificationsByDate(notifications) {
  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: []
  };
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  notifications.forEach(notification => {
    const notifDate = new Date(notification.created_at);
    const notifDay = new Date(notifDate.getFullYear(), notifDate.getMonth(), notifDate.getDate());
    
    if (notifDay.getTime() === today.getTime()) {
      groups.today.push(notification);
    } else if (notifDay.getTime() === yesterday.getTime()) {
      groups.yesterday.push(notification);
    } else if (notifDate >= weekAgo) {
      groups.thisWeek.push(notification);
    } else {
      groups.older.push(notification);
    }
  });
  
  return groups;
}

/**
 * Filtra notificaciones por tipo
 * 
 * @param {Array} notifications - Array de notificaciones
 * @param {string} type - Tipo de notificación a filtrar
 * @returns {Array} Notificaciones filtradas
 */
export function filterNotificationsByType(notifications, type) {
  if (!type || type === 'ALL') {
    return notifications;
  }
  return notifications.filter(n => n.notification_type === type);
}

/**
 * Filtra notificaciones por estado de lectura
 * 
 * @param {Array} notifications - Array de notificaciones
 * @param {boolean} unreadOnly - Si true, solo devuelve no leídas
 * @returns {Array} Notificaciones filtradas
 */
export function filterNotificationsByReadStatus(notifications, unreadOnly = false) {
  if (!unreadOnly) {
    return notifications;
  }
  return notifications.filter(n => !n.is_read);
}

/**
 * Filtra notificaciones con múltiples criterios
 */
export function filterNotifications(notifications, filters = {}) {
  let filtered = [...notifications];

  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(n => n.type === filters.type);
  }

  if (filters.priority && filters.priority !== 'all') {
    filtered = filtered.filter(n => n.priority === filters.priority);
  }

  if (filters.is_read !== undefined) {
    filtered = filtered.filter(n => n.is_read === filters.is_read);
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(n => 
      n.title?.toLowerCase().includes(searchLower) ||
      n.body?.toLowerCase().includes(searchLower)
    );
  }

  return filtered;
}

/**
 * Ordena notificaciones por fecha
 */
export function sortNotifications(notifications, order = 'desc') {
  return [...notifications].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}

// ============================================================
// VALIDACIÓN Y SANITIZACIÓN
// ============================================================

/**
 * Valida si un objeto es una notificación válida
 * 
 * @param {Object} notification - Objeto a validar
 * @returns {boolean} True si es válida
 */
export function isValidNotification(notification) {
  if (!notification || typeof notification !== 'object') {
    return false;
  }
  
  const requiredFields = ['id', 'notification_type', 'title', 'body', 'created_at'];
  return requiredFields.every(field => field in notification);
}

/**
 * Sanitiza el contenido de una notificación para mostrar
 * 
 * @param {string} text - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
export function sanitizeNotificationText(text) {
  if (!text) return '';
  
  // Remover HTML tags
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================
// UTILIDADES DE SONIDO
// ============================================================

/**
 * Reproduce un sonido de notificación
 * 
 * @param {string} soundType - Tipo de sonido ('default', 'success', 'warning', 'error')
 */
export function playNotificationSound(soundType = 'default') {
  try {
    // Puedes agregar archivos de sonido en /public/sounds/
    const soundMap = {
      'default': '/sounds/notification.mp3',
      'success': '/sounds/success.mp3',
      'warning': '/sounds/warning.mp3',
      'error': '/sounds/error.mp3'
    };
    
    const soundPath = soundMap[soundType] || soundMap['default'];
    const audio = new Audio(soundPath);
    audio.volume = 0.3; // Volumen al 30%
    audio.play().catch(err => {
      // Ignorar errores de reproducción (usuario puede no haber interactuado con la página)
      console.debug('No se pudo reproducir sonido:', err.message);
    });
  } catch (error) {
    console.debug('Error al reproducir sonido:', error);
  }
}

// ============================================================
// ESTADÍSTICAS Y ANÁLISIS
// ============================================================

/**
 * Calcula estadísticas de un array de notificaciones
 * 
 * @param {Array} notifications - Array de notificaciones
 * @returns {Object} Objeto con estadísticas
 */
export function calculateNotificationStats(notifications) {
  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.is_read).length,
    byType: {},
    byPriority: {
      high: 0,
      medium: 0,
      low: 0
    }
  };
  
  notifications.forEach(notification => {
    // Contar por tipo
    const type = notification.notification_type;
    stats.byType[type] = (stats.byType[type] || 0) + 1;
    
    // Contar por prioridad
    const priority = getNotificationPriority(type);
    stats.byPriority[priority]++;
  });
  
  return stats;
}

// ============================================================
// DEBOUNCE Y THROTTLE
// ============================================================

/**
 * Crea una función debounced
 * 
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {Function} Función debounced
 */
export function debounce(func, wait) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Crea una función throttled
 * 
 * @param {Function} func - Función a ejecutar
 * @param {number} limit - Tiempo mínimo entre ejecuciones en ms
 * @returns {Function} Función throttled
 */
export function throttle(func, limit) {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
