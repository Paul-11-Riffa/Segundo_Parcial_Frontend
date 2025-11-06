import { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import useUsers from '../../../hooks/admin/useUsers';
import UserForm from './UserForm';
import ConfirmDialog from '../../../components/admin/ConfirmDialog';

/**
 * UsersList - Componente principal para gestión de usuarios
 * Tabla con CRUD completo, búsqueda y filtros
 */
const UsersList = () => {
  try {
    console.log('[UsersList] Component rendering...');
    
    const {
      users = [],  // Default to empty array
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
    
    console.log('[UsersList] Hook data:', { 
      usersCount: users?.length || 0, 
      loading, 
      error,
      usersType: typeof users,
      isArray: Array.isArray(users)
    });

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
      // Actualizar
      const result = await updateUser(editingUser.id, userData);
      if (result.success) {
        handleCloseForm();
      }
      return result;
    } else {
      // Crear
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

  // Badge de rol con mejor contraste
  const RoleBadge = ({ role }) => {
    const isAdmin = role === 'ADMIN';
    return (
      <span className={`
        inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide
        ${isAdmin 
          ? 'bg-purple-100 text-purple-800 border-2 border-purple-300' 
          : 'bg-blue-100 text-blue-800 border-2 border-blue-300'
        }
      `}>
        {isAdmin ? (
          <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        )}
        {role}
      </span>
    );
  };

  // Badge de estado con mejor contraste
  const StatusBadge = ({ isActive }) => {
    return isActive ? (
      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-green-100 text-green-800 border-2 border-green-300">
        <CheckCircleIcon className="h-4 w-4 mr-1.5" />
        ACTIVE
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-red-100 text-red-800 border-2 border-red-300">
        <XCircleIcon className="h-4 w-4 mr-1.5" />
        INACTIVE
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Users Management
          </h1>
          <p className="text-sm text-gray-500 mt-2 flex items-center">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Manage system users and their roles
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="font-semibold">New User</span>
        </button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Búsqueda */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
            </div>
            <input
              type="text"
              placeholder="Search by username, email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 hover:border-blue-300 text-sm font-medium text-gray-700 placeholder-gray-400 bg-gray-50 hover:bg-white focus:bg-white shadow-sm"
            />
          </div>

          {/* Filtro de Rol */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
              <svg className="h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-400 focus:border-purple-400 appearance-none bg-gray-50 hover:bg-white focus:bg-white cursor-pointer transition-all duration-200 hover:border-purple-300 text-sm font-semibold text-gray-700 shadow-sm"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
              }}
            >
              <option value="ALL">All Roles</option>
              <option value="ADMIN">👑 Admin</option>
              <option value="CLIENT">👤 Client</option>
            </select>
          </div>

          {/* Filtro de Estado */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
              <svg className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 appearance-none bg-gray-50 hover:bg-white focus:bg-white cursor-pointer transition-all duration-200 hover:border-green-300 text-sm font-semibold text-gray-700 shadow-sm"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                backgroundPosition: 'right 0.5rem center',
                backgroundRepeat: 'no-repeat',
                backgroundSize: '1.5em 1.5em',
              }}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">✅ Active</option>
              <option value="INACTIVE">❌ Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-xl shadow-md">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="font-semibold">Error:</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
              <p className="text-gray-600 font-medium">Loading users...</p>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-gray-500 text-lg font-medium mb-2">No users found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className={`
                      transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 
                      ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                    `}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 font-bold text-sm border border-gray-300">
                        {user.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-11 w-11">
                          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-md border-2 border-white ring-2 ring-gray-200">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700 flex items-center font-medium">
                        <svg className="h-4 w-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-800 font-semibold">
                        {user.first_name || user.last_name 
                          ? `${user.first_name} ${user.last_name}`.trim()
                          : <span className="text-gray-400 italic font-normal">No name</span>
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <RoleBadge role={user.profile?.role || 'CLIENT'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge isActive={user.is_active} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="group relative p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-600 rounded-lg transition-all duration-200 hover:shadow-lg border border-blue-200 hover:border-blue-600"
                          title="Edit user"
                        >
                          <PencilIcon className="h-5 w-5 group-hover:text-white transition-colors" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="group relative p-2.5 text-red-600 bg-red-50 hover:bg-red-600 rounded-lg transition-all duration-200 hover:shadow-lg border border-red-200 hover:border-red-600"
                          title="Delete user"
                        >
                          <TrashIcon className="h-5 w-5 group-hover:text-white transition-colors" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Contador de resultados */}
        {!loading && users.length > 0 && (
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-t-2 border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700 font-medium">
                Showing <span className="font-bold text-blue-600 text-lg">{users.length}</span> user{users.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Active users
                </span>
              </div>
            </div>
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
        <div className="max-w-6xl mx-auto">
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
      </div>
    );
  }
};

export default UsersList;
