import React from 'react';
import AllClaimsList from '../../components/claims/admin/AllClaimsList';

const AdminClaimsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Lista de Reclamos */}
        <AllClaimsList />
      </div>
    </div>
  );
};

export default AdminClaimsPage;
