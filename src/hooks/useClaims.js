import { useState, useEffect, useCallback } from 'react';
import claimService from '../services/claimService';

/**
 * Hook personalizado para gestionar reclamos
 * Simplifica el uso del claimService en componentes
 */
export const useClaims = (filters = {}) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClaims = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await claimService.getClaims(filters);
      setClaims(data.results || data);
    } catch (err) {
      console.error('Error loading claims:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  return { claims, loading, error, reload: loadClaims };
};

/**
 * Hook para un reclamo específico
 */
export const useClaim = (claimId) => {
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadClaim = useCallback(async () => {
    if (!claimId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await claimService.getClaimDetail(claimId);
      setClaim(data);
    } catch (err) {
      console.error('Error loading claim:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [claimId]);

  useEffect(() => {
    loadClaim();
  }, [loadClaim]);

  return { claim, loading, error, reload: loadClaim };
};

/**
 * Hook para estadísticas de reclamos (Admin)
 */
export const useClaimStatistics = (period = 30) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await claimService.getStatistics({ days: period });
      setStats(data);
    } catch (err) {
      console.error('Error loading statistics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, loading, error, reload: loadStats };
};

/**
 * Hook para crear un reclamo
 */
export const useCreateClaim = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createClaim = async (claimData, images) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await claimService.createClaim(claimData, images);
      setSuccess(true);
      return result;
    } catch (err) {
      console.error('Error creating claim:', err);
      let errorMessage = 'Error al crear reclamo';
      
      try {
        const errorData = JSON.parse(err.message);
        errorMessage = Object.values(errorData).flat().join(', ');
      } catch {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createClaim, loading, error, success };
};

/**
 * Hook para actualizar estado de reclamo (Admin)
 */
export const useUpdateClaim = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const updateClaim = async (claimId, updateData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await claimService.updateStatus(claimId, updateData);
      setSuccess(true);
      return result;
    } catch (err) {
      console.error('Error updating claim:', err);
      let errorMessage = 'Error al actualizar reclamo';
      
      try {
        const errorData = JSON.parse(err.message);
        errorMessage = Object.values(errorData).flat().join(', ');
      } catch {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateClaim, loading, error, success };
};

/**
 * Hook para agregar feedback
 */
export const useClaimFeedback = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const addFeedback = async (claimId, rating, feedback) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await claimService.addFeedback(claimId, rating, feedback);
      setSuccess(true);
      return result;
    } catch (err) {
      console.error('Error adding feedback:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { addFeedback, loading, error, success };
};
