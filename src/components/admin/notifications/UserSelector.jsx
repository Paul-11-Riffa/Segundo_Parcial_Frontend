import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import './UserSelector.css';

/**
 * Selector de usuarios con búsqueda, filtro por rol y selección múltiple
 * Permite seleccionar uno o varios usuarios para enviar notificaciones
 */
const UserSelector = ({ users, selectedUserIds, onChange, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL', 'ADMIN', 'CLIENT'

  // Obtener rol desde profile.role o is_staff
  const getUserRoleType = (user) => {
    // Intentar obtener desde profile.role
    if (user.profile && user.profile.role) {
      return user.profile.role; // 'ADMIN', 'CLIENT', 'SUPER_ADMIN'
    }
    // Fallback a is_staff/is_superuser
    if (user.is_superuser) return 'SUPER_ADMIN';
    if (user.is_staff) return 'ADMIN';
    return 'CLIENT';
  };

  // Filtrar usuarios según el término de búsqueda y rol
  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filtrar por rol
    if (roleFilter === 'ADMIN') {
      filtered = filtered.filter(user => {
        const roleType = getUserRoleType(user);
        return roleType === 'ADMIN' || roleType === 'SUPER_ADMIN';
      });
    } else if (roleFilter === 'CLIENT') {
      filtered = filtered.filter(user => {
        const roleType = getUserRoleType(user);
        return roleType === 'CLIENT';
      });
    }

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user => {
        const username = user.username?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';
        const firstName = user.first_name?.toLowerCase() || '';
        const lastName = user.last_name?.toLowerCase() || '';
        const fullName = `${firstName} ${lastName}`.trim().toLowerCase();
        
        return username.includes(term) ||
               email.includes(term) ||
               firstName.includes(term) ||
               lastName.includes(term) ||
               fullName.includes(term);
      });
    }

    return filtered;
  }, [users, searchTerm, roleFilter]);

  // Toggle de un usuario específico
  const toggleUser = (userId) => {
    if (selectedUserIds.includes(userId)) {
      onChange(selectedUserIds.filter(id => id !== userId));
    } else {
      onChange([...selectedUserIds, userId]);
    }
  };

  // Seleccionar todos los usuarios filtrados
  const selectAll = () => {
    const allIds = filteredUsers.map(user => user.id);
    // Combinar los ya seleccionados con los nuevos (sin duplicados)
    const combined = [...new Set([...selectedUserIds, ...allIds])];
    onChange(combined);
  };

  // Deseleccionar todos
  const deselectAll = () => {
    onChange([]);
  };

  // Obtener el nombre para mostrar
  const getUserDisplayName = (user) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.username;
  };

  // Obtener el rol del usuario para mostrar
  const getUserRole = (user) => {
    const roleType = getUserRoleType(user);
    
    // Debug: ver qué rol se detectó
    if (users.indexOf(user) < 3) { // Solo log de los primeros 3 usuarios
      console.log('👤 Usuario:', user.username, '→ Rol detectado:', roleType);
    }
    
    switch (roleType) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'ADMIN':
        return 'Admin';
      case 'CLIENT':
      default:
        return 'Cliente';
    }
  };

  // Obtener el badge de rol
  const getRoleBadge = (user) => {
    const roleType = getUserRoleType(user);
    
    switch (roleType) {
      case 'SUPER_ADMIN':
        return 'user-role-badge-superadmin';
      case 'ADMIN':
        return 'user-role-badge-admin';
      case 'CLIENT':
      default:
        return 'user-role-badge-client';
    }
  };

  // Calcular contadores por rol
  const adminCount = users.filter(u => {
    const roleType = getUserRoleType(u);
    return roleType === 'ADMIN' || roleType === 'SUPER_ADMIN';
  }).length;

  const clientCount = users.filter(u => {
    const roleType = getUserRoleType(u);
    return roleType === 'CLIENT';
  }).length;

  // Loading state
  if (isLoading) {
    return (
      <div className="user-selector-loading">
        <div className="user-selector-spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  return (
    <div className="user-selector">
      {/* Filtro por rol */}
      <div className="user-selector-role-filter">
        <button
          type="button"
          onClick={() => setRoleFilter('ALL')}
          className={`user-selector-role-btn ${roleFilter === 'ALL' ? 'active' : ''}`}
        >
          👥 Todos ({users.length})
        </button>
        <button
          type="button"
          onClick={() => setRoleFilter('ADMIN')}
          className={`user-selector-role-btn ${roleFilter === 'ADMIN' ? 'active' : ''}`}
        >
          🛡️ Administradores ({adminCount})
        </button>
        <button
          type="button"
          onClick={() => setRoleFilter('CLIENT')}
          className={`user-selector-role-btn ${roleFilter === 'CLIENT' ? 'active' : ''}`}
        >
          👤 Clientes ({clientCount})
        </button>
      </div>

      {/* Campo de búsqueda */}
      <div className="user-selector-search-container">
        <span className="user-selector-search-icon">🔍</span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre, username o email..."
          className="user-selector-search-input"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="user-selector-search-clear"
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>

      {/* Botones de acción */}
      <div className="user-selector-actions">
        <button
          type="button"
          onClick={selectAll}
          className="user-selector-action-btn"
          disabled={filteredUsers.length === 0}
        >
          Seleccionar todos
        </button>
        <button
          type="button"
          onClick={deselectAll}
          className="user-selector-action-btn"
          disabled={selectedUserIds.length === 0}
        >
          Deseleccionar todos
        </button>
      </div>

      {/* Lista de usuarios */}
      <div className="user-selector-list">
        {filteredUsers.length === 0 ? (
          <div className="user-selector-empty">
            <p className="user-selector-empty-icon">👤</p>
            <p className="user-selector-empty-text">
              {searchTerm 
                ? `No se encontraron usuarios con "${searchTerm}"`
                : 'No hay usuarios disponibles'}
            </p>
          </div>
        ) : (
          filteredUsers.map(user => (
            <label
              key={user.id}
              className={`user-selector-item ${
                selectedUserIds.includes(user.id) ? 'selected' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={selectedUserIds.includes(user.id)}
                onChange={() => toggleUser(user.id)}
                className="user-selector-checkbox"
              />
              <div className="user-selector-user-info">
                <div className="user-selector-avatar">
                  {getUserDisplayName(user).charAt(0).toUpperCase()}
                </div>
                <div className="user-selector-details">
                  <div className="user-selector-name-row">
                    <p className="user-selector-name">
                      {getUserDisplayName(user)}
                    </p>
                    <span className={`user-selector-role-badge ${getRoleBadge(user)}`}>
                      {getUserRole(user)}
                    </span>
                  </div>
                  <p className="user-selector-email">{user.email}</p>
                  {user.username !== user.email && (
                    <p className="user-selector-username">@{user.username}</p>
                  )}
                </div>
              </div>
            </label>
          ))
        )}
      </div>

      {/* Contador */}
      <div className="user-selector-counter">
        <span className="user-selector-counter-badge">
          {selectedUserIds.length}
        </span>
        <span className="user-selector-counter-text">
          usuario{selectedUserIds.length !== 1 ? 's' : ''} seleccionado{selectedUserIds.length !== 1 ? 's' : ''}
        </span>
        {filteredUsers.length < users.length && (
          <span className="user-selector-counter-filter">
            (mostrando {filteredUsers.length} de {users.length})
          </span>
        )}
      </div>
    </div>
  );
};

UserSelector.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      username: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      first_name: PropTypes.string,
      last_name: PropTypes.string,
    })
  ).isRequired,
  selectedUserIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

UserSelector.defaultProps = {
  isLoading: false,
};

export default UserSelector;
