import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  Cog6ToothIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import useUsers from '../../../hooks/admin/useUsers';
import UserForm from './UserForm';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';
import './UsersList.css';

/**
 * UsersList - Gestión de usuarios con diseño moderno en tabla
 */
const UsersList = () => {
  try {
    const {
      users = [],
      loading,
      error,
      searchTerm,
      setSearchTerm,
      roleFilter,
      setRoleFilter,
      statusFilter,
      setStatusFilter,
      createUser,
      updateUser,
      deleteUser,
    } = useUsers();

  // Estados del modal de formulario
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Estados del dialog de confirmación
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Abrir modal para crear usuario
  const handleCreate = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  // Abrir modal para editar usuario
  const handleEdit = (user) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  // Cerrar modal
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  // Submit del formulario (crear o actualizar)
  const handleSubmit = async (userData) => {
    if (editingUser) {
      const result = await updateUser(editingUser.id, userData);
      if (result.success) {
        handleCloseForm();
      }
      return result;
    } else {
      const result = await createUser(userData);
      if (result.success) {
        handleCloseForm();
      }
      return result;
    }
  };

  // Abrir confirmación de eliminación
  const handleDeleteClick = (user) => {
    setDeletingUser(user);
    setIsConfirmOpen(true);
  };

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!deletingUser) return;

    setDeleteLoading(true);
    const result = await deleteUser(deletingUser.id);
    setDeleteLoading(false);

    if (result.success) {
      setIsConfirmOpen(false);
      setDeletingUser(null);
    }
  };

  // Cancelar eliminación
  const handleCancelDelete = () => {
    setIsConfirmOpen(false);
    setDeletingUser(null);
  };

  // Badge de rol con nuevo diseño
  const RoleBadge = ({ role }) => {
    const isAdmin = role === 'ADMIN';
    return (
      <span className={`user-badge ${isAdmin ? 'role-admin' : 'role-client'}`}>
        {isAdmin ? (
          <Cog6ToothIcon className="user-badge-icon" />
        ) : (
          <UserIcon className="user-badge-icon" />
        )}
        {role}
      </span>
    );
  };

  // Badge de estado con nuevo diseño
  const StatusBadge = ({ isActive }) => {
    return (
      <span className={`user-badge ${isActive ? 'status-active' : 'status-inactive'}`}>
        <span className="user-status-dot"></span>
        {isActive ? 'ACTIVE' : 'INACTIVE'}
      </span>
    );
  };

  return (
    <div className="users-container">
      {/* Header */}
      <div className="users-header">
        <div className="users-header-content">
          <div>
            <h1 className="users-title">Users Management</h1>
            <p className="users-subtitle">Manage system users and their roles</p>
          </div>
          <button onClick={handleCreate} className="users-create-button">
            <PlusIcon />
            <span>New User</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="users-error">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Toolbar - Búsqueda y Filtros */}
      <div className="users-toolbar">
        <div className="users-search-wrapper">
          <MagnifyingGlassIcon className="users-search-icon" />
          <input
            type="text"
            placeholder="Search by username, email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="users-search-input"
          />
        </div>

        <div className="users-filters">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="users-filter-select"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="CLIENT">Client</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="users-filter-select"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Content - Tabla de usuarios */}
      <div className="users-content">
        {loading ? (
          <div className="users-loading">
            <div className="users-loading-spinner"></div>
            <p className="users-loading-text">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="users-empty">
            <div className="users-empty-icon">
              <UserIcon />
            </div>
            <h3 className="users-empty-title">No users found</h3>
            <p className="users-empty-description">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="users-table-actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <span className="user-table-id">#{user.id}</span>
                    </td>
                    <td>
                      <div className="user-table-user">
                        <div className="user-table-avatar">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="user-table-username">{user.username}</span>
                      </div>
                    </td>
                    <td>
                      <span className="user-table-email">{user.email}</span>
                    </td>
                    <td>
                      <span className="user-table-name">
                        {user.first_name || user.last_name
                          ? `${user.first_name} ${user.last_name}`.trim()
                          : <span className="user-table-no-data">No name</span>
                        }
                      </span>
                    </td>
                    <td>
                      <RoleBadge role={user.profile?.role || 'CLIENT'} />
                    </td>
                    <td>
                      <StatusBadge isActive={user.is_active} />
                    </td>
                    <td>
                      <div className="user-table-actions">
                        <button
                          onClick={() => handleEdit(user)}
                          className="user-action-button edit"
                          title="Edit user"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="user-action-button delete"
                          title="Delete user"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Formulario */}
      <UserForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        user={editingUser}
        loading={loading}
      />

      {/* Dialog de Confirmación */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to delete user "${deletingUser?.username}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
  } catch (error) {
    console.error('Error rendering UsersList:', error);
    return (
      <div className="users-container">
        <div className="users-error">
          <p className="font-medium">Error Loading Users Module</p>
          <p className="text-sm mt-1">{error.message || 'An unexpected error occurred'}</p>
          <button
            onClick={() => window.location.reload()}
            className="users-create-button"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default UsersList;
