import React from 'react';
import CreateClaimForm from '../components/claims/CreateClaimForm';
import { useParams } from 'react-router-dom';

const CreateClaimPage = () => {
  const { orderId } = useParams();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <CreateClaimForm orderId={orderId} />
    </div>
  );
};

export default CreateClaimPage;
