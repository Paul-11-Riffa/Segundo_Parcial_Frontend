import { useState, useEffect, useCallback } from 'react';
import userService from '../../services/admin/userService';

/**
 * useUsers - Custom hook para gestionar el estado de usuarios
 * Proporciona funciones CRUD y manejo de estado
 */
const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // ALL, ADMIN, CLIENT
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE

  /**
   * Obtener lista de usuarios
   */
  const fetchUsers = useCallback(async () => {
    console.log('[useUsers] Fetching users...');
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers();
      console.log('[useUsers] RAW DATA TYPE:', typeof data);
      console.log('[useUsers] RAW DATA:', data);
      console.log('[useUsers] IS ARRAY?:', Array.isArray(data));
      console.log('[useUsers] DATA KEYS:', data ? Object.keys(data) : 'null');
      
      // Manejar diferentes formatos de respuesta
      let usersArray = [];
      
      if (Array.isArray(data)) {
        // Si ya es un array, usarlo directamente
        usersArray = data;
      } else if (data && typeof data === 'object') {
        // Si es un objeto, podría tener una propiedad 'results', 'users', o 'data'
        if (Array.isArray(data.results)) {
          console.log('[useUsers] Found data.results array');
          usersArray = data.results;
        } else if (Array.isArray(data.users)) {
          console.log('[useUsers] Found data.users array');
          usersArray = data.users;
        } else if (Array.isArray(data.data)) {
          console.log('[useUsers] Found data.data array');
          usersArray = data.data;
        } else {
          console.error('[useUsers] Unknown data structure:', data);
          throw new Error('Invalid data structure: could not find users array');
        }
      } else {
        throw new Error('Invalid data structure: expected array or object with users');
      }
      
      console.log('[useUsers] Users count:', usersArray.length);
      setUsers(usersArray);
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Error loading users';
      console.error('[useUsers] Error fetching users:', err);
      console.error('[useUsers] Error response:', err.response);
      setError(errorMsg);
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crear nuevo usuario
   */
  const createUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await userService.createUser(userData);
      setUsers(prevUsers => [...prevUsers, newUser]);
      return { success: true, data: newUser };
    } catch (err) {
      const errorMessage = err.response?.data?.username?.[0] 
        || err.response?.data?.email?.[0]
        || err.response?.data?.detail 
        || 'Error creating user';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar usuario existente
   */
  const updateUser = async (userId, userData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await userService.updateUser(userId, userData);
      setUsers(prevUsers => 
        prevUsers.map(user => user.id === userId ? updatedUser : user)
      );
      return { success: true, data: updatedUser };
    } catch (err) {
      const errorMessage = err.response?.data?.username?.[0] 
        || err.response?.data?.email?.[0]
        || err.response?.data?.detail 
        || 'Error updating user';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar usuario
   */
  const deleteUser = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      await userService.deleteUser(userId);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error 
        || err.response?.data?.detail 
        || 'Error deleting user';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtrar usuarios según búsqueda y filtros
   */
  const filteredUsers = users.filter(user => {
    try {
      // Validar que el usuario tiene la estructura necesaria
      if (!user || !user.username) {
        console.warn('Usuario inválido encontrado:', user);
        return false;
      }

      // Filtro de búsqueda
      const matchesSearch = searchTerm === '' || 
        user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro de rol - con validación robusta
      const userRole = user.profile?.role || 'CLIENT'; // Default to CLIENT if no role
      const matchesRole = roleFilter === 'ALL' || userRole === roleFilter;

      // Filtro de estado
      const matchesStatus = statusFilter === 'ALL' || 
        (statusFilter === 'ACTIVE' && user.is_active) ||
        (statusFilter === 'INACTIVE' && !user.is_active);

      return matchesSearch && matchesRole && matchesStatus;
    } catch (err) {
      console.error('Error filtering user:', user, err);
      return false;
    }
  });

  /**
   * Cargar usuarios al montar el componente
   */
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users: filteredUsers,
    allUsers: users,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
};

export default useUsers;
