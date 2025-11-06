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

/**
 * UsersList - Gestión de usuarios con diseño profesional limpio
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

  // Badge de rol - SIMPLE
  const RoleBadge = ({ role }) => {
    const isAdmin = role === 'ADMIN';
    return (
      <span className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
        ${isAdmin
          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
          : 'bg-blue-50 text-blue-700 border border-blue-200'
        }
      `}>
        {isAdmin ? (
          <Cog6ToothIcon className="h-3.5 w-3.5 mr-1.5" />
        ) : (
          <UserIcon className="h-3.5 w-3.5 mr-1.5" />
        )}
        {role}
      </span>
    );
  };

  // Badge de estado - SIMPLE
  const StatusBadge = ({ isActive }) => {
    return (
      <span className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
        ${isActive
          ? 'bg-green-50 text-green-700 border border-green-200'
          : 'bg-red-50 text-red-700 border border-red-200'
        }
      `}>
        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
        {isActive ? 'ACTIVE' : 'INACTIVE'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header - Flotando sobre fondo gris */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Users Management</h1>
            <p className="text-gray-600">Manage system users and their roles</p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200 font-semibold text-sm"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            <span>New User</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-semibold">Error: {error}</p>
        </div>
      )}

      {/* TARJETA PRINCIPAL: Herramientas + Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">

        {/* Herramientas: Búsqueda y Filtros - UNA SOLA LÍNEA */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4">
            {/* Búsqueda - Izquierda */}
            <div className="flex-1 max-w-md relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by username, email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors duration-200"
              />
            </div>

            {/* Filtros - Derecha */}
            <div className="flex items-center gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-white cursor-pointer transition-colors duration-200 hover:border-gray-400"
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="CLIENT">Client</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-white cursor-pointer transition-colors duration-200 hover:border-gray-400"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla de Usuarios */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600 mb-3"></div>
                <p className="text-gray-600">Loading users...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-gray-500 font-medium">No users found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <table className="w-full">
              {/* Cabecera - Fondo gris claro, texto semibold */}
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              {/* Cuerpo - Solo bordes horizontales */}
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {user.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm mr-3">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{user.email}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {user.first_name || user.last_name
                          ? `${user.first_name} ${user.last_name}`.trim()
                          : <span className="text-gray-400 italic">No name</span>
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={user.profile?.role || 'CLIENT'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge isActive={user.is_active} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                          title="Edit user"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                          title="Delete user"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer - Contador */}
        {!loading && users.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{users.length}</span> user{users.length !== 1 ? 's' : ''}
            </p>
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
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <p className="font-medium">Error Loading Users Module</p>
          <p className="text-sm mt-1">{error.message || 'An unexpected error occurred'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default UsersList;
