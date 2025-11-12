import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import claimService from '../../services/claimService';
import ClaimDetail from '../../components/claims/ClaimDetail';
import AdminClaimUpdate from '../../components/claims/admin/AdminClaimUpdate';
import './AdminClaimDetailPage.css';

const AdminClaimDetailPage = () => {
  const { id } = useParams();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadClaim();
  }, [id]);

  const loadClaim = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await claimService.getClaimDetail(id);
      setClaim(data);
    } catch (error) {
      console.error('Error al cargar reclamo:', error);
      setError('No se pudo cargar el reclamo. Puede que no exista o no tengas permisos.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = (updatedClaim) => {
    setClaim(updatedClaim);
  };

  if (loading) {
    return (
      <div className="admin-claim-detail-page">
        <div className="admin-claim-loading">
          <div className="admin-claim-spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !claim) {
    return (
      <div className="admin-claim-detail-page">
        <div className="admin-claim-detail-container">
          <div className="admin-claim-error">
            <div className="admin-claim-error-icon">⚠️</div>
            <h2 className="admin-claim-error-title">Error al Cargar Reclamo</h2>
            <p className="admin-claim-error-message">
              {error || 'El reclamo solicitado no existe o no tienes permisos para verlo.'}
            </p>
            <Link to="/admin/claims" className="admin-claim-error-button">
              ← Volver a Reclamos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-claim-detail-page">
      <div className="admin-claim-detail-container">
        {/* Header */}
        <div className="admin-claim-detail-header">
          <h1 className="admin-claim-detail-title">
            Gestión de Reclamo #{claim.ticket_number}
          </h1>
          <p className="admin-claim-detail-subtitle">
            Panel de Administración
          </p>
        </div>
        
        {/* Grid Layout */}
        <div className="admin-claim-grid">
          {/* Panel de Actualización (Izquierda/Superior) */}
          <div className="admin-claim-update-panel">
            <div className="admin-claim-update-panel-header">
              <h2 className="admin-claim-update-panel-title">Actualizar Reclamo</h2>
            </div>
            <div className="admin-claim-update-panel-body">
              <AdminClaimUpdate claim={claim} onUpdate={handleUpdate} />
            </div>
          </div>
          
          {/* Panel de Detalle (Derecha/Inferior) */}
          <div className="admin-claim-detail-panel">
            <div className="admin-claim-detail-panel-header">
              <h2 className="admin-claim-detail-panel-title">Información del Reclamo</h2>
            </div>
            <div className="admin-claim-detail-panel-body">
              <ClaimDetail />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminClaimDetailPage;
